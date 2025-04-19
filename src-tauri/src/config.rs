use crate::dirs;
use logger::{debug, error, info};
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::sync::LazyLock;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub app_log_level: String,

    pub web_server_enable: bool,
    pub web_server_host: String,
    pub web_server_port: u32,

    pub ray_enable: bool,
    pub ray_host: String,
    pub ray_socks_port: u32,
    pub ray_http_port: u32,

    pub auto_setup_pac: bool,
    pub auto_setup_socks: bool,
    pub auto_setup_http: bool,
    pub auto_setup_https: bool,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            app_log_level: "info".to_string(),

            web_server_enable: true,
            web_server_host: "127.0.0.1".to_string(),
            web_server_port: 18687,

            ray_enable: false,
            ray_host: "127.0.0.1".to_string(),
            ray_socks_port: 1086,
            ray_http_port: 1089,

            auto_setup_pac: false,
            auto_setup_socks: true,
            auto_setup_http: false,
            auto_setup_https: false,
        }
    }
}

static CONFIG: LazyLock<Mutex<Config>> = LazyLock::new(|| Mutex::new(Config::default()));
static CONFIG_PATH: LazyLock<Mutex<PathBuf>> = LazyLock::new(|| Mutex::new(PathBuf::new()));

fn ensure_conf_dir() -> bool {
    let conf_dir = dirs::get_dray_conf_dir().unwrap();
    if !conf_dir.exists() {
        if let Err(e) = fs::create_dir_all(&conf_dir) {
            error!("Failed to create config directory: {}", e);
            return false;
        }
    }
    true
}

pub fn init() {
    if !ensure_conf_dir() {
        return;
    }

    // 配置文件路径
    let config_path = dirs::get_dray_conf_dir().unwrap().join("config.json");
    *CONFIG_PATH.lock().unwrap() = config_path.clone();

    // 如果配置文件存在，则加载
    if config_path.exists() {
        match load_config_from_file(config_path.to_str().unwrap()) {
            Ok(config) => {
                *CONFIG.lock().unwrap() = config;
                debug!("Config loaded successfully");
            }
            Err(e) => {
                error!("Failed to load config file: {}", e);
            }
        }
    } else {
        // 如果配置文件不存在，则创建默认配置并保存
        if let Err(e) = save_config_to_file(&get_config(), config_path.to_str().unwrap()) {
            error!("Failed to create default config file: {}", e);
        }
    }
}

pub fn get_config() -> Config {
    CONFIG.lock().unwrap().clone()
}

pub fn get_config_json() -> String {
    let config = get_config();
    serde_json::to_string_pretty(&config).unwrap_or_else(|e| {
        error!("Failed to serialize config to JSON: {}", e);
        "{}".to_string()
    })
}

pub fn load_config_from_file(file_path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let file_content = fs::read_to_string(file_path)?;
    let config: Config = serde_json::from_str(&file_content)?;
    Ok(config)
}

pub fn save_config_to_file(config: &Config, file_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    // 更新全局配置
    *CONFIG.lock().unwrap() = config.clone();

    // 保存配置到文件
    let config_json = serde_json::to_string_pretty(config)?;
    fs::write(file_path, config_json)?;

    Ok(())
}

fn set_config<F>(updater: F) -> bool
where
    F: FnOnce(&mut Config),
{
    let mut config = get_config();
    updater(&mut config);
    save_config_to_file(&config, CONFIG_PATH.lock().unwrap().to_str().unwrap())
        .map_err(|e| {
            error!("Failed to update config: {}", e);
            e
        })
        .is_ok()
}

pub fn set_app_log_level(value: String) -> bool {
    set_config(|config| config.app_log_level = value)
}

pub fn set_web_server_enable(value: bool) -> bool {
    set_config(|config| config.web_server_enable = value)
}

pub fn set_web_server_host(value: String) -> bool {
    set_config(|config| config.web_server_host = value)
}

pub fn set_web_server_port(value: u32) -> bool {
    set_config(|config| config.web_server_port = value)
}

pub fn set_ray_enable(value: bool) -> bool {
    set_config(|config| config.ray_enable = value)
}

pub fn set_ray_host(value: String) -> bool {
    set_config(|config| config.ray_host = value)
}

pub fn set_ray_socks_port(value: u32) -> bool {
    set_config(|config| config.ray_socks_port = value)
}

pub fn set_ray_http_port(value: u32) -> bool {
    set_config(|config| config.ray_http_port = value)
}

pub fn set_auto_setup_pac(value: bool) -> bool {
    set_config(|config| config.auto_setup_pac = value)
}

pub fn set_auto_setup_socks(value: bool) -> bool {
    set_config(|config| config.auto_setup_socks = value)
}

pub fn set_auto_setup_http(value: bool) -> bool {
    set_config(|config| config.auto_setup_http = value)
}

pub fn set_auto_setup_https(value: bool) -> bool {
    set_config(|config| config.auto_setup_https = value)
}

const ALLOWED_CONFIG_FILES: [&str; 9] = [
    "ray_common_config.json",
    "server.json",
    "subscription.json",
    "rule_config.json",
    "rule_domain.json",
    "rule_mode_list.json",
    "dns_config.json",
    "dns_mode_list.json",
    "dns_table_list.json"
];

fn get_conf_path(filename: &str) -> Result<PathBuf, String> {
    if !ALLOWED_CONFIG_FILES.contains(&filename) {
        return Err(format!("Filename '{}' is not allowed", filename));
    }
    Ok(dirs::get_dray_conf_dir().unwrap().join(filename))
}

pub fn read_conf(filename: &str) -> String {
    debug!("Read: {}", filename);
    match get_conf_path(filename) {
        Ok(config_path) => {
            if !config_path.exists() {
                if let Err(e) = fs::File::create(&config_path) {
                    error!("Failed to create config file: {}", e);
                    return "".to_string();
                }
            }
            fs::read_to_string(&config_path).unwrap_or_else(|e| {
                error!("Failed to read config file: {}", e);
                "".to_string()
            })
        }
        Err(_e) => {
            // error!("Failed to get config path: {}", _e);
            "".to_string()
        }
    }
}

pub fn save_conf(filename: &str, content: &str) -> bool {
    match get_conf_path(filename) {
        Ok(config_path) => match fs::File::create(&config_path) {
            Ok(mut file) => {
                if let Err(e) = file.write_all(content.as_bytes()) {
                    error!("Failed to write config file: {}", e);
                    false
                } else {
                    info!("Config saved successfully: {}", filename);
                    true
                }
            }
            Err(e) => {
                error!("Failed to create config file: {}", e);
                false
            }
        },
        Err(e) => {
            error!("{}", e);
            false
        }
    }
}
