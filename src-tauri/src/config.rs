use crate::dirs;
use logger::{error, info};
use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::LazyLock;
use std::sync::Mutex;

/**
使用释例：

mod config;

fn main() {
    let mut config = config::get_config();
    println!("{:?}", config);

    // 修改配置
    config.log_level = "Error".to_string();
    config.log_max_size = 10;

    // 保存修改后的配置
    if let Err(e) = config::save_config_to_file(&config, "config.json") {
        eprintln!("Failed to save config: {}", e);
    } else {
        println!("Config saved successfully");
    }

    // 打印修改后的配置
    println!("Updated Config: {:?}", config);

    // 读取，对比是否修改成功
    let config = config::get_config();
    println!("{:?}", config);
}
*/

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub web_server_enable: bool,
    pub web_server_host: String,
    pub web_server_port: u32,

    pub ray_log_level: String,
    pub ray_host: String,
    pub ray_socks_port: u32,
    pub ray_http_port: u32,

    pub ray_start_socks: bool,
    pub ray_start_http: bool,

    pub auto_setup_pac: bool,
    pub auto_setup_socks: bool,
    pub auto_setup_http: bool,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            web_server_enable: true,
            web_server_host: "127.0.0.1".to_string(),
            web_server_port: 18687,

            ray_log_level: "Error".to_string(),
            ray_host: "127.0.0.1".to_string(),
            ray_socks_port: 1086,
            ray_http_port: 1089,

            ray_start_socks: true,
            ray_start_http: true,

            auto_setup_pac: false,
            auto_setup_socks: true,
            auto_setup_http: false,
        }
    }
}

static CONFIG: LazyLock<Mutex<Config>> = LazyLock::new(|| Mutex::new(Config::default()));

pub fn init() {
    // 首先确保配置目录存在
    let conf_dir = match dirs::get_dray_conf_dir() {
        Ok(dir) => {
            if !dir.exists() {
                if let Err(e) = fs::create_dir_all(&dir) {
                    error!("Failed to create config directory: {}", e);
                    return;
                }
            }
            dir
        }
    };

    // 配置文件路径
    let config_path = conf_dir.join("config.json");

    // 如果配置文件存在，则加载
    if config_path.exists() {
        match load_config_from_file(config_path.to_str().unwrap()) {
            Ok(config) => {
                *CONFIG.lock().unwrap() = config;
                info!("Config loaded successfully");
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
