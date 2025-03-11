use actix_files::Files;
use actix_web::{dev, web, App, HttpServer};
use once_cell::sync::Lazy;
use std::sync::Mutex;
use logger::{error, info};
use crate::dirs;

static SERVER_HANDLE: Lazy<Mutex<Option<dev::ServerHandle>>> = Lazy::new(|| Mutex::new(None));

pub fn start() {
	if SERVER_HANDLE.lock().unwrap().is_some() {
		info!("Server is already running.");
		return;
	}

	tauri::async_runtime::spawn(async {
		run_server().await.unwrap();
	});
}

async fn run_server() -> Result<(), Box<dyn std::error::Error>> {
	let home_dir = dirs::get_home_dir().unwrap_or_else(|| {
		error!("无法获取用户主目录");
		std::path::PathBuf::from(".")
	});
	let web_server_path = home_dir.join("dray").join("web_server");

	let server = HttpServer::new(move || {
		App::new()
			.service(Files::new("/dray", web_server_path.to_str()))
			.route("/", web::get().to(|| async { "This is Dray Web Server!" }))
	})
		.bind("127.0.0.1:18687")
		.map_err(|e| {
			error!("Failed to bind to 127.0.0.1:18687: {}", e);
			e
		})?
		.run();
	info!("Server running on http://127.0.0.1:18687");

	*SERVER_HANDLE.lock().unwrap() = Some(server.handle());
	server.await.map_err(|e| {
		error!("Server encountered an error: {}", e);
		e
	})?;
	Ok(())
}

pub fn stop() {
	tauri::async_runtime::spawn(async {
		let handle = SERVER_HANDLE.lock().unwrap().take();
		if let Some(handle) = handle {
			handle.stop(false).await;
		}
		*SERVER_HANDLE.lock().unwrap() = None;
	});
}
