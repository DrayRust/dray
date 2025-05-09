use crate::config;
use crate::dirs;
use logger::{debug, error, info, trace, warn};
use once_cell::sync::Lazy;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::Instant;

// static CHILD_PROCESS: Mutex<Option<Child>> = Mutex::new(None);
static CHILD_PROCESS_MAP: Lazy<Mutex<HashMap<u16, Option<Child>>>> = Lazy::new(|| Mutex::new(HashMap::new()));
const RAY: &str = "xray";

pub fn start() -> bool {
    /* if CHILD_PROCESS.lock().unwrap().is_some() {
        error!("Ray Server is already running");
        return false;
    } */

    std::thread::spawn(|| run_server());
    true
}

fn run_server() {
    let ray_path = get_ray_exe();
    let ray_conf = get_ray_config_path();
    debug!("ray_path: {}", ray_path);
    debug!("ray_conf: {}", ray_conf);

    let mut child = match Command::new(&ray_path)
        .args(&["run", "-c", &ray_conf])
        .stdout(Stdio::piped()) // 捕获标准输出
        .stderr(Stdio::piped()) // 捕获标准错误
        .spawn()
    {
        Ok(child) => child,
        Err(e) => {
            error!("Failed to start Ray Server: {:?}", e);
            return;
        }
    };

    info!("Ray Server started with PID: {}", child.id());

    let log_file_path = dirs::get_dray_logs_dir().unwrap().join("xray_server.log");
    let mut log_file = match fs::OpenOptions::new().create(true).write(true).truncate(true).open(log_file_path) {
        Ok(file) => file,
        Err(e) => {
            error!("Failed to open log file: {}", e);
            return;
        }
    };

    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                let log_message = format!("Ray Server stdout: {}\n", line.trim());
                trace!("{}", log_message.trim());
                if let Err(e) = log_file.write_all(log_message.as_bytes()) {
                    error!("Failed to write to log file: {}", e);
                }
            }
        }
    }

    if let Some(stderr) = child.stderr.take() {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                let log_message = format!("Ray Server stderr: {}\n", line.trim());
                error!("{}", log_message.trim());
                if let Err(e) = log_file.write_all(log_message.as_bytes()) {
                    error!("Failed to write to log file: {}", e);
                }
            }
        }
    }

    // *CHILD_PROCESS.lock().unwrap() = Some(child);
    info!("Ray Server exited");
}

pub fn start_speed_test_server(port: u16, filename: &str) -> bool {
    let mut map = CHILD_PROCESS_MAP.lock().unwrap();
    if map.contains_key(&port) {
        warn!("Speed test server is already running, port: {}", port);
        return false;
    }

    let ray_conf = dirs::get_dray_conf_dir().unwrap().join("speed_test").join(filename);
    if !ray_conf.exists() {
        error!("Failed to filename not exist: {}", filename);
        return false;
    }

    let ray_path = get_ray_exe();
    let ray_conf = ray_conf.to_str().unwrap().to_string();
    debug!("Speed test server ray_path: {}", ray_path);
    debug!("Speed test server ray_conf: {}", ray_conf);

    let child = match Command::new(&ray_path)
        .args(&["run", "-c", &ray_conf])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
    {
        Ok(child) => child,
        Err(e) => {
            error!("Failed to start speed test server: {:?}", e);
            return false;
        }
    };

    info!("Speed test server started with PID: {}", child.id());

    map.insert(port, Some(child));
    true
}

pub fn stop_speed_test_server(port: u16) -> bool {
    let mut map = CHILD_PROCESS_MAP.lock().unwrap();
    if !map.contains_key(&port) {
        warn!("Speed test server is not running, port: {}", port);
        return false;
    }

    if let Some(child_option) = map.remove(&port) {
        if let Some(mut child) = child_option {
            if let Err(e) = child.kill() {
                error!("Failed to kill speed test server: {}", e);
                map.insert(port, Some(child)); // 如果 kill 失败，将子进程重新插入到 map 中
                return false;
            }
            if let Err(e) = child.wait() {
                error!("Failed to wait for speed test server to terminate: {}", e);
                return false;
            }
            info!("Speed test server stopped successfully, map len: {}", map.len());
            true
        } else {
            error!("Failed to retrieve child process from map, port: {}", port);
            false
        }
    } else {
        error!("Failed to remove server from map, port: {}", port);
        false
    }
}

