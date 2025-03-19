use super::execute_command;
use crate::config;

// 全局常量，用于存储命令行工具检测结果
const HAS_GSETTINGS: bool = command_exists("gsettings");
const HAS_NMCLI: bool = command_exists("nmcli");

// 检测命令是否存在
fn command_exists(command: &str) -> bool {
    execute_command(&format!("command -v {}", command))
}

// 获取默认网络连接名称
fn get_nmcli_connection_name() -> Option<String> {
    let output = execute_command("nmcli -t -f NAME connection show --active");
    output.ok().and_then(|s| s.lines().next().map(|line| line.to_string()))
}

pub fn enable_auto_proxy() -> bool {
    let config = config::get_config();
    let url = format!("http://{}:{}/dray/proxy.js", config.web_server_host, config.web_server_port);

    if HAS_GSETTINGS {
        execute_command(&format!("gsettings set org.gnome.system.proxy autoconfig-url '{}'", url))
            && execute_command("gsettings set org.gnome.system.proxy mode 'auto'")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.pac-url '{}'", conn_name, url))
                && execute_command(&format!("nmcli connection modify '{}' proxy.method auto", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn enable_socks_proxy() -> bool {
    let config = config::get_config();

    if HAS_GSETTINGS {
        execute_command(&format!("gsettings set org.gnome.system.proxy.socks host '{}'", config.ray_host))
            && execute_command(&format!("gsettings set org.gnome.system.proxy.socks port {}", config.ray_socks_port))
            && execute_command("gsettings set org.gnome.system.proxy mode 'manual'")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.socks-host '{}'", conn_name, config.ray_host))
                && execute_command(&format!("nmcli connection modify '{}' proxy.socks-port {}", conn_name, config.ray_socks_port))
                && execute_command(&format!("nmcli connection modify '{}' proxy.method manual", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn enable_web_proxy() -> bool {
    let config = config::get_config();

    if HAS_GSETTINGS {
        execute_command(&format!("gsettings set org.gnome.system.proxy.http host '{}'", config.ray_host))
            && execute_command(&format!("gsettings set org.gnome.system.proxy.http port {}", config.ray_http_port))
            && execute_command("gsettings set org.gnome.system.proxy mode 'manual'")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.http-host '{}'", conn_name, config.ray_host))
                && execute_command(&format!("nmcli connection modify '{}' proxy.http-port {}", conn_name, config.ray_http_port))
                && execute_command(&format!("nmcli connection modify '{}' proxy.method manual", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn enable_secure_web_proxy() -> bool {
    let config = config::get_config();

    if HAS_GSETTINGS {
        execute_command(&format!("gsettings set org.gnome.system.proxy.https host '{}'", config.ray_host))
            && execute_command(&format!("gsettings set org.gnome.system.proxy.https port {}", config.ray_http_port))
            && execute_command("gsettings set org.gnome.system.proxy mode 'manual'")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.https-host '{}'", conn_name, config.ray_host))
                && execute_command(&format!("nmcli connection modify '{}' proxy.https-port {}", conn_name, config.ray_http_port))
                && execute_command(&format!("nmcli connection modify '{}' proxy.method manual", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn disable_auto_proxy() -> bool {
    if HAS_GSETTINGS {
        execute_command("gsettings set org.gnome.system.proxy mode 'none'")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.method none", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn disable_socks_proxy() -> bool {
    if HAS_GSETTINGS {
        execute_command("gsettings set org.gnome.system.proxy.socks host ''") && execute_command("gsettings set org.gnome.system.proxy.socks port 0")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.socks-host ''", conn_name))
                && execute_command(&format!("nmcli connection modify '{}' proxy.socks-port 0", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn disable_web_proxy() -> bool {
    if HAS_GSETTINGS {
        execute_command("gsettings set org.gnome.system.proxy.http host ''") && execute_command("gsettings set org.gnome.system.proxy.http port 0")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.http-host ''", conn_name))
                && execute_command(&format!("nmcli connection modify '{}' proxy.http-port 0", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn disable_secure_web_proxy() -> bool {
    if HAS_GSETTINGS {
        execute_command("gsettings set org.gnome.system.proxy.https host ''") && execute_command("gsettings set org.gnome.system.proxy.https port 0")
    } else if HAS_NMCLI {
        if let Some(conn_name) = get_nmcli_connection_name() {
            execute_command(&format!("nmcli connection modify '{}' proxy.https-host ''", conn_name))
                && execute_command(&format!("nmcli connection modify '{}' proxy.https-port 0", conn_name))
        } else {
            false
        }
    } else {
        false
    }
}

pub fn disable_proxies() -> bool {
    disable_auto_proxy() && disable_socks_proxy() && disable_web_proxy() && disable_secure_web_proxy()
}
