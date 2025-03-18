use crate::config;
use super::{execute_command};

pub fn enable_auto_proxy() -> bool {
    let config = config::get_config();
    let url = format!("http://{}:{}/dray/proxy.js", config.web_server_host, config.web_server_port);
    execute_command(&format!("netsh winhttp set proxy proxy-server=\"{}\"", url))
}

pub fn enable_socks_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("netsh winhttp set proxy proxy-server=\"socks={}:{}\"", config.ray_host, config.ray_socks_port))
}

pub fn enable_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("netsh winhttp set proxy proxy-server=\"http={}:{}\"", config.ray_host, config.ray_http_port))
}

pub fn enable_secure_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("netsh winhttp set proxy proxy-server=\"https={}:{}\"", config.ray_host, config.ray_http_port))
}

pub fn disable_auto_proxy() -> bool {
    execute_command("netsh winhttp reset proxy")
}

pub fn disable_socks_proxy() -> bool {
    execute_command("netsh winhttp reset proxy")
}

pub fn disable_web_proxy() -> bool {
    execute_command("netsh winhttp reset proxy")
}

pub fn disable_secure_web_proxy() -> bool {
    execute_command("netsh winhttp reset proxy")
}

pub fn disable_proxies() -> bool {
    execute_command("netsh winhttp reset proxy")
}
