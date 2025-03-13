use std::process::Command;
use std::sync::Mutex;
use logger::{error, info, debug};
use once_cell::sync::Lazy;
use crate::dirs;

static SERVER_HANDLE: Lazy<Mutex<Option<tauri::async_runtime::JoinHandle<()>>>> = Lazy::new(|| Mutex::new(None));

pub fn start() -> bool {
	if SERVER_HANDLE.lock().unwrap().is_some() {
		error!("Ray Server is already running");
		return false;
	}

	*SERVER_HANDLE.lock().unwrap() = Some(tauri::async_runtime::spawn(async {
		run_server().await.unwrap();
	}));
	info!("Ray Server started successfully");
	true
}

async fn run_server() -> Result<(), Box<dyn std::error::Error>> {
	let ray_dir = dirs::get_dray_ray_dir().unwrap();
	let ray_path: String = ray_dir.join("xray").to_str().unwrap().to_string();
	let ray_config_path: String = ray_dir.join("config.json").to_str().unwrap().to_string();
	debug!("ray_path: {}", ray_path);
	debug!("ray_config_path: {}", ray_config_path);
	if let Err(e) = Command::new(&ray_path).args(&["-c", &ray_config_path]).output() {
		error!("Ray Server run error: {}", e);
	} else {
		info!("Ray Server has stopped running");
	}
	Ok(())
}

pub fn stop() -> bool {
	let mut server_handle = SERVER_HANDLE.lock().unwrap();
	if let Some(handle) = server_handle.take() {
		handle.abort();
		info!("Ray Server stopped successfully");
		true
	} else {
		error!("Ray Server is not running, no need to stop");
		false
	}
}

pub fn force_restart_ray() -> bool {
	if SERVER_HANDLE.lock().unwrap().is_some() {
		*SERVER_HANDLE.lock().unwrap() = None;
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
	*SERVER_HANDLE.lock().unwrap() = None;
	killed
}
