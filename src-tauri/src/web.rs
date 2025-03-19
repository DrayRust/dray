use crate::config;
use crate::dirs;
use actix_files::Files;
use actix_web::{dev, web, App, HttpServer};
use logger::{error, info};
use once_cell::sync::Lazy;
use std::sync::Mutex;

use actix_web::middleware::Logger;
use chrono;
use env_logger::Builder;
use log::LevelFilter;
use std::fs::OpenOptions;
use std::io::Write;

static SERVER_HANDLE: Lazy<Mutex<Option<dev::ServerHandle>>> = Lazy::new(|| Mutex::new(None));
static LOGGER_ONCE: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

// 日志初始化
fn init_logger() {
    let mut init_once = LOGGER_ONCE.lock().unwrap();
    if *init_once {
        return;
    }

    let log_file = OpenOptions::new()
        .write(true)
        .create(true)
        .append(true)
        .open(dirs::get_dray_logs_dir().unwrap().join("web_server.log").to_str().unwrap())
        .unwrap();

    Builder::from_default_env()
        .target(env_logger::Target::Pipe(Box::new(log_file)))
        .filter_level(LevelFilter::Info) // 设置日志级别参数: Off Error Warn Info Debug Trace
        .filter_module("actix_http::h1::dispatcher", LevelFilter::Off)
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

    *init_once = true;
}

pub fn start() {
    if SERVER_HANDLE.lock().unwrap().is_some() {
        info!("Web Server is already running.");
        return;
    }

    init_logger();

    tauri::async_runtime::spawn(async {
        run_server().await.unwrap();
    });
}

async fn handle_proxy_pac() -> actix_web::HttpResponse {
    let pac_path = dirs::get_dray_web_server_dir().unwrap().join("proxy.js");
    match std::fs::read_to_string(pac_path) {
        Ok(content) => actix_web::HttpResponse::Ok()
            .content_type("application/x-ns-proxy-autoconfig")
            .body(content),
        Err(_) => actix_web::HttpResponse::NotFound().body("proxy.js not found"),
    }
}

async fn run_server() -> Result<(), Box<dyn std::error::Error>> {
    let config = config::get_config();
    let server_address = format!("{}:{}", config.web_server_host, config.web_server_port);
    let server = HttpServer::new(move || {
        App::new()
            .wrap(Logger::new("%D %a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\""))
            .service(Files::new("/dray", dirs::get_dray_web_server_dir().unwrap().to_str().unwrap()).show_files_listing())
            .route("/", web::get().to(|| async { "This is Dray Web Server!" }))
            .route("/proxy.pac", web::get().to(handle_proxy_pac))
    })
    .bind(&server_address)
    .map_err(|e| {
        error!("Failed to bind to {}: {}", server_address, e);
        e
    })?
    .run();
    info!("Web Server running on http://{}", server_address);

    *SERVER_HANDLE.lock().unwrap() = Some(server.handle());
    server.await.map_err(|e| {
        error!("Web Server encountered an error: {}", e);
        e
    })?;
    Ok(())
}

pub fn stop() {
    let server_handle = SERVER_HANDLE.lock().unwrap().take();
    if let Some(handle) = server_handle {
        tauri::async_runtime::block_on(async {
            handle.stop(false).await;
            info!("Web server stopped");
        });
    }
    *SERVER_HANDLE.lock().unwrap() = None;
}

pub fn restart() {
    stop();
    start();
}
