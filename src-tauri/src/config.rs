use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::LazyLock;

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

static CONFIG: LazyLock<Config> = LazyLock::new(|| {
    if let Ok(config) = load_config_from_file("config.json") {
        config // 尝试从配置文件加载
    } else {
        Config::default() // 如果文件不存在或解析失败，使用默认值
    }
});

// 新增函数，返回 CONFIG 的引用
pub fn get_config() -> &'static Config {
    &CONFIG
}

fn load_config_from_file(file_path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let file_content = fs::read_to_string(file_path)?;
    let config: Config = serde_json::from_str(&file_content)?;
    Ok(config)
}
