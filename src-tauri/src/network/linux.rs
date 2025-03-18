use crate::config;
use super::{execute_command};

pub fn enable_auto_proxy() -> bool {
    let config = config::get_config();
    let url = format!("http://{}:{}/dray/proxy.js", config.web_server_host, config.web_server_port);
    execute_command(&format!("gsettings set org.gnome.system.proxy autoconfig-url '{}'", url)) &&
        execute_command("gsettings set org.gnome.system.proxy mode 'auto'")
}

pub fn enable_socks_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("gsettings set org.gnome.system.proxy.socks host '{}'", config.ray_host)) &&
        execute_command(&format!("gsettings set org.gnome.system.proxy.socks port {}", config.ray_socks_port)) &&
        execute_command("gsettings set org.gnome.system.proxy mode 'manual'")
}

pub fn enable_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("gsettings set org.gnome.system.proxy.http host '{}'", config.ray_host)) &&
        execute_command(&format!("gsettings set org.gnome.system.proxy.http port {}", config.ray_http_port)) &&
        execute_command("gsettings set org.gnome.system.proxy mode 'manual'")
}

pub fn enable_secure_web_proxy() -> bool {
    let config = config::get_config();
    execute_command(&format!("gsettings set org.gnome.system.proxy.https host '{}'", config.ray_host)) &&
        execute_command(&format!("gsettings set org.gnome.system.proxy.https port {}", config.ray_http_port)) &&
        execute_command("gsettings set org.gnome.system.proxy mode 'manual'")
}

pub fn disable_auto_proxy() -> bool {
    execute_command("gsettings set org.gnome.system.proxy mode 'none'")
}

pub fn disable_socks_proxy() -> bool {
    execute_command("gsettings set org.gnome.system.proxy.socks host ''") &&
        execute_command("gsettings set org.gnome.system.proxy.socks port 0")
}

pub fn disable_web_proxy() -> bool {
    execute_command("gsettings set org.gnome.system.proxy.http host ''") &&
        execute_command("gsettings set org.gnome.system.proxy.http port 0")
}

pub fn disable_secure_web_proxy() -> bool {
    execute_command("gsettings set org.gnome.system.proxy.https host ''") &&
        execute_command("gsettings set org.gnome.system.proxy.https port 0")
}

pub fn disable_proxies() -> bool {
    disable_auto_proxy() && disable_socks_proxy() && disable_web_proxy() && disable_secure_web_proxy()
}
