use logger::{error, info, debug};
use crate::command;
use crate::dirs;

pub fn start() -> bool {
	let home_dir = dirs::get_home_dir().unwrap_or_else(|| {
		error!("Failed to get user home directory");
		std::path::PathBuf::from(".")
	});
	let ray_bin_path = home_dir.join("dray").join("ray-bin");
	let ray_path: String = ray_bin_path.join("ray").to_str().unwrap_or("./ray-bin/ray").to_string();
	let ray_config_path: String = ray_bin_path.join("config.json").to_str().unwrap_or("./ray-bin/config.json").to_string();
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
