use logger::{error, info};
use crate::command;
use crate::dirs;

pub fn start() -> bool {
	let home_dir = dirs::get_home_dir().unwrap_or_else(|| {
		error!("无法获取用户主目录");
		std::path::PathBuf::from(".")
	});
	let ray_path = home_dir.join("dray").join("ray-bin").join("ray").to_str().unwrap_or("./ray-bin/ray");
	let config_path = home_dir.join("dray").join("ray-bin").join("config.json").to_str().unwrap_or("./ray-bin/config.json");

	if let Err(e) = command::start(ray_path, &["-c", config_path]) {
		error!("启动 Ray Server 失败: {}", e);
		false
	} else {
		info!("启动 Ray Server 成功");
		true
	}
}

pub fn stop() -> bool {
	if let Err(e) = command::stop() {
		error!("停止 Ray Server 失败: {}", e);
		false
	} else {
		info!("停止 Ray Server 成功");
		true
	}
}
