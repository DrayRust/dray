// 初始化日志，存放路径
pub fn init_log() {
	let home_dir = dirs::home_dir().unwrap_or_else(|| {
		eprintln!("无法获取用户主目录");
		std::path::PathBuf::from(".")
	});
	let log_path = home_dir.join("dray").join("logs").join("dray.log");
	logger::set_log_filepath(log_path.to_str().unwrap_or("logs/dray.log")).unwrap_or_else(|e| {
		eprintln!("设置日志文件路径失败: {}", e);
	});
}
