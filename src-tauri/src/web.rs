use actix_files::Files;
use actix_web::{dev, web, App, HttpServer};
use once_cell::sync::Lazy;
use std::sync::Mutex;
use logger::{error, info};
use crate::dirs;

use std::fs::OpenOptions;
use std::io::Write;
use log::LevelFilter;
use env_logger::Builder;
use actix_web::middleware::Logger;
use chrono;

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
		error!("Failed to get user home directory");
		std::path::PathBuf::from(".")
	});

	let log_file = OpenOptions::new()
		.write(true)
		.create(true)
		.append(true)
		.open(home_dir.join("dray").join("logs").join("web_server.log").to_str().unwrap_or("./web_server.log"))?;

	Builder::from_default_env()
		.target(env_logger::Target::Pipe(Box::new(log_file)))
		.filter_level(LevelFilter::Debug) // 设置日志级别参数: Off Error Warn Info Debug Trace
		.format(|buf, record| {
			buf.write_fmt(format_args!(
				"[{}] [{}] {}: {}\n",
				chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
				record.level(),
				record.target(),
				record.args()
			))
		})
		.format_timestamp(None)
		.init();

	let web_server_path: String = home_dir.join("dray").join("web_server").to_str().unwrap_or("./web_server").to_string();

	let server = HttpServer::new(move || {
		App::new()
			.wrap(Logger::new("%D %b %a \"%r\" %s \"%{Referer}i\" \"%{User-Agent}i\""))
			.service(Files::new("/dray", &*web_server_path).show_files_listing())
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
