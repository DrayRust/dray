use crate::dirs;
use logger::error;
use serde_json::{json, Value};
use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::{Duration, Instant};

struct ThreadLimiter {
    limit: usize,
    running: Mutex<usize>,
    condvar: Condvar,
}

struct Permit<'a> {
    limiter: &'a ThreadLimiter,
}

impl<'a> Drop for Permit<'a> {
    fn drop(&mut self) {
        let mut running = self.limiter.running.lock().unwrap();
        *running -= 1;
        self.limiter.condvar.notify_one();
    }
}

impl ThreadLimiter {
    fn new(limit: usize) -> Self {
        Self {
            limit,
            running: Mutex::new(0),
            condvar: Condvar::new(),
        }
    }

    fn acquire(&self) -> Permit {
        let mut running = self.running.lock().unwrap();
        while *running >= self.limit {
            running = self.condvar.wait(running).unwrap();
        }
        *running += 1;
        Permit { limiter: self }
    }
}

pub fn scan_ports(host: &str, start_port: u16, end_port: u16, max_threads: usize, timeout_ms: u64) -> Value {
    match run_scan_ports(host, start_port, end_port, max_threads, timeout_ms) {
        Ok(result) => result,
        Err(e) => {
            error!("Scan failed: {}", e);
            json!({
                "ok": false,
                "error_message": e.to_string()
            })
        }
    }
}

pub fn run_scan_ports(host: &str, start_port: u16, end_port: u16, max_threads: usize, timeout_ms: u64) -> Result<Value, std::io::Error> {
    let logs_dir = dirs::get_dray_logs_dir().ok_or_else(|| std::io::Error::new(std::io::ErrorKind::NotFound, "log dir not found"))?;

    let open_log_path = logs_dir.join("scan_ports_open.log");
    let timeout_log_path = logs_dir.join("scan_ports_timeout.log");
    let refused_log_path = logs_dir.join("scan_ports_refused.log");

    File::create(&open_log_path)?;
    File::create(&timeout_log_path)?;
    File::create(&refused_log_path)?;

    let create_log_writer = |path: &std::path::Path| -> Result<Arc<Mutex<BufWriter<File>>>, std::io::Error> {
        Ok(Arc::new(Mutex::new(BufWriter::new(OpenOptions::new().append(true).open(path)?))))
    };

    let open_log = create_log_writer(&open_log_path)?;
    let timeout_log = create_log_writer(&timeout_log_path)?;
    let refused_log = create_log_writer(&refused_log_path)?;

    let timeout = Duration::from_millis(timeout_ms);
    let start_time = Instant::now();
    let counter = Arc::new(Mutex::new((0, 0, 0))); // (open, timeout, refused)
    let limiter = Arc::new(ThreadLimiter::new(max_threads));

    let mut handles = vec![];

    for port in start_port..=end_port {
        let host = host.to_string();
        let open_log = Arc::clone(&open_log);
        let timeout_log = Arc::clone(&timeout_log);
        let refused_log = Arc::clone(&refused_log);
        let counter = Arc::clone(&counter);
        let limiter = Arc::clone(&limiter);
        let timeout = timeout.clone();

        let handle = thread::spawn(move || {
            let _permit = limiter.acquire();

            let addr = format!("{}:{}", host, port);
            if let Ok(mut addrs) = addr.to_socket_addrs() {
                if let Some(sock_addr) = addrs.next() {
                    match TcpStream::connect_timeout(&sock_addr, timeout) {
                        Ok(_) => {
                            let line = format!("{}\n", port);
                            if let Ok(mut log) = open_log.lock() {
                                if let Err(e) = log.write_all(line.as_bytes()) {
                                    error!("Failed to write open log: {}", e);
                                }
                            }
                            counter.lock().unwrap().0 += 1;
                        }
                        Err(e) => {
                            let kind = e.kind();
                            if kind == std::io::ErrorKind::TimedOut {
                                let line = format!("{}\n", port);
                                if let Ok(mut log) = timeout_log.lock() {
                                    if let Err(e) = log.write_all(line.as_bytes()) {
                                        error!("Failed to write timeout log: {}", e);
                                    }
                                }
                                counter.lock().unwrap().1 += 1;
                            } else {
                                let line = format!("Port {} refused ({})\n", port, kind);
                                if let Ok(mut log) = refused_log.lock() {
                                    if let Err(e) = log.write_all(line.as_bytes()) {
                                        error!("Failed to write refused log: {}", e);
                                    }
                                }
                                counter.lock().unwrap().2 += 1;
                            }
                        }
                    }
                }
            }
        });

        handles.push(handle);
    }

    for handle in handles {
        let _ = handle.join();
    }

    let elapsed = start_time.elapsed();
    let (open_count, timeout_count, refused_count) = *counter.lock().unwrap();

    Ok(json!({
        "ok": true,
        "elapsed_secs": elapsed.as_secs_f64(),
        "open_count": open_count,
        "timeout_count": timeout_count,
        "refused_count": refused_count,
    }))
}
