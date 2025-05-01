mod cleanup;
mod config;
mod dirs;
mod fs;
mod http;
mod log;
mod network;
mod ray;
mod setting;
mod setup;
mod sys_info;
mod web;
use logger::{debug, info};
use serde_json::{json, Value};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn dray(name: &str) -> String {
    debug!("dray triggered");
    format!("Hello, {}! Do you know Dray is great?", name)
}

#[tauri::command]
fn quit() -> String {
    cleanup::exit_cleanly();
    info!("Dray quit");
    std::process::exit(0);
}

#[tauri::command]
fn read_log_list() -> Value {
    log::read_log_list()
}

#[tauri::command]
fn read_log_file(filename: String, reverse: bool, start: i64) -> Value {
    log::read_log_file(&filename, reverse, start)
}

#[tauri::command]
fn clear_log_all() -> bool {
    log::clear_log_all()
}

#[tauri::command]
fn get_dray_app_dir() -> String {
    dirs::get_dray_app_dir_str()
}

#[tauri::command]
fn send_log(content: String) -> bool {
    log::write_web_interface_log(&content)
}

#[tauri::command]
fn start_speed_test_server(port: u16, filename: String) -> bool {
    ray::start_speed_test_server(port, &filename)
}

#[tauri::command]
fn stop_speed_test_server(port: u16) -> bool {
    ray::stop_speed_test_server(port)
}

#[tauri::command]
fn restart_ray() -> bool {
    ray::restart()
}

#[tauri::command]
fn read_ray_config() -> Value {
    ray::read_ray_config()
}

#[tauri::command]
fn save_ray_config(content: String) -> bool {
    ray::save_ray_config(&content)
}

#[tauri::command]
fn read_conf(filename: String) -> Value {
    config::read_conf(&filename)
}

#[tauri::command]
fn save_conf(filename: String, content: String) -> bool {
    config::save_conf(&filename, &content)
}

#[tauri::command]
fn save_speed_test_conf(filename: String, content: String) -> bool {
    config::save_speed_test_conf(&filename, &content)
}

#[tauri::command]
fn save_proxy_pac(content: String) -> bool {
    web::save_proxy_pac(&content)
}

#[tauri::command]
fn save_text_file(path: String, content: String) -> bool {
    fs::save_text_file(&path, &content)
}

#[tauri::command]
async fn fetch_get(url: String, is_proxy: bool) -> Value {
    http::fetch_get(&url, is_proxy).await
}

#[tauri::command]
async fn fetch_get_with_proxy(url: String, proxy_url: String) -> Value {
    http::fetch_get_with_proxy(&url, &proxy_url).await
}

#[tauri::command]
async fn download_large_file(url: String, filepath: String, timeout: u64) -> Value {
    http::download_large_file(&url, &filepath, timeout).await
}

#[tauri::command]
async fn upload_speed_test(url: String, size: usize) -> Value {
    http::upload_speed_test(&url, size).await
}

#[tauri::command]
fn get_dirs_json() -> Value {
    dirs::get_dirs_json()
}

#[tauri::command]
fn get_sys_info_json() -> Value {
    sys_info::get_sys_info_json()
}

#[tauri::command]
fn get_load_average_json() -> Value {
    sys_info::get_load_average_json()
}

#[tauri::command]
fn get_processes_json(keyword: String) -> Value {
    sys_info::get_processes_json(&keyword)
}

#[tauri::command]
fn get_disks_json() -> Value {
    sys_info::get_disks_json()
}

#[tauri::command]
fn get_networks_json() -> Value {
    sys_info::get_networks_json()
}

#[tauri::command]
fn get_components_json() -> Value {
    sys_info::get_components_json()
}

#[tauri::command]
fn kill_process_by_pid(pid: u32) -> bool {
    sys_info::kill_process_by_pid(pid)
}

#[tauri::command]
fn get_config_json() -> Value {
    debug!("get_config_json triggered");
    config::get_config_json()
}

