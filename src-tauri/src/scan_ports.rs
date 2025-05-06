use crate::dirs;
use logger::error;
use serde_json::{json, Value};
use std::{
    io::{Error, ErrorKind, SeekFrom},
    path::{Path, PathBuf},
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::{
    fs::{self, File, OpenOptions},
    io::{AsyncReadExt, AsyncSeekExt, AsyncWriteExt, BufReader, BufWriter},
    net::{lookup_host, TcpStream},
    sync::{Mutex, Semaphore},
    task,
};

#[derive(Clone)]
struct AsyncThreadLimiter {
    semaphore: Arc<Semaphore>,
}

impl AsyncThreadLimiter {
    pub fn new(limit: usize) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(limit)),
        }
    }

    pub async fn acquire(&self) {
        self.semaphore.acquire().await.unwrap().forget();
    }

    pub fn release(&self) {
        self.semaphore.add_permits(1);
    }
}

async fn init_log_writer(path: &Path) -> Result<Arc<Mutex<BufWriter<File>>>, Error> {
    fs::File::create(path).await?;
    let file = OpenOptions::new().append(true).open(path).await?;
    Ok(Arc::new(Mutex::new(BufWriter::new(file))))
}

async fn log_port(log: &Arc<Mutex<BufWriter<File>>>, port: u16) {
    let mut writer = log.lock().await;
    if writer.write_all(format!("{}\n", port).as_bytes()).await.is_err() {
        error!("Failed to write log");
    }
    if writer.flush().await.is_err() {
        error!("Failed to flush log");
    }
}

async fn run_scan_ports(host: &str, start_port: u16, end_port: u16, max_threads: usize, timeout_ms: u64) -> Result<Value, Error> {
    let test_addr = format!("{}:0", host);
    if lookup_host(&test_addr).await.ok().and_then(|mut addrs| addrs.next()).is_none() {
        return Err(Error::new(ErrorKind::InvalidInput, format!("Failed to resolve hostname: {}", host)));
    }

    let logs_dir = dirs::get_dray_logs_dir().ok_or_else(|| Error::new(ErrorKind::NotFound, "log dir not found"))?;
    let open_log = init_log_writer(&logs_dir.join("scan_ports_open.log")).await?;
    let timeout_log = init_log_writer(&logs_dir.join("scan_ports_timeout.log")).await?;
    let refused_log = init_log_writer(&logs_dir.join("scan_ports_refused.log")).await?;

    let timeout = Duration::from_millis(timeout_ms);
    let start_time = Instant::now();
    let counter = Arc::new(Mutex::new((0, 0, 0)));
    let limiter = AsyncThreadLimiter::new(max_threads);

    let mut handles = vec![];

    for port in start_port..=end_port {
        let host = host.to_string();
        let limiter = limiter.clone();
        let open_log = open_log.clone();
        let timeout_log = timeout_log.clone();
        let refused_log = refused_log.clone();
        let counter = counter.clone();
        let timeout = timeout.clone();

        let handle = task::spawn(async move {
            limiter.acquire().await;
            let addr = format!("{}:{}", host, port);
            let sock_addr = lookup_host(addr).await.ok().and_then(|mut a| a.next());

            if let Some(sock_addr) = sock_addr {
                match tokio::time::timeout(timeout, TcpStream::connect(sock_addr)).await {
                    Ok(Ok(_)) => {
                        log_port(&open_log, port).await;
                        counter.lock().await.0 += 1;
                    }
                    Ok(Err(_)) => {
                        log_port(&refused_log, port).await;
                        counter.lock().await.1 += 1;
                    }
                    Err(_) => {
                        log_port(&timeout_log, port).await;
                        counter.lock().await.2 += 1;
                    }
                }
            }
            limiter.release();
        });

        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.await;
    }

    let elapsed = start_time.elapsed();
    let (open_count, refused_count, timeout_count) = *counter.lock().await;

    Ok(json!({
        "ok": true,
        "elapsed_secs": elapsed.as_secs_f64(),
        "open_count": open_count,
        "refused_count": refused_count,
        "timeout_count": timeout_count,
    }))
}

pub async fn start_scan_ports(host: &str, start_port: u16, end_port: u16, max_threads: usize, timeout_ms: u64) -> Value {
    match run_scan_ports(host, start_port, end_port, max_threads, timeout_ms).await {
        Ok(result) => result,
        Err(e) => {
            error!("Scan failed: {}", e);
            json!({ "ok": false, "error_message": e.to_string() })
        }
    }
}

pub async fn read_open_log() -> String {
    match get_log_path("scan_ports_open.log") {
        Some(path) => read_full_file(path.to_str().unwrap_or_default()).await,
        None => {
            error!("Open log path not found");
            String::new()
        }
    }
}

pub async fn read_timeout_log() -> String {
    match get_log_path("scan_ports_timeout.log") {
        Some(path) => read_tail_file(path.to_str().unwrap_or_default(), 100 * 1024).await,
        None => {
            error!("Timeout log path not found");
            String::new()
        }
    }
}

pub async fn read_refused_log() -> String {
    match get_log_path("scan_ports_refused.log") {
        Some(path) => read_tail_file(path.to_str().unwrap_or_default(), 100 * 1024).await,
        None => {
            error!("Refused log path not found");
            String::new()
        }
    }
}

fn get_log_path(filename: &str) -> Option<PathBuf> {
    dirs::get_dray_logs_dir().map(|dir| dir.join(filename))
}

async fn read_full_file(filepath: &str) -> String {
    match File::open(filepath).await {
        Ok(file) => {
            let mut reader = BufReader::new(file);
            let mut content = String::new();
            if reader.read_to_string(&mut content).await.is_ok() {
                content
            } else {
                error!("Failed to read full file '{}'", filepath);
                String::new()
            }
        }
        Err(e) => {
            error!("Failed to open file '{}': {}", filepath, e);
            String::new()
        }
    }
}

async fn read_tail_file(filepath: &str, max_bytes: u64) -> String {
    match File::open(filepath).await {
        Ok(mut file) => match file.metadata().await {
            Ok(meta) => {
                let file_size = meta.len();
                let seek_pos = file_size.saturating_sub(max_bytes);
                if file.seek(SeekFrom::Start(seek_pos)).await.is_err() {
                    error!("Failed to seek file '{}'", filepath);
                    return String::new();
                }

                let mut buffer = String::new();
                let mut reader = BufReader::new(file);
                if reader.read_to_string(&mut buffer).await.is_err() {
                    error!("Failed to read tail of file '{}'", filepath);
                    return String::new();
                }

                let mut lines = buffer.lines();
                lines.next();
                lines.collect::<Vec<_>>().join("\n")
            }
            Err(e) => {
                error!("Failed to get metadata for '{}': {}", filepath, e);
                String::new()
            }
        },
        Err(e) => {
            error!("Failed to open file '{}': {}", filepath, e);
            String::new()
        }
    }
}
