mod command;
mod web;
use log::{error, info};

fn init_log() {
    log::set_log_filepath("logs/main.log").unwrap_or_else(|e| {
        eprintln!("设置日志文件路径失败: {}", e);
    });
}

#[tauri::command]
fn dray(name: &str) -> String {
    info!("dray 触发");
    format!("Hello, {}! Do you know Dray is great?", name)
}

#[tauri::command]
fn start_web() -> String {
    info!("web_start 触发");
    if let Err(e) = web::start("127.0.0.1", 8687) {
        error!("Web Server 启动失败: {}", e);
    } else {
        info!("Web Server 启动成功");
    }
    "web_start send ok!".to_string()
}

#[tauri::command]
fn stop_web() -> String {
    info!("web_stop 触发");
    if let Err(e) = web::stop() {
        error!("Web Server 关闭失败: {}", e);
    } else {
        info!("Web Server 关闭成功");
    }
    "stop_web send ok!".to_string()
}

#[tauri::command]
fn start_ray() -> String {
    info!("start_ray 触发");
    if let Err(e) = command::start("./ray-bin/ray", &["-c", "./ray-bin/config.json"]) {
        error!("Ray Server 启动失败: {}", e);
    } else {
        info!("Ray Server 启动成功");
    }
    "start_ray send ok!".to_string()
}

#[tauri::command]
fn stop_ray() -> String {
    info!("stop_ray 触发");
    if let Err(e) = command::stop() {
        error!("Ray Server 启动失败: {}", e);
    } else {
        info!("Ray Server 启动成功");
    }
    "stop_ray send ok!".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    init_log();
    info!("Dray 启动");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            dray, start_web, stop_web, start_ray, stop_ray
        ])
        .run(tauri::generate_context!())
        .expect("error while running dray application");
}
