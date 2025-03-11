use log::{error, info};
use crate::command;

// networksetup -setwebproxy Wi-Fi 127.0.0.1 8888
// networksetup -setsecurewebproxy Wi-Fi 127.0.0.1 8888
// networksetup -setsocksfirewallproxy Wi-Fi 127.0.0.1 8888
// networksetup -setautoproxyurl Wi-Fi http://example.com/proxy.pac

// networksetup -setwebproxystate Wi-Fi off
// networksetup -setsecurewebproxystate Wi-Fi off
// networksetup -setsocksfirewallproxystate Wi-Fi off
// networksetup -setautoproxystate Wi-Fi off

pub fn setup_http() -> bool {
	if let Err(e) = command::start("networksetup", &["-setwebproxy", "Wi-Fi", "127.0.0.1", "8689"]) {
		error!("Failed to start HTTP proxy: {}", e);
		false
	} else {
		info!("HTTP proxy started successfully");
		true
	}
}

pub fn setup_https() -> bool {
	if let Err(e) = command::start("networksetup", &["-setsecurewebproxy", "Wi-Fi", "127.0.0.1", "8689"]) {
		error!("Failed to start HTTPS proxy: {}", e);
		false
	} else {
		info!("HTTPS proxy started successfully");
		true
	}
}

pub fn setup_socks() -> bool {
	if let Err(e) = command::start("networksetup", &["-setsocksfirewallproxy", "Wi-Fi", "127.0.0.1", "8687"]) {
		error!("Failed to start SOCKS proxy: {}", e);
		false
	} else {
		info!("SOCKS proxy started successfully");
		true
	}
}

pub fn setup_pac() -> bool {
	if let Err(e) = command::start("networksetup", &["-setsecurewebproxy", "Wi-Fi", "127.0.0.1", "http://127.0.0.1:18687/dray/proxy.pac"]) {
		error!("Failed to set PAC file: {}", e);
		false
	} else {
		info!("PAC file set successfully");
		true
	}
}

pub fn disable_http_proxy() -> bool {
	if let Err(e) = command::start("networksetup", &["-setwebproxystate", "Wi-Fi", "off"]) {
		error!("Failed to disable HTTP proxy: {}", e);
		false
	} else {
		info!("HTTP proxy disabled successfully");
		true
	}
}

pub fn disable_https_proxy() -> bool {
	if let Err(e) = command::start("networksetup", &["-setsecurewebproxystate", "Wi-Fi", "off"]) {
		error!("Failed to disable HTTPS proxy: {}", e);
		false
	} else {
		info!("HTTPS proxy disabled successfully");
		true
	}
}

pub fn disable_socks_proxy() -> bool {
	if let Err(e) = command::start("networksetup", &["-setsocksfirewallproxystate", "Wi-Fi", "off"]) {
		error!("Failed to disable SOCKS proxy: {}", e);
		false
	} else {
		info!("SOCKS proxy disabled successfully");
		true
	}
}

pub fn disable_auto_proxy() -> bool {
	if let Err(e) = command::start("networksetup", &["-setautoproxystate", "Wi-Fi", "off"]) {
		error!("Failed to disable auto proxy: {}", e);
		false
	} else {
		info!("Auto proxy disabled successfully");
		true
	}
}
