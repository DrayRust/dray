use crate::dirs;
use logger::{debug, error, info, trace};
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::process::{Command, Stdio};
// use std::sync::Mutex;

const DRAY_XRAY: &str = "dray-xray"; // 专用文件名，防止误杀其他 xray 进程

// static CHILD_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

pub fn start() -> bool {
    /* if CHILD_PROCESS.lock().unwrap().is_some() {
        error!("Ray Server is already running");
        return false;
    } */

    std::thread::spawn(|| run_server());
    true
}

fn run_server() {
    let ray_path: String = dirs::get_dray_ray_dir().unwrap().join(DRAY_XRAY).to_str().unwrap().to_string();
    let ray_config_path: String = get_ray_config_path();
    debug!("ray_path: {}", ray_path);
    debug!("ray_conf: {}", ray_config_path);

    let mut child = match Command::new(&ray_path)
        .args(&["run", "-c", &ray_config_path])
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

    let log_file_path = dirs::get_dray_logs_dir().unwrap().join("ray_server.log");
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
        error!("Ray Server is not running, no need to stop");
        false
    }
} */

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
    // *CHILD_PROCESS.lock().unwrap() = None;
    success
}

pub fn restart() -> bool {
    let success = force_kill() && start();
    if success {
        info!("Ray Server restarted successfully");
    } else {
        error!("Ray Server restart failed");
    }
    success
}

fn get_ray_config_path() -> String {
    dirs::get_dray_conf_dir().unwrap().join("ray_config.json").to_str().unwrap().to_string()
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
