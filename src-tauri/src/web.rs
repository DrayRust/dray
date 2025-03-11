use actix_files::Files;
use actix_web::{dev, web, App, HttpServer};
use once_cell::sync::Lazy;
use std::sync::Mutex;
use logger::{error, info};

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
	let server = HttpServer::new(|| {
		App::new()
			.service(Files::new("/dray", "~/.dray/web_server"))
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
	server.await?;
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
