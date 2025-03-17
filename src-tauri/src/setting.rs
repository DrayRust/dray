use crate::config;
use crate::web;

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
    config::set_web_server_host(value) && { web::restart(); true }
}

pub fn set_web_server_port(value: u32) -> bool {
    config::set_web_server_port(value) && { web::restart(); true }
}

pub fn set_ray_log_level(value: String) -> bool {
    config::set_ray_log_level(value)
}

pub fn set_ray_host(value: String) -> bool {
    config::set_ray_host(value)
}

pub fn set_ray_socks_port(value: u32) -> bool {
    config::set_ray_socks_port(value)
}

pub fn set_ray_http_port(value: u32) -> bool {
    config::set_ray_http_port(value)
}

pub fn set_ray_start_socks(value: bool) -> bool {
    config::set_ray_start_socks(value)
}

pub fn set_ray_start_http(value: bool) -> bool {
    config::set_ray_start_http(value)
}

pub fn set_auto_setup_pac(value: bool) -> bool {
    config::set_auto_setup_pac(value)
}

pub fn set_auto_setup_socks(value: bool) -> bool {
    config::set_auto_setup_socks(value)
}

pub fn set_auto_setup_http(value: bool) -> bool {
    config::set_auto_setup_http(value)
}
