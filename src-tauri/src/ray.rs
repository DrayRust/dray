use crate::{config, dirs};
use logger::{debug, error, info};
use std::fs;
use std::io::BufRead;
use std::io::Write;
use std::process::{Child, Command};
use std::sync::Mutex;

const DRAY_XRAY: &str = "dray-xray"; // 专用文件名，防止误杀其他 xray 进程
static CHILD_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

pub fn start() -> bool {
    if CHILD_PROCESS.lock().unwrap().is_some() {
        error!("Ray Server is already running");
        return false;
    }

    let ray_dir = dirs::get_dray_ray_dir().unwrap();
    let ray_path: String = ray_dir.join(DRAY_XRAY).to_str().unwrap().to_string();
    let ray_config_path: String = ray_dir.join("config.json").to_str().unwrap().to_string();
    debug!("ray_path: {}", ray_path);
    debug!("ray_config_path: {}", ray_config_path);

    let mut child = match Command::new(&ray_path)
        .args(&["run", "-c", &ray_config_path])
        .stdout(std::process::Stdio::piped()) // 捕获标准输出
        .stderr(std::process::Stdio::piped()) // 捕获标准错误
        .spawn()
    {
        Ok(child) => child,
        Err(e) => {
            error!("Failed to start Ray Server: {:?}", e);
            return false;
        }
    };

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    std::thread::spawn(move || {
        handle_logs(stdout, stderr);
    });

    info!("Ray Server started with PID: {}", child.id());
    *CHILD_PROCESS.lock().unwrap() = Some(child);
    true
}

fn handle_logs(stdout: std::process::ChildStdout, stderr: std::process::ChildStderr) {
    let mut stdout_reader = std::io::BufReader::new(stdout);
    let mut stderr_reader = std::io::BufReader::new(stderr);
    let mut stdout_line = String::new();
    let mut stderr_line = String::new();

    let log_file_path = dirs::get_dray_logs_dir().unwrap().join("ray_server.log");
    let mut log_file = fs::OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(log_file_path)
        .expect("Failed to open log file");

    loop {
        stdout_line.clear();
        stderr_line.clear();

        let stdout_result = stdout_reader.read_line(&mut stdout_line);
        let stderr_result = stderr_reader.read_line(&mut stderr_line);

        if let Ok(_) = stdout_result {
            if !stdout_line.is_empty() {
                let log_message = format!("Ray Server stdout: {}\n", stdout_line.trim());
                info!("{}", log_message.trim());
                if let Err(e) = log_file.write_all(log_message.as_bytes()) {
                    error!("Failed to write to log file: {}", e);
                }
            }
        }

        if let Ok(_) = stderr_result {
            if !stderr_line.is_empty() {
                let log_message = format!("Ray Server stderr: {}\n", stderr_line.trim());
                error!("{}", log_message.trim());
                if let Err(e) = log_file.write_all(log_message.as_bytes()) {
                    error!("Failed to write to log file: {}", e);
                }
            }
        }

        if stdout_result.is_err() && stderr_result.is_err() {
            break;
        }
    }
}

pub fn stop() -> bool {
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
        error!("Ray Server is not running, no need to stop");
        false
    }
}

pub fn force_kill() -> bool {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();

    let mut success = true;
    for (pid, process) in sys.processes() {
        if process.name() == DRAY_XRAY {
            if process.kill() {
                info!("Killed xray process with PID: {}", pid);
            } else {
                error!("Failed to kill xray process with PID: {}", pid);
                success = false;
            }
        }
    }
    *CHILD_PROCESS.lock().unwrap() = None;
    success
}

pub fn restart() -> bool {
    let config = config::get_config();
    let stop_success = if config.ray_force_kill { force_kill() } else { stop() };
    let success = stop_success && start();
    if success {
        info!("Ray Server restarted successfully");
    } else {
        error!("Ray Server restart failed");
    }
    success
}

fn get_ray_config_path() -> String {
    dirs::get_dray_ray_dir().unwrap().join("config.json").to_str().unwrap().to_string()
}

pub fn read_ray_config() -> String {
    debug!("read_ray_config triggered");
    let config_path = get_ray_config_path();
    fs::read_to_string(config_path).unwrap_or_else(|e| {
        error!("Failed to read config file: {}", e);
        "{}".to_string()
    })
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
