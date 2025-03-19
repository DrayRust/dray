use crate::dirs;
use logger::{debug, error, info};
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

    let child = match Command::new(&ray_path)
        .args(&["run", "-c", &ray_config_path])
        // .stdout(std::process::Stdio::piped()) // 捕获标准输出
        // .stderr(std::process::Stdio::piped()) // 捕获标准错误
        .spawn()
    {
        Ok(child) => child,
        Err(e) => {
            error!("Failed to start Ray Server: {:?}", e);
            return false;
        }
    };

    info!("Ray Server started with PID: {}", child.id());
    *CHILD_PROCESS.lock().unwrap() = Some(child);
    true
}

pub fn stop() -> bool {
    let child_opt = CHILD_PROCESS.lock().unwrap().take();
    if let Some(mut child) = child_opt {
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

pub fn force_restart_ray() -> bool {
    if CHILD_PROCESS.lock().unwrap().is_some() {
        *CHILD_PROCESS.lock().unwrap() = None;
    }
    force_kill();
    if !start() {
        error!("Failed to start Ray Server");
        return false;
    }
    info!("Ray Server force restarted successfully");
    true
}

pub fn force_kill() -> bool {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();

    let mut killed = true;
    for (pid, process) in sys.processes() {
        if process.name() == DRAY_XRAY {
            if process.kill() {
                info!("Killed xray process with PID: {}", pid);
            } else {
                error!("Failed to kill xray process with PID: {}", pid);
                killed = false;
            }
        }
    }
    *CHILD_PROCESS.lock().unwrap() = None;
    killed
}
