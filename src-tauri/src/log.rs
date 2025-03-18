use crate::config;
use crate::dirs;

pub fn init() {
    let config = config::get_config();
    logger::set_log_level(&config.app_log_level);

    if &config.app_log_level.to_lowercase() != "none" {
        logger::set_log_filepath(dirs::get_dray_logs_dir().unwrap().join("dray.log").to_str().unwrap()).unwrap_or_else(|e| {
            eprintln!("Failed to set log file path: {}", e);
        });
    }
}
