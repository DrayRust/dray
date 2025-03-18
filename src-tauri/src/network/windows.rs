use super::command;
use crate::config;
use winapi::um::wininet::{InternetSetOptionW, INTERNET_OPTION_SETTINGS_CHANGED, INTERNET_OPTION_REFRESH};
use std::ptr::null_mut;

const SETTINGS: &str = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";

fn notify_proxy_change() -> bool {
    unsafe {
        InternetSetOptionW(null_mut(), INTERNET_OPTION_SETTINGS_CHANGED, null_mut(), 0) != 0 &&
            InternetSetOptionW(null_mut(), INTERNET_OPTION_REFRESH, null_mut(), 0) != 0
    }
}

pub fn enable_auto_proxy() -> bool {
    let config = config::get_config();
    let url = format!("http://{}:{}/dray/proxy.js", config.web_server_host, config.web_server_port);
    let success = command("reg", &["add", SETTINGS, "/v", "AutoConfigURL", "/t", "REG_SZ", "/d", &url, "/f"]).is_ok() &&
        command("reg", &["add", SETTINGS, "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "1", "/f"]).is_ok();
    success && notify_proxy_change()
}

fn enable_proxy(proxy_type: &str, host: &str, port: &u32) -> bool {
    let proxy_server = format!("{}={}:{}", proxy_type, host, port);
    let success = command("reg", &["add", SETTINGS, "/v", "ProxyServer", "/t", "REG_SZ", "/d", &proxy_server, "/f"]).is_ok() &&
        command("reg", &["add", SETTINGS, "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "1", "/f"]).is_ok();
    success && notify_proxy_change()
}

pub fn enable_socks_proxy() -> bool {
    let config = config::get_config();
    enable_proxy("socks", &config.ray_host, &config.ray_socks_port)
}

pub fn enable_web_proxy() -> bool {
    let config = config::get_config();
    enable_proxy("http", &config.ray_host, &config.ray_http_port)
}

pub fn enable_secure_web_proxy() -> bool {
    let config = config::get_config();
    enable_proxy("https", &config.ray_host, &config.ray_http_port)
}

pub fn disable_auto_proxy() -> bool {
    let success = command("reg", &["delete", SETTINGS, "/v", "AutoConfigURL", "/f"]).is_ok() &&
        command("reg", &["add", SETTINGS, "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "0", "/f"]).is_ok();
    success && notify_proxy_change()
}

pub fn disable_socks_proxy() -> bool {
    disable_proxies()
}

pub fn disable_web_proxy() -> bool {
    disable_proxies()
}

pub fn disable_secure_web_proxy() -> bool {
    disable_proxies()
}

pub fn disable_proxies() -> bool {
    let success = command("reg", &["delete", SETTINGS, "/v", "ProxyServer", "/f"]).is_ok() &&
        command("reg", &["add", SETTINGS, "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "0", "/f"]).is_ok();
    success && notify_proxy_change()
}

/*
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
*/
