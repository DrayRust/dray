use crate::config;
use crate::dirs;
use chrono::{Local, TimeZone};
use logger::{error, info};
use std::fs::{self, File, OpenOptions};
use std::io::{BufWriter, Read, Seek, SeekFrom, Write};

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

pub fn write_web_interface_log(log_msg: &str) -> bool {
    if !ensure_log_dir() {
        return false;
    }

    static LOG_WEB_INTERFACE_FILE: once_cell::sync::OnceCell<std::path::PathBuf> = once_cell::sync::OnceCell::new();
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

pub fn read_logs_all_list() -> String {
    let mut logs = Vec::new();

    // 读取目录下的所有文件
    let log_dir = dirs::get_dray_logs_dir().unwrap();
    if let Ok(entries) = fs::read_dir(log_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() && path.extension().map_or(false, |ext| ext == "log") {
                    if let Ok(metadata) = fs::metadata(&path) {
                        logs.push(serde_json::json!({
                            "filename": path.file_name().unwrap().to_string_lossy(),
                            "size": metadata.len(),
                            "last_modified": metadata.modified().map_or("0000-00-00 00:00:00".to_string(), |t| format_timestamp(t)),
                        }));
                    } else {
                        error!("Failed to get metadata for file: {}", path.display());
                    }
                }
            }
        }
    }

    serde_json::json!(logs).to_string()
}

fn format_timestamp(modified_time: std::time::SystemTime) -> String {
    match modified_time.duration_since(std::time::UNIX_EPOCH) {
        Ok(system_time) => match Local.timestamp_opt(system_time.as_secs() as i64, system_time.subsec_nanos()) {
            chrono::LocalResult::Single(dt) => dt.format("%Y-%m-%d %H:%M:%S").to_string(),
            _ => "0000-00-00 00:00:00".to_string(),
        },
        Err(_) => "0000-00-00 00:00:00".to_string(),
    }
}

pub fn read_log_file_tail(filename: &str, tail_lines: usize) -> String {
    let file_path = dirs::get_dray_logs_dir().unwrap().join(filename);
    let mut file = match File::open(&file_path) {
        Ok(file) => file,
        Err(e) => {
            error!("Failed to open log file {}: {}", file_path.display(), e);
            return serde_json::json!([]).to_string();
        }
    };

    let file_size = match file.seek(SeekFrom::End(0)) {
        Ok(size) => size,
        Err(e) => {
            error!("Failed to get file size: {}", e);
            return serde_json::json!([]).to_string();
        }
    };

    // 从文件末尾开始读取，最多读取1MB数据
    let start_position = if file_size > 1024 * 1024 { file_size - 1024 * 1024 } else { 0 };

    if let Err(e) = file.seek(SeekFrom::Start(start_position)) {
        error!("Failed to seek file: {}", e);
        return serde_json::json!([]).to_string();
    }

    let mut buffer = vec![0; (file_size - start_position) as usize];
    let bytes_read = match file.read(&mut buffer) {
        Ok(size) => size,
        Err(e) => {
            error!("Failed to read file: {}", e);
            return serde_json::json!([]).to_string();
        }
    };
    buffer.truncate(bytes_read);

    let content = match String::from_utf8(buffer) {
        Ok(s) => s,
        Err(e) => {
            error!("Failed to convert bytes to string: {}", e);
            return serde_json::json!([]).to_string();
        }
    };

    let lines: Vec<&str> = content.lines().collect();
    let start_line = if lines.len() > tail_lines { lines.len() - tail_lines } else { 0 };

    let result: Vec<&str> = lines[start_line..].to_vec();
    serde_json::json!(result).to_string()
}

pub fn clear_log_all_files() -> bool {
    let mut success = true;
    let log_dir = dirs::get_dray_logs_dir().unwrap();
    if let Ok(entries) = fs::read_dir(log_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() && path.extension().map_or(false, |ext| ext == "log") {
                    if !clear_log_file(&path) {
                        success = false;
                    }
                }
            }
        }
    }
    success
}

fn clear_log_file(path: &std::path::Path) -> bool {
    match OpenOptions::new().write(true).truncate(true).open(path) {
        Ok(_) => true,
        Err(e) => {
            error!("Failed to clear file {}: {}", path.display(), e);
            false
        }
    }
}
