mod cleanup;
mod config;
mod dirs;
mod log;
mod network;
mod ray;
mod setting;
mod sys_info;
mod web;

use logger::info;
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

#[tauri::command]
fn dray(name: &str) -> String {
    info!("dray triggered");
    format!("Hello, {}! Do you know Dray is great?", name)
}

#[tauri::command]
fn get_paths_json() -> String {
    info!("get_paths_json triggered");
    dirs::get_paths_json()
}

#[tauri::command]
fn sys_info_json() -> String {
    info!("sys_info_json triggered");
    sys_info::sys_info_json()
}

#[tauri::command]
fn start_web() -> String {
    info!("Request to start Web Server");
    web::start();
    "web_start send ok!".to_string()
}

#[tauri::command]
fn stop_web() -> String {
    info!("Request to stop Web Server");
    web::stop();
    "stop_web send ok!".to_string()
}

#[tauri::command]
fn start_ray() -> String {
    info!("start_ray triggered");
    ray::start();
    "start_ray send ok!".to_string()
}

#[tauri::command]
fn stop_ray() -> String {
    info!("stop_ray triggered");
    ray::stop();
    "stop_ray send ok!".to_string()
}

#[tauri::command]
fn force_restart_ray() -> String {
    info!("force_restart_ray triggered");
    ray::force_restart_ray();
    "force_restart_ray send ok!".to_string()
}

#[tauri::command]
fn force_kill_ray() -> String {
    info!("force_kill_ray triggered");
    ray::force_kill_ray();
    "force_kill_ray send ok!".to_string()
}

#[tauri::command]
fn enable_auto_proxy() -> String {
    network::enable_auto_proxy();
    "enable_auto_proxy send ok!".to_string()
}

#[tauri::command]
fn enable_socks_proxy() -> String {
    network::enable_socks_proxy();
    "enable_socks_proxy send ok!".to_string()
}

#[tauri::command]
fn enable_web_proxy() -> String {
    network::enable_web_proxy();
    "enable_web_proxy send ok!".to_string()
}

#[tauri::command]
fn enable_secure_web_proxy() -> String {
    network::enable_secure_web_proxy();
    "enable_secure_web_proxy send ok!".to_string()
}

#[tauri::command]
fn disable_proxies() -> String {
    network::disable_proxies();
    "disable_proxies send ok!".to_string()
}

#[tauri::command]
fn quit() -> String {
    cleanup::exit_cleanly();
    info!("Dray quit");
    std::process::exit(0);
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
fn set_ray_log_level(value: String) -> bool {
    setting::set_ray_log_level(value)
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
fn set_ray_start_socks(value: bool) -> bool {
    setting::set_ray_start_socks(value)
}

#[tauri::command]
fn set_ray_start_http(value: bool) -> bool {
    setting::set_ray_start_http(value)
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    log::init();
    config::init();
    info!("Dray started");

    tauri::Builder::default()
        .plugin(cleanup::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Option::Some(vec!["-s", "quiet"]),
        ))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            setup_main_window(&app.handle())?;
            setup_menu(app)?;
            setup_tray(app)?;

            ray::start(); // Start ray server
            web::start(); // Start web server
            network::enable_auto_proxy(); // Set proxy
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            dray,
            get_paths_json,
            sys_info_json,
            start_web,
            stop_web,
            start_ray,
            stop_ray,
            force_restart_ray,
            force_kill_ray,
            enable_auto_proxy,
            enable_socks_proxy,
            enable_web_proxy,
            enable_secure_web_proxy,
            disable_proxies,
            set_web_server_enable,
            set_web_server_host,
            set_web_server_port,
            set_ray_log_level,
            set_ray_host,
            set_ray_socks_port,
            set_ray_http_port,
            set_ray_start_socks,
            set_ray_start_http,
            set_auto_setup_pac,
            set_auto_setup_socks,
            set_auto_setup_http,
            quit
        ])
        .run(tauri::generate_context!())
        .expect("error while running dray application");
}
