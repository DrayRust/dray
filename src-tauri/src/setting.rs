use logger::info;
use std::net::TcpListener;

use crate::{config, log, network, ray, web};

pub fn set_app_log_level(value: String) -> bool {
    config::set_app_log_level(value) && {
        log::init();
        true
    }
}

pub fn set_web_server_enable(value: bool) -> bool {
    let success = config::set_web_server_enable(value);
    if success {
        if value {
            web::start();
        } else {
            web::stop();
        }
    }
    success
}

pub fn set_web_server_host(value: String) -> bool {
    config::set_web_server_host(value) && {
        web::restart();
        true
    }
}

pub fn set_web_server_port(value: u32) -> bool {
    config::set_web_server_port(value) && {
        web::restart();
        true
    }
}

pub fn set_ray_enable(value: bool) -> bool {
    config::set_ray_enable(value)
        && if value {
            ray::start()
        } else {
            // ray::stop()
            ray::force_kill() && network::disable_proxies()
        }
}

pub fn set_ray_log_level(value: String) -> bool {
    config::set_ray_log_level(value) && ray::force_restart()
}

pub fn set_ray_host(value: String) -> bool {
    config::set_ray_host(value) && ray::force_restart() && network::setup_proxies()
}

pub fn set_ray_socks_port(value: u32) -> bool {
    config::set_ray_socks_port(value) && ray::force_restart() && network::setup_proxies()
}

pub fn set_ray_http_port(value: u32) -> bool {
    config::set_ray_http_port(value) && ray::force_restart() && network::setup_proxies()
}

pub fn set_ray_start_socks(value: bool) -> bool {
    config::set_ray_start_socks(value) && ray::force_restart()
}

pub fn set_ray_start_http(value: bool) -> bool {
    config::set_ray_start_http(value) && ray::force_restart()
}

pub fn set_auto_setup_pac(value: bool) -> bool {
    if value {
        network::enable_auto_proxy();
    } else {
        network::disable_auto_proxy();
    }
    config::set_auto_setup_pac(value)
}

pub fn set_auto_setup_socks(value: bool) -> bool {
    if value {
        network::enable_socks_proxy();
    } else {
        network::disable_socks_proxy();
    }
    config::set_auto_setup_socks(value)
}

pub fn set_auto_setup_http(value: bool) -> bool {
    if value {
        network::enable_web_proxy();
    } else {
        network::disable_web_proxy();
    }
    config::set_auto_setup_http(value)
}

pub fn set_auto_setup_https(value: bool) -> bool {
    if value {
        network::enable_secure_web_proxy();
    } else {
        network::disable_secure_web_proxy();
    }
    config::set_auto_setup_https(value)
}

pub fn check_port_available(port: u32) -> bool {
    let address = format!("127.0.0.1:{}", port);
    match TcpListener::bind(&address) {
        Ok(_) => true,
        Err(e) => {
            info!("Port {} is not available: {}", port, e);
            false
        }
    }
}
