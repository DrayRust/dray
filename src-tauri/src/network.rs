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

pub fn parse_and_execute_commands(command_str: &str) -> bool {
    let commands: Vec<&str> = command_str.trim().lines().collect();
    let mut all_success = true;

    for cmd in commands {
        let cmd = cmd.trim();
        if cmd.is_empty() {
            continue;
        }

        let args: Vec<&str> = cmd.split_whitespace().collect();
        if args.len() < 2 {
            error!("Invalid command format: {}", cmd);
            all_success = false;
            continue;
        }

        let command_name = args[0];
        let command_args = &args[1..];

        if let Err(e) = command(command_name, command_args) {
            error!("Failed to execute command '{}': {}", cmd, e);
            all_success = false;
        } else {
            info!("Command '{}' executed successfully", cmd);
        }
    }

    all_success
}

pub fn enable_auto_proxy() -> bool {
    let url = "http://127.0.0.1:18687/dray/proxy.js";
    let commands = vec![
        format!("networksetup -setautoproxyurl Wi-Fi {}", url),
        "networksetup -setautoproxystate Wi-Fi on".parse().unwrap(),
    ];
    let command_str = commands.join("\n");
    parse_and_execute_commands(&command_str)
}

pub fn enable_socks_proxy() -> bool {
    let port = 1086;
    let commands = vec![
        format!("networksetup -setsocksfirewallproxy Wi-Fi 127.0.0.1 {}", port),
        "networksetup -setsocksfirewallproxystate Wi-Fi on".parse().unwrap(),
    ];
    let command_str = commands.join("\n");
    parse_and_execute_commands(&command_str)
}

pub fn enable_web_proxy() -> bool {
    let port = 1089;
    let commands = vec![
        format!("networksetup -setwebproxy Wi-Fi 127.0.0.1 {}", port),
        "networksetup -setwebproxystate Wi-Fi on".parse().unwrap(),
    ];
    let command_str = commands.join("\n");
    parse_and_execute_commands(&command_str)
}

pub fn enable_secure_web_proxy() -> bool {
    let port = 1089;
    let commands = vec![
        format!("networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 {}", port),
        "networksetup -setsecurewebproxystate Wi-Fi on".parse().unwrap(),
    ];
    let command_str = commands.join("\n");
    parse_and_execute_commands(&command_str)
}

pub fn disable_proxies() -> bool {
    let commands = vec![
        "networksetup -setautoproxystate Wi-Fi off",
        "networksetup -setsocksfirewallproxystate Wi-Fi off",
        "networksetup -setwebproxystate Wi-Fi off",
        "networksetup -setsecurewebproxystate Wi-Fi off",
    ];
    let command_str = commands.join("\n");
    parse_and_execute_commands(&command_str)
}
