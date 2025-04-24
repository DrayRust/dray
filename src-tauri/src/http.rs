use crate::config;
use logger::{debug, error};
use reqwest::header;
use reqwest::Client;
use reqwest::Proxy;
use std::time::Duration;

fn get_default_proxy_url() -> Option<String> {
    let config = config::get_config();
    Some(format!("socks5://{}:{}", config.ray_host, config.ray_socks_port))
}

pub async fn fetch_get(url: &str, is_proxy: bool) -> String {
    let proxy_url = if is_proxy { get_default_proxy_url() } else { None };
    get_with_proxy(url, proxy_url.as_deref()).await
}

pub async fn fetch_get_with_proxy(url: &str, proxy_url: &str) -> String {
    get_with_proxy(url, Some(proxy_url)).await
}

async fn get_with_proxy(url: &str, proxy_url: Option<&str>) -> String {
    let client_builder = Client::builder().timeout(Duration::from_secs(10));

    let client_builder = if let Some(proxy_url) = proxy_url {
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
