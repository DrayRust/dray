use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::LazyLock;
use std::sync::Mutex;

/**
    使用方法：
    mod config;

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
*/

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Config {
    pub web_server_host: String,
    pub web_server_port: u32,
    pub log_level: String,
    pub log_filepath: String,
    pub log_max_size: u32,
    pub ray_path: String,
    pub ray_config_path: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            web_server_host: "127.0.0.1".to_string(),
            web_server_port: 18687,
            log_level: "Trace".to_string(),
            log_filepath: "./logs/dray.log".to_string(),
            log_max_size: 2, // 单位为 MB
            ray_path: "./v2ray-core/v2ray".to_string(),
            ray_config_path: "./v2ray-core/config.json".to_string(),
        }
    }
}

static CONFIG: LazyLock<Mutex<Config>> = LazyLock::new(|| {
    Mutex::new(load_config_from_file("config.json").unwrap_or_else(|_| Config::default()))
});

pub fn get_config() -> Config {
    CONFIG.lock().unwrap().clone()
}

pub fn load_config_from_file(file_path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let file_content = fs::read_to_string(file_path)?;
    let config: Config = serde_json::from_str(&file_content)?;
    Ok(config)
}

pub fn save_config_to_file(
    config: &Config,
    file_path: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    // 更新全局配置
    *CONFIG.lock().unwrap() = config.clone();

    // 保存配置到文件
    let config_json = serde_json::to_string_pretty(config)?;
    fs::write(file_path, config_json)?;

    Ok(())
}
