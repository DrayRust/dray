mod cleanup;
mod config;
mod dirs;
mod log;
mod network;
mod ray;
mod setting;
mod sys_info;
mod web;

use logger::{debug, info};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

fn setup_main_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let main_window = app.get_webview_window("main").unwrap();

    // #[cfg(target_os = "windows")]
    main_window.set_skip_taskbar(true)?;

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory)?;

    main_window.clone().on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            main_window.hide().unwrap();
        }
    });

    Ok(())
}

fn setup_tray<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
    // See: https://v2.tauri.app/learn/system-tray/#listen-to-tray-events
    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                if let Some(window) = tray.app_handle().get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {
                // println!("unhandled event {event:?}");
            }
        })
        .build(app)?;
    Ok(())
}

fn setup_menu<R: tauri::Runtime>(app: &tauri::App<R>) -> tauri::Result<()> {
    // See: https://v2.tauri.app/learn/window-menu/
    let menu = tauri::menu::MenuBuilder::new(app).build()?;
    app.set_menu(menu)?;
    Ok(())
}

fn setup_services() {
    let config = config::get_config();
    if config.ray_enable {
        ray::start();
    }
    if config.web_server_enable {
        web::start();
    }
}

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
fn read_logs_all_list_list() -> String {
    log::read_logs_all_list()
}

#[tauri::command]
fn read_log_file_tail(filename: String, tail_lines: usize) -> String {
    log::read_log_file_tail(&filename, tail_lines)
}

#[tauri::command]
fn get_dray_logs_dir() -> String {
    dirs::get_dray_logs_dir_str()
}

#[tauri::command]
fn ensure_log_dir() -> bool {
    log::ensure_log_dir()
}

#[tauri::command]
fn send_log(content: String) -> bool {
    log::write_web_interface_log(&content)
}

#[tauri::command]
fn restart_ray() -> bool {
    ray::restart()
}

#[tauri::command]
fn read_ray_config() -> String {
    ray::read_ray_config()
}

#[tauri::command]
fn save_ray_config(content: String) -> bool {
    ray::save_ray_config(&content)
}

#[tauri::command]
fn read_conf(filename: String) -> String {
    config::read_conf(&filename)
}

#[tauri::command]
fn save_conf(filename: String, content: String) -> bool {
    config::save_conf(&filename, &content)
}

#[tauri::command]
fn save_proxy_pac(content: String) -> bool {
    web::save_proxy_pac(&content)
}

#[tauri::command]
fn get_paths_json() -> String {
    debug!("get_paths_json triggered");
    dirs::get_paths_json()
}

#[tauri::command]
fn get_sys_info_json() -> String {
    debug!("get_sys_info_json triggered");
    sys_info::get_sys_info_json()
}

#[tauri::command]
fn get_config_json() -> String {
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
fn set_ray_force_kill(value: bool) -> bool {
    setting::set_ray_force_kill(value)
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

fn log_startup_info() {
    // rustc -Vv
    // rustc_version::version_meta().unwrap().short_version_string
    // export RUSTC_VERSION=$(rustc -V)
    // echo 'export RUSTC_VERSION=$(rustc -V)' >> ~/.profile OR
    // echo 'export RUSTC_VERSION=$(rustc -V)' >> ~/.zshrc
    // source ~/.zshrc
    // echo $RUSTC_VERSION
    let rust_version = option_env!("RUSTC_VERSION").unwrap_or("rustc 1.84.0 (9fc6b4312 2025-01-07)");
    info!("Dray started v{}, tauri {}, {}", env!("CARGO_PKG_VERSION"), tauri::VERSION, rust_version);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    config::init();
    log::init();
    log_startup_info();

    tauri::Builder::default()
        .plugin(cleanup::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Option::Some(vec!["-s", "quiet"]),
        ))
        .plugin(tauri_plugin_opener::init())
        // .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            setup_main_window(&app.handle())?;
            setup_menu(app)?;
            setup_tray(app)?;

            setup_services();
            network::setup_proxies();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            dray,
            read_logs_all_list,
            read_log_file_tail,
            get_dray_logs_dir,
            ensure_log_dir,
            send_log,
            restart_ray,
            read_ray_config,
            save_ray_config,
            read_conf,
            save_conf,
            save_proxy_pac,
            get_paths_json,
            get_sys_info_json,
            get_config_json,
            set_app_log_level,
            set_web_server_enable,
            set_web_server_host,
            set_web_server_port,
            set_ray_enable,
            set_ray_force_kill,
            set_ray_host,
            set_ray_socks_port,
            set_ray_http_port,
            set_auto_setup_pac,
            set_auto_setup_socks,
            set_auto_setup_http,
            set_auto_setup_https,
            check_port_available,
            quit
        ])
        .run(tauri::generate_context!())
        .expect("error while running dray application");
}
