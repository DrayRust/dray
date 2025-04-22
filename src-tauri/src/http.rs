use crate::config;
use logger::{debug, error};
use reqwest::header;
use reqwest::Client;
use reqwest::Proxy;
use std::time::Duration;

pub async fn fetch_get(url: &str, is_proxy: bool) -> String {
    let config = config::get_config();
    fetch_get_by_proxy_socks(url, is_proxy, &config.ray_host, config.ray_socks_port).await
}

pub async fn fetch_get_generate(port: u32) -> String {
    fetch_get_by_proxy_socks("http://www.gstatic.com/generate_204", true, "127.0.0.1", port).await
}

pub async fn fetch_get_by_proxy_socks(url: &str, is_proxy: bool, ray_host: &str, ray_socks_port: u32) -> String {
    let client_builder = Client::builder().timeout(Duration::from_secs(10));

    let client_builder = if is_proxy {
        let proxy_url = format!("socks5://{}:{}", ray_host, ray_socks_port);
        debug!("Proxy URL: {}", proxy_url);
        match Proxy::all(proxy_url) {
            Ok(proxy) => client_builder.proxy(proxy),
            Err(e) => {
                error!("Failed to set proxy: {}", e);
                client_builder
            }
        }
    } else {
        client_builder
    };

    let client = match client_builder.build() {
        Ok(client) => client,
        Err(e) => {
            error!("Failed to create HTTP client: {}", e);
            return String::new();
        }
    };

    let response = match client
        .get(url)
        .header(
            header::USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        .send()
        .await
    {
        Ok(response) => response,
        Err(e) => {
            error!("Failed to send HTTP request: {}", e);
            return String::new();
        }
    };

    if !response.status().is_success() {
        let status = response.status();
        error!("Failed to fetch HTML page, status: {}", status);
        return String::new();
    }

    match response.text().await {
        Ok(html) => {
            debug!("Successfully fetched HTML content from: {}", url);
            html
        }
        Err(e) => {
            error!("Failed to parse response body: {}", e);
            String::new()
        }
    }
}
