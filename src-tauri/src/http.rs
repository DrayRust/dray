use crate::config;
use futures_util::StreamExt;
use logger::{debug, error};
use reqwest::header;
use reqwest::Client;
use reqwest::Proxy;
use serde_json::{json, Value};
use std::fs::File;
use std::io::Write;
use std::time::Duration;

fn get_default_proxy_url() -> Option<String> {
    let config = config::get_config();
    Some(format!("socks5://{}:{}", config.ray_host, config.ray_socks_port))
}

pub async fn fetch_get(url: &str, is_proxy: bool) -> Value {
    let proxy_url = if is_proxy { get_default_proxy_url() } else { None };
    match get_with_proxy(url, proxy_url.as_deref()).await {
        Ok(html) => json!({"success": true, "html": html.to_string()}),
        Err(e) => {
            error!("{}", e);
            json!({"success": false, "msg": e})
        }
    }
}

pub async fn fetch_get_with_proxy(url: &str, proxy_url: &str) -> Value {
    match get_with_proxy(url, Some(proxy_url)).await {
        Ok(html) => json!({"success": true, "html": html.to_string()}),
        Err(e) => {
            error!("{}", e);
            json!({"success": false, "msg": e})
        }
    }
}

pub async fn get_with_proxy(url: &str, proxy_url: Option<&str>) -> Result<String, String> {
    let client_builder = Client::builder().timeout(Duration::from_secs(10));

    let client_builder = if let Some(proxy_url) = proxy_url {
        Proxy::all(proxy_url)
            .map(|proxy| client_builder.proxy(proxy))
            .map_err(|e| format!("Failed to set proxy: {}", e))?
    } else {
        client_builder
    };

    let client = client_builder.build().map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client
        .get(url)
        .header(
            header::USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        .send()
        .await
        .map_err(|e| format!("Failed to send HTTP request: {}", e))?;

    let status = response.status();
    if !status.is_success() {
        return Err(format!("Failed to fetch HTML page, status: {}", status));
    }

    match response.text().await {
        Ok(html) => {
            debug!("Successfully fetched HTML content from: {}, status: {}", url, status.as_u16());
            Ok(html)
        }
        Err(e) => Err(format!("Failed to parse response body: {}", e)),
    }
}

pub async fn download_large_file(url: &str, filepath: &str, timeout: u64) -> Value {
    match stream_download(&url, &filepath, timeout).await {
        Ok(()) => json!({"success": true}),
        Err(e) => {
            error!("{}", e);
            json!({"success": false, "msg": e})
        }
    }
}

pub async fn stream_download(url: &str, filepath: &str, timeout: u64) -> Result<(), String> {
    let client = Client::builder()
        .timeout(Duration::from_secs(timeout))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let response = client.get(url).send().await.map_err(|e| format!("Failed to send HTTP request: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Failed to download file, status: {}", response.status()));
    }

    let mut file = File::create(filepath).map_err(|e| format!("Failed to create local file: {}", e))?;

    let mut stream = response.bytes_stream();
    let mut total_size = 0;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Failed to read chunk: {}", e))?;
        file.write_all(&chunk).map_err(|e| format!("Failed to write chunk to file: {}", e))?;
        total_size += chunk.len();
    }

    debug!("Successfully downloaded file from: {}, size: {} bytes", url, total_size);

    Ok(())
}
