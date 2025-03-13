use crate::dirs;
// Initialize log, set storage path
pub fn init_log() {
    logger::set_log_filepath(dirs::get_dray_logs_dir().unwrap().join("dray.log").to_str().unwrap()).unwrap_or_else(|e| {
        eprintln!("Failed to set log file path: {}", e);
    });
}
