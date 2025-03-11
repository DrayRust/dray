// Initialize log, set storage path
pub fn init_log() {
	let home_dir = dirs::home_dir().unwrap_or_else(|| {
		eprintln!("Failed to get user home directory");
		std::path::PathBuf::from(".")
	});
	let log_path = home_dir.join("dray").join("logs").join("dray.log");
	logger::set_log_filepath(log_path.to_str().unwrap_or("logs/dray.log")).unwrap_or_else(|e| {
		eprintln!("Failed to set log file path: {}", e);
	});
}
