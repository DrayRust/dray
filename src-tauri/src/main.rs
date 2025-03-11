mod command;
mod web;
use log::{error, info};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

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
    info!("请求 Web Server 启动");
    web::start();
    "web_start send ok!".to_string()
}

#[tauri::command]
fn stop_web() -> String {
    info!("请求 Web Server 关闭");
    web::stop();
    "stop_web send ok!".to_string()
}

#[tauri::command]
fn start_ray() -> String {
    if let Err(e) = command::start("./ray-bin/ray", &["-c", "./ray-bin/config.json"]) {
        error!("Ray Server 启动失败: {}", e);
    } else {
        info!("Ray Server 启动成功");
    }
    "start_ray send ok!".to_string()
}

#[tauri::command]
fn stop_ray() -> String {
    if let Err(e) = command::stop() {
        error!("Ray Server 停止失败: {}", e);
    } else {
        info!("Ray Server 停止成功");
    }
    "stop_ray send ok!".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    init_log();
    info!("Dray 启动");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            dray, start_web, stop_web, start_ray, stop_ray
        ])
        .run(tauri::generate_context!())
        .expect("error while running dray application");
}
