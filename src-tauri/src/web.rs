use actix_files::Files;
use actix_web::{web, App, HttpServer};
use std::sync::Mutex;
use tokio::runtime::Runtime;
use tokio::time::{sleep, Duration};

static IS_RUN: Mutex<bool> = Mutex::new(false);

pub fn start(ip: &str, port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let rt = Runtime::new()?;
    rt.block_on(async {
        let server = HttpServer::new(|| {
            App::new()
                .service(Files::new("/dray", "~/.dray/web_server"))
                .route("/", web::get().to(|| async { "This is Dray Web Server!" }))
        })
        .bind(format!("{}:{}", ip, port))?
        .run();

        let start_handle = tokio::spawn(async move { server.await });

        // 标记运行
        let mut is_run = IS_RUN.lock()?;
        *is_run = true;

        loop {
            sleep(Duration::from_secs(2)).await;
            let is_run = *IS_RUN.lock()?;
            if !is_run {
                break;
            }
        }

        start_handle.await?;

        Ok(())
    })
}

pub fn stop() -> Result<(), Box<dyn std::error::Error>> {
    let mut is_run = IS_RUN.lock()?;
    *is_run = false;
    Ok(())
}
