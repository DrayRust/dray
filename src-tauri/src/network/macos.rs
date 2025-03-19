use super::execute_command;
use crate::config;

/*
// 获取当前使用的网络接口名称
use std::process::Command;
fn get_active_network_interface() -> Option<String> {
    let output = Command::new("networksetup")
        .arg("-listallnetworkservices")
        .output()
        .ok()
        .and_then(|output| {
            if output.status.success() {
                String::from_utf8(output.stdout).ok()
            } else {
                None
            }
        });

    output.and_then(|s| {
        s.lines()
            .skip(1) // 跳过第一行提示信息
            .find(|line| !line.starts_with('*')) // 找到第一个未标记为禁用的接口
            .map(|line| line.trim().to_string())
    })
}
*/

pub fn enable_auto_proxy() -> bool {
    let config = config::get_config();
    let url = format!("http://{}:{}/dray/proxy.js", config.web_server_host, config.web_server_port);
    execute_command(&format!("networksetup -setautoproxyurl Wi-Fi {}", url))
        && execute_command("networksetup -setautoproxystate Wi-Fi on")
}

pub fn enable_socks_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("networksetup -setsocksfirewallproxy Wi-Fi {} {}", config.ray_host, config.ray_socks_port))
        && execute_command("networksetup -setsocksfirewallproxystate Wi-Fi on")
}

pub fn enable_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("networksetup -setwebproxy Wi-Fi {} {}", config.ray_host, config.ray_http_port))
        && execute_command("networksetup -setwebproxystate Wi-Fi on")
}

pub fn enable_secure_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("networksetup -setsecurewebproxy Wi-Fi {} {}", config.ray_host, config.ray_http_port))
        && execute_command("networksetup -setsecurewebproxystate Wi-Fi on")
}

pub fn disable_auto_proxy() -> bool {
    execute_command("networksetup -setautoproxystate Wi-Fi off")
}

pub fn disable_socks_proxy() -> bool {
    execute_command("networksetup -setsocksfirewallproxystate Wi-Fi off")
}

pub fn disable_web_proxy() -> bool {
    execute_command("networksetup -setwebproxystate Wi-Fi off")
}

pub fn disable_secure_web_proxy() -> bool {
    execute_command("networksetup -setsecurewebproxystate Wi-Fi off")
}

pub fn disable_proxies() -> bool {
    disable_auto_proxy() && disable_socks_proxy() && disable_web_proxy() && disable_secure_web_proxy()
}
