use std::process::{Child, Command};
use std::sync::Mutex;
use logger::{error, info, debug};
use once_cell::sync::Lazy;
use crate::dirs;

static CHILD_PROCESS: Lazy<Mutex<Option<Child>>> = Lazy::new(|| Mutex::new(None));

pub fn start() -> bool {
	// 检查是否已有进程在运行
	if CHILD_PROCESS.lock().unwrap().is_some() {
		error!("Command is already running");
		return false;
	}

	// 获取路径
	let ray_dir = dirs::get_dray_ray_dir().unwrap();
	let ray_path: String = ray_dir.join("xray").to_str().unwrap().to_string();
	let ray_config_path: String = ray_dir.join("config.json").to_str().unwrap().to_string();
	debug!("ray_path: {}", ray_path);
	debug!("ray_config_path: {}", ray_config_path);

	// 启动命令
	let mut child_process = CHILD_PROCESS.lock().unwrap();
	let child = Command::new(&ray_path)
		.args(&["-c", &ray_config_path])
		.spawn()
		.map_err(|e| {
			error!("Failed to start command: {}", e);
		}).unwrap();

	// 保存子进程句柄
	*child_process = Some(child);
	info!("Ray Server started successfully");
	true
}

pub fn stop() -> bool {
	if let Some(mut child) = CHILD_PROCESS.lock().unwrap().take() {
		child.kill().unwrap();
		child.wait().unwrap();
		*CHILD_PROCESS.lock().unwrap() = None;
		info!("Ray Server stopped successfully");
		true
	} else {
		error!("Ray Server is not running, no need to stop");
		false
	}
}

pub fn force_restart_ray() -> bool {
	let mut child = CHILD_PROCESS.lock().unwrap();
	if child.is_some() {
		*child = None;
	}
	start()
}

fn force_kill_ray() -> bool {
	let mut sys = sysinfo::System::new_all();
	sys.refresh_all();

	let mut killed = false;
	for (pid, process) in sys.processes() {
		if process.name() == "xray" {
			if process.kill() {
				error!("Failed to kill xray process with PID: {}", pid);
				return false;
			}
			info!("Killed xray process with PID: {}", pid);
			killed = true;
			break;
		}
	}
	if !killed {
		error!("No xray process found to kill");
		return false;
	}
	true
}
