use crate::config;
use logger::{error, info};
use std::process::Command;

/**
networksetup -setautoproxyurl Wi-Fi http://127.0.0.1:18687/dray/proxy.js
networksetup -setsocksfirewallproxy Wi-Fi 127.0.0.1 1086
networksetup -setwebproxy Wi-Fi 127.0.0.1 1089
networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 1089

networksetup -setautoproxystate Wi-Fi on
networksetup -setsocksfirewallproxystate Wi-Fi on
networksetup -setwebproxystate Wi-Fi on
networksetup -setsecurewebproxystate Wi-Fi on

networksetup -setautoproxystate Wi-Fi off
networksetup -setsocksfirewallproxystate Wi-Fi off
networksetup -setwebproxystate Wi-Fi off
networksetup -setsecurewebproxystate Wi-Fi off
*/

pub fn command(command: &str, args: &[&str]) -> Result<(), Box<dyn std::error::Error>> {
    let status = Command::new(command)
        .args(args)
        // .stdin(Stdio::null())
        // .stdout(Stdio::null())
        // .stderr(Stdio::null())
        .status()?;

    if !status.success() {
        return Err(format!("Command exited with status: {}", status).into());
    }

    Ok(())
}

pub fn execute_command(cmd: &str) -> bool {
    let cmd = cmd.trim();
    if cmd.is_empty() {
        return false;
    }

    let args: Vec<&str> = cmd.split_whitespace().collect();
    if args.len() < 2 {
        error!("Invalid command format: {}", cmd);
        return false;
    }

    let command_name = args[0];
    let command_args = &args[1..];

    if let Err(e) = command(command_name, command_args) {
        error!("Failed to execute command '{}': {}", cmd, e);
        false
    } else {
        info!("Command '{}' executed successfully", cmd);
        true
    }
}

pub fn execute_commands(command_str: &str) -> bool {
    command_str.trim().lines().all(|cmd| execute_command(cmd))
}

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
