use super::execute_command;
use crate::config;

pub fn enable_auto_proxy() -> bool {
    let config = config::get_config();
    let url = format!("http://{}:{}/dray/proxy.js", config.web_server_host, config.web_server_port);
    execute_command(&format!(
        "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v AutoConfigURL /t REG_SZ /d {} /f",
        url
    )) && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 1 /f")
}

pub fn enable_socks_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!(
        "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /t REG_SZ /d socks={}:{} /f",
        config.ray_host, config.ray_socks_port
    )) && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 1 /f")
}

pub fn enable_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!(
        "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /t REG_SZ /d http={}:{} /f",
        config.ray_host, config.ray_http_port
    )) && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 1 /f")
}

pub fn enable_secure_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!(
        "reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /t REG_SZ /d https={}:{} /f",
        config.ray_host, config.ray_http_port
    )) && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 1 /f")
}

pub fn disable_auto_proxy() -> bool {
    execute_command("reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v AutoConfigURL /f")
        && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 0 /f")
}

pub fn disable_socks_proxy() -> bool {
    execute_command("reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /f")
        && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 0 /f")
}

pub fn disable_web_proxy() -> bool {
    execute_command("reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /f")
        && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 0 /f")
}

pub fn disable_secure_web_proxy() -> bool {
    execute_command("reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyServer /f")
        && execute_command("reg add \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\" /v ProxyEnable /t REG_DWORD /d 0 /f")
}

pub fn disable_proxies() -> bool {
    disable_auto_proxy() && disable_socks_proxy() && disable_web_proxy() && disable_secure_web_proxy()
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