#[tauri::command]
fn set_app_log_level(value: String) -> bool {
    setting::set_app_log_level(value)
}

#[tauri::command]
fn set_web_server_enable(value: bool) -> bool {
    setting::set_web_server_enable(value)
}

#[tauri::command]
fn set_web_server_host(value: String) -> bool {
    setting::set_web_server_host(value)
}

#[tauri::command]
fn set_web_server_port(value: u32) -> bool {
    setting::set_web_server_port(value)
}

#[tauri::command]
fn set_ray_enable(value: bool) -> bool {
    setting::set_ray_enable(value)
}

#[tauri::command]
fn set_ray_host(value: String) -> bool {
    setting::set_ray_host(value)
}

#[tauri::command]
fn set_ray_socks_port(value: u32) -> bool {
    setting::set_ray_socks_port(value)
}

#[tauri::command]
fn set_ray_http_port(value: u32) -> bool {
    setting::set_ray_http_port(value)
}

#[tauri::command]
fn set_auto_setup_pac(value: bool) -> bool {
    setting::set_auto_setup_pac(value)
}

#[tauri::command]
fn set_auto_setup_socks(value: bool) -> bool {
    setting::set_auto_setup_socks(value)
}

#[tauri::command]
fn set_auto_setup_http(value: bool) -> bool {
    setting::set_auto_setup_http(value)
}

#[tauri::command]
fn set_auto_setup_https(value: bool) -> bool {
    setting::set_auto_setup_https(value)
}

#[tauri::command]
fn check_port_available(port: u32) -> bool {
    setting::check_port_available(port)
}

#[tauri::command]
fn open_web_server_dir() -> bool {
    web::open_web_server_dir()
}

#[tauri::command]
fn get_ray_version() -> String {
    ray::get_ray_version()
}

#[tauri::command]
fn get_version() -> Value {
    json!({"dray": get_dray_version(), "rustc": get_rustc_version()})
}

// rustc -Vv
// export RUSTC_VERSION=$(rustc -V)
// echo 'export RUSTC_VERSION=$(rustc -V)' >> ~/.profile OR
// echo 'export RUSTC_VERSION=$(rustc -V)' >> ~/.zshrc
// source ~/.zshrc
// echo $RUSTC_VERSION
fn get_rustc_version() -> String {
    // rustc_version::version_meta().unwrap().short_version_string
    option_env!("RUSTC_VERSION").unwrap_or("rustc 1.84.0 (9fc6b4312 2025-01-07)").to_string()
}

fn get_dray_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn log_startup_info() {
    info!("Dray started v{}, tauri {}, {}", get_dray_version(), tauri::VERSION, get_rustc_version());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    config::init();
    log::init();
    log_startup_info();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(cleanup::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Option::Some(vec!["-s", "quiet"]),
        ))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            setup::init(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            dray,
            read_log_list,
            read_log_file,
            clear_log_all,
            send_log,
            start_speed_test_server,
            stop_speed_test_server,
            restart_ray,
            read_ray_config,
            save_ray_config,
            read_conf,
            save_conf,
            save_speed_test_conf,
            save_proxy_pac,
            save_text_file,
            fetch_get,
            fetch_get_with_proxy,
            download_large_file,
            upload_speed_test,
            get_dirs_json,
            get_dray_app_dir,
            get_sys_info_json,
            get_load_average_json,
            get_processes_json,
            get_disks_json,
            get_networks_json,
            get_components_json,
            kill_process_by_pid,
            get_config_json,
            set_app_log_level,
            set_web_server_enable,
            set_web_server_host,
            set_web_server_port,
            set_ray_enable,
            set_ray_host,
            set_ray_socks_port,
            set_ray_http_port,
            set_auto_setup_pac,
            set_auto_setup_socks,
            set_auto_setup_http,
            set_auto_setup_https,
            check_port_available,
            open_web_server_dir,
            get_ray_version,
            get_version,
            quit
        ])
        .run(tauri::generate_context!())
        .expect("error while running dray application");
}
