use logger::{error, info};
use crate::command;

pub fn start() -> bool {
	if let Err(e) = command::start("./ray-bin/ray", &["-c", "./ray-bin/config.json"]) {
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