// 开发过程中，经常自动停止并编译程序，导致无法停止 Command 运行的进程
/* pub fn stop() -> bool {
    let child_process = CHILD_PROCESS.lock().unwrap().take();
    if let Some(mut child) = child_process {
        if let Err(e) = child.kill() {
            error!("Failed to kill Ray Server: {}", e);
            *CHILD_PROCESS.lock().unwrap() = Some(child);
            return false;
        }
        if let Err(e) = child.wait() {
            error!("Failed to wait for Ray Server to terminate: {}", e);
            return false;
        }
        info!("Ray Server stopped successfully");
        true
    } else {
        error!("Failed to take child process");
        false
    }
} */

// 通过遍历的方式停止进程，保证完全停止进程
pub fn force_kill() -> bool {
    let start = Instant::now();
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    trace!("Sysinfo new and refresh all, time elapsed: {:?}", start.elapsed());

    let mut success = true;
    let mut n = 0;
    for (pid, process) in sys.processes() {
        // 特别注意：linux 系统下 name 获取的名字不会超过 15 个字符
        if process.name() == RAY {
            // 防止误杀非 dray 运行的进程
            let ray_exe = process.exe().map_or_else(
                || {
                    warn!("Failed to get executable path for process with PID: {}", pid);
                    "".to_string()
                },
                |v| v.to_string_lossy().into_owned(),
            );
            if ray_exe == "" || (ray_exe.ends_with(RAY) && ray_exe.contains("dray")) {
                n += 1;
                if process.kill() {
                    info!("Killed xray process with PID: {}", pid);
                } else {
                    error!("Failed to kill xray process with PID: {}", pid);
                    success = false;
                }
            }
        }
    }
    trace!("Time elapsed: {:?}, processes: {}, rays: {}", start.elapsed(), sys.processes().len(), n);
    // *CHILD_PROCESS.lock().unwrap() = None;
    success
}

pub fn restart() -> bool {
    let config = config::get_config();
    if !config.ray_enable {
        return false;
    }

    let success = force_kill() && start();
    if success {
        info!("Ray Server restarted successfully");
    } else {
        error!("Ray Server restart failed");
    }
    success
}

pub fn get_ray_version() -> String {
    let ray_path = get_ray_exe();
    trace!("Trying to get Ray version, path: {}", ray_path);

    let output = Command::new(ray_path).arg("version").stdout(Stdio::piped()).stderr(Stdio::piped()).output();

    match output {
        Ok(output) => {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                // trace!("Ray version output: {}", stdout);
                stdout.lines().next().unwrap_or("").trim().to_string()
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                error!("Failed to get version, stderr: {}", stderr);
                String::new()
            }
        }
        Err(e) => {
            error!("Failed to execute `version` command: {:?}", e);
            String::new()
        }
    }
}

fn get_ray_exe() -> String {
    dirs::get_dray_ray_dir().unwrap().join(RAY).to_str().unwrap().to_string()
}

fn get_ray_config_path() -> String {
    dirs::get_dray_conf_dir().unwrap().join("ray_config.json").to_str().unwrap().to_string()
}

pub fn read_ray_config() -> Value {
    debug!("read_ray_config triggered");
    let config_path = get_ray_config_path();
    match fs::read_to_string(config_path) {
        Ok(content) => match serde_json::from_str(&content) {
            Ok(value) => value,
            Err(e) => {
                error!("Failed to parse config file: {}", e);
                json!(null)
            }
        },
        Err(e) => {
            error!("Failed to read config file: {}", e);
            json!(null)
        }
    }
}

pub fn save_ray_config(content: &str) -> bool {
    let config_path = get_ray_config_path();
    match fs::File::create(config_path) {
        Ok(mut file) => {
            if let Err(e) = file.write_all(content.as_bytes()) {
                error!("Failed to write config file: {}", e);
                return false;
            }
            info!("Ray config saved successfully");
            true
        }
        Err(e) => {
            error!("Failed to create config file: {}", e);
            false
        }
    }
}
