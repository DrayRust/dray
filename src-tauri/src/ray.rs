use std::process::{Child, Command};
use std::sync::Mutex;
use logger::{error, info, debug};
use crate::dirs;

static CHILD_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

pub fn start() -> bool {
	if CHILD_PROCESS.lock().unwrap().is_some() {
		error!("Ray Server is already running");
		return false;
	}

	let ray_dir = dirs::get_dray_ray_dir().unwrap();
	let ray_path: String = ray_dir.join("xray").to_str().unwrap().to_string();
	let ray_config_path: String = ray_dir.join("config.json").to_str().unwrap().to_string();
	debug!("ray_path: {}", ray_path);
	debug!("ray_config_path: {}", ray_config_path);

	let child = Command::new(&ray_path).args(&["-c", &ray_config_path]).spawn().unwrap();
	*CHILD_PROCESS.lock().unwrap() = Some(child);
	info!("Ray Server started successfully");
	true
}

pub fn stop() -> bool {
	if let Some(mut child) = CHILD_PROCESS.lock().unwrap().take() {
		if let Err(e) = child.kill() {
			error!("Failed to kill Ray Server: {}", e);
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
	force_kill_ray();
	if !start() {
		error!("Failed to start Ray Server");
		return false;
	}
	info!("Ray Server force restarted successfully");
	true
}

pub fn force_kill_ray() -> bool {
	let mut sys = sysinfo::System::new_all();
	sys.refresh_all();

	let mut killed = true;
	for (pid, process) in sys.processes() {
		if process.name() == "xray" {
			if process.kill() {
				info!("Killed xray process with PID: {}", pid);
			} else {
				error!("Failed to kill xray process with PID: {}", pid);
				killed = false;
			}
		}
	}
	killed
}
