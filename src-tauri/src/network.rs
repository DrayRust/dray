use logger::{error, info};
use crate::command;

/**
networksetup -setautoproxyurl Wi-Fi http://127.0.0.1:18687/dray/proxy.pac
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

		if let Err(e) = command::start(command_name, command_args) {
			error!("Failed to execute command '{}': {}", cmd, e);
			all_success = false;
		} else {
			info!("Command '{}' executed successfully", cmd);
		}
	}

	all_success
}
