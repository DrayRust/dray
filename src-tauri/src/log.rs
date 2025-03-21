use crate::config;
use crate::dirs;
use chrono::Local;
use logger::{error, info};
use std::fs::{self, OpenOptions};
use std::io::{BufWriter, Write};

pub fn init() {
    let config = config::get_config();
    logger::set_log_level(&config.app_log_level);

    if &config.app_log_level.to_lowercase() != "none" {
        logger::set_log_filepath(dirs::get_dray_logs_dir().unwrap().join("dray.log").to_str().unwrap()).unwrap_or_else(|e| {
            eprintln!("Failed to set log file path: {}", e);
        });
    }
}

pub fn ensure_log_dir() -> bool {
    let log_dir = dirs::get_dray_conf_dir().unwrap();
    if !log_dir.exists() {
        if let Err(e) = fs::create_dir_all(&log_dir) {
            error!("Failed to create log directory: {}", e);
            return false;
        }
        info!("Log directory ensured");
    }
    true
}

static LOG_WEB_INTERFACE_FILE: once_cell::sync::OnceCell<std::path::PathBuf> = once_cell::sync::OnceCell::new();

pub fn write_web_interface_log(log_msg: &str) -> bool {
    if !ensure_log_dir() {
        return false;
    }

    let log_file = LOG_WEB_INTERFACE_FILE.get_or_init(|| dirs::get_dray_logs_dir().unwrap().join("web_interface.log"));

    match OpenOptions::new().create(true).append(true).open(log_file) {
        Ok(file) => {
            let mut writer = BufWriter::new(file);
            let now = Local::now().format("%Y-%m-%d %H:%M:%S");
            if let Err(e) = writeln!(writer, "{} {}", now, log_msg) {
                error!("Failed to write log: {}", e);
                return false;
            }
            if let Err(e) = writer.flush() {
                error!("Failed to flush log writer: {}", e);
                return false;
            }
            true
        }
        Err(e) => {
            error!("Failed to open log file: {}", e);
            false
        }
    }
}

pub fn read_all_logs_list() -> String {
    let log_dir = match dirs::get_dray_logs_dir() {
        Some(dir) => dir,
        None => {
            error!("Failed to get logs directory");
            return serde_json::json!({"error": "Failed to get logs directory"}).to_string();
        }
    };

    let mut logs = Vec::new();
    let mut total_size = 0;

    // 读取目录下的所有文件
    if let Ok(entries) = fs::read_dir(log_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() && path.extension().map_or(false, |ext| ext == "log") {
                    if let Ok(metadata) = fs::metadata(&path) {
                        let file_size = metadata.len();
                        total_size += file_size;
                        logs.push(serde_json::json!({
                            "filename": path.file_name().unwrap().to_string_lossy(),
                            "size": file_size,
                            "last_modified": metadata.modified().unwrap(),
                        }));
                    } else {
                        error!("Failed to get metadata for file: {}", path.display());
                    }
                }
            }
        }
    }

    // 返回 JSON 格式的数据
    serde_json::json!({
        "total_files": logs.len(),
        "total_size": total_size,
        "logs": logs
    })
    .to_string()
}
