// 初始化日志，存放路径
pub fn init_log() {
	logger::set_log_filepath("logs/dray.log").unwrap_or_else(|e| {
		eprintln!("设置日志文件路径失败: {}", e);
	});
}
