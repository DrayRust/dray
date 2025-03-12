use logger::{error, info, debug};
use crate::command;
use crate::dirs;

pub fn start() -> bool {
	let ray_dir = dirs::get_dray_ray_dir().unwrap();
	let ray_path: String = ray_dir.join("xray").to_str().unwrap().to_string();
	let ray_config_path: String = ray_dir.join("config.json").to_str().unwrap().to_string();
	debug!("ray_path: {}", ray_path);
	debug!("ray_config_path: {}", ray_config_path);

	if let Err(e) = command::start(&*ray_path, &["-c", &*ray_config_path]) {
		error!("Failed to start Ray Server: {}", e);
		false
	} else {
		info!("Ray Server started successfully");
		true
	}
}

pub fn stop() -> bool {
	if let Err(e) = command::stop() {
		error!("Failed to stop Ray Server: {}", e);
		false
	} else {
		info!("Ray Server stopped successfully");
		true
	}
}
