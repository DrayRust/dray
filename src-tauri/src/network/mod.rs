use crate::config;
use logger::{error, info};
use std::process::Command;

#[cfg(target_os = "linux")]
pub mod linux;

#[cfg(target_os = "macos")]
pub mod macos;

#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "linux")]
pub use linux::*;

#[cfg(target_os = "macos")]
pub use macos::*;

#[cfg(target_os = "windows")]
pub use windows::*;

pub fn command(command: &str, args: &[&str]) -> Result<(), Box<dyn std::error::Error>> {
    let status = Command::new(command).args(args).status()?;

    if !status.success() {
        return Err(format!("Command exited with status: {}", status).into());
    }

    info!("Command '{} {}' executed successfully", command, args.join(" "));
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
        true
    }
}

/*pub fn execute_commands(command_str: &str) -> bool {
    command_str.trim().lines().all(|cmd| execute_command(cmd))
}*/

pub fn setup_proxies() -> bool {
    let config = config::get_config();
    let mut success = true;

    if config.auto_setup_pac && !enable_auto_proxy() {
        error!("Failed to enable auto proxy (PAC)");
        success = false;
    }
    if config.auto_setup_socks && !enable_socks_proxy() {
        error!("Failed to enable SOCKS proxy");
        success = false;
    }
    if config.auto_setup_http && !enable_web_proxy() {
        error!("Failed to enable HTTP proxy");
        success = false;
    }
    if config.auto_setup_https && !enable_secure_web_proxy() {
        error!("Failed to enable HTTPS proxy");
        success = false;
    }

    success
}

pub fn setup_pac_proxy() -> bool {
    let config = config::get_config();
    if config.auto_setup_pac {
        if !enable_auto_proxy() {
            error!("Failed to enable auto proxy (PAC)");
            return false;
        }
        true
    } else {
        true
    }
}

pub fn setup_socks_proxy() -> bool {
    let config = config::get_config();
    let mut success = true;

    if config.auto_setup_socks {
        if !enable_socks_proxy() {
            error!("Failed to enable SOCKS proxy");
            success = false;
        }
    }
    if config.auto_setup_pac {
        if !enable_auto_proxy() {
            error!("Failed to enable auto proxy (PAC)");
            success = false;
        }
    }

    success
}

pub fn setup_http_proxy() -> bool {
    let config = config::get_config();
    let mut success = true;

    if config.auto_setup_http {
        if !enable_web_proxy() {
            error!("Failed to enable HTTP proxy");
            success = false;
        }
    }
    if config.auto_setup_https {
        if !enable_secure_web_proxy() {
            error!("Failed to enable HTTPS proxy");
            success = false;
        }
    }

    success
}
