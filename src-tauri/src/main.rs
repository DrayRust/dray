mod command;
mod dirs;
mod log;
mod network;
mod ray;
mod web;
use logger::info;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

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
	ray::start();
	"start_ray send ok!".to_string()
}

#[tauri::command]
fn stop_ray() -> String {
	ray::stop();
	"stop_ray send ok!".to_string()
}

#[tauri::command]
fn set_auto_proxy_url() -> String {
	network::set_auto_proxy_url();
	"set_auto_proxy_url send ok!".to_string()
}

#[tauri::command]
fn set_socks_proxy() -> String {
	network::set_socks_proxy();
	"set_socks_proxy send ok!".to_string()
}

#[tauri::command]
fn set_web_proxy() -> String {
	network::set_web_proxy();
	"set_web_proxy send ok!".to_string()
}

#[tauri::command]
fn set_secure_web_proxy() -> String {
	network::set_secure_web_proxy();
	"set_secure_web_proxy send ok!".to_string()
}

#[tauri::command]
fn disable_all_proxies() -> String {
	network::disable_all_proxies();
	"disable_all_proxies send ok!".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
	log::init_log();
	info!("Dray started");

	tauri::Builder::default()
		.plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_fs::init())
		.setup(|_app| {
			ray::start(); // Start ray server
			web::start(); // Start web server
			network::set_auto_proxy_url(); // Set proxy
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![
            dray,
            get_paths_json,
            start_web,
            stop_web,
            start_ray,
            stop_ray,
			set_auto_proxy_url,
			set_socks_proxy,
			set_web_proxy,
			set_secure_web_proxy,
            disable_all_proxies
        ])
		.run(tauri::generate_context!())
		.expect("error while running dray application");
}
