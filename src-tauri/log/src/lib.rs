use chrono::Local;
use std::fs::{self, File};
use std::io::{self, BufWriter, Write};
use std::path::PathBuf;
use std::sync::OnceLock;
use std::sync::{Arc, Mutex, Once};

// 日志级别
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

// 日志配置
#[derive(Debug)]
struct LogConfig {
    log_filepath: Option<PathBuf>,
    max_log_size: u64,
    log_level: LogLevel,
}

impl LogConfig {
    fn new() -> Self {
        LogConfig {
            log_filepath: None,
            max_log_size: 5 * 1024 * 1024,
            log_level: LogLevel::Trace,
        }
    }

    fn set_log_filepath(&mut self, filepath: &str) -> io::Result<()> {
        let log_filepath = PathBuf::from(filepath);
        if let Some(parent_dir) = log_filepath.parent() {
            if !parent_dir.exists() {
                fs::create_dir_all(parent_dir)?;
            }
        }
        self.log_filepath = Some(log_filepath);
        Ok(())
    }

    fn set_max_log_size(&mut self, size: u64) {
        self.max_log_size = size;
    }

    fn set_log_level(&mut self, level: LogLevel) {
        self.log_level = level;
    }
}

// 日志器
#[derive(Debug)]
struct Logger {
    config: Arc<Mutex<LogConfig>>,
    file_writer: Mutex<Option<BufWriter<File>>>,
}

impl Logger {
    fn new() -> Self {
        let config = Arc::new(Mutex::new(LogConfig::new()));
        Logger {
            config,
            file_writer: Mutex::new(None),
        }
    }

    // 日志函数
    pub fn log(&self, level: LogLevel, message: &str) -> Result<(), Box<dyn std::error::Error>> {
        let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let log_message = format!("[{}] [{}] {}", timestamp, level_str(level), message);

        // 输出到控制台
        match level {
            LogLevel::Error => eprintln!("\x1b[31m{}\x1b[0m", log_message.trim_end()),
            LogLevel::Warn => eprintln!("\x1b[33m{}\x1b[0m", log_message.trim_end()),
            LogLevel::Info => eprintln!("\x1b[32m{}\x1b[0m", log_message.trim_end()),
            LogLevel::Debug => eprintln!("\x1b[34m{}\x1b[0m", log_message.trim_end()),
            LogLevel::Trace => eprintln!("\x1b[35m{}\x1b[0m", log_message.trim_end()),
        }

        let config = self.config.lock().unwrap();
        // 如果当前日志级别低于设置的级别，则不记录
        if level < config.log_level {
            return Ok(());
        }

        if let Some(log_filepath) = &config.log_filepath {
            // 同步写入日志文件
            let mut file_writer = self.file_writer.lock().unwrap();
            if let Some(writer) = file_writer.as_mut() {
                writeln!(writer, "{}", log_message)?;
                writer.flush()?;
            }

            // 判断文件大小是否超过最大值
            let metadata = fs::metadata(log_filepath)?;
            if metadata.len() > config.max_log_size {
                // 重命名文件
                let extension = log_filepath
                    .extension()
                    .and_then(|ext| ext.to_str())
                    .unwrap_or("");
                let timestamp = Local::now().format("%Y%m%d%H%M%S");
                let bak_filepath =
                    log_filepath.with_extension(format!("{}.{}", timestamp, extension));
                fs::rename(log_filepath, bak_filepath)?;

                // 打开新的文件
                *file_writer = Some(BufWriter::new(
                    File::options()
                        .append(true)
                        .create(true)
                        .open(log_filepath)?,
                ));
            }
        }

        Ok(())
    }

    // 设置日志文件路径
    pub fn set_log_filepath(&self, filepath: &str) -> io::Result<()> {
        let mut config = self.config.lock().unwrap();
        config.set_log_filepath(filepath)?;
        let log_filepath = config.log_filepath.clone().unwrap();
        *self.file_writer.lock().unwrap() = Some(BufWriter::new(
            File::options()
                .append(true)
                .create(true)
                .open(log_filepath)?,
        ));
        Ok(())
    }

    // 设置日志级别
    pub fn set_log_level(&self, level: LogLevel) {
        let mut config = self.config.lock().unwrap();
        config.set_log_level(level);
    }

    // 设置日志文件最大大小
    pub fn set_max_log_size(&self, size: u64) {
        let mut config = self.config.lock().unwrap();
        config.set_max_log_size(size);
    }
}

// 全局日志记录器
static GLOBAL_LOGGER: OnceLock<Logger> = OnceLock::new();
static LOGGER_INIT: Once = Once::new();

// 初始化全局日志记录器
pub fn init_logger(log_level: Option<LogLevel>, filepath: Option<&str>, max_log_size: Option<u64>) {
    LOGGER_INIT.call_once(|| {
        let logger = Logger::new();

        if let Some(level) = log_level {
            logger.set_log_level(level);
        }

        if let Some(fp) = filepath {
            if let Err(e) = logger.set_log_filepath(fp) {
                eprintln!("无法设置日志文件路径: {}", e);
            }
        }

        if let Some(size) = max_log_size {
            logger.set_max_log_size(size);
        }

        GLOBAL_LOGGER
            .set(logger)
            .expect("Logger already initialized");
    });
}

// 获取全局日志记录器
pub fn get_logger() -> &'static Logger {
    GLOBAL_LOGGER.get().expect("Logger not initialized")
}

// 日志级别字符串
pub fn level_str(level: LogLevel) -> &'static str {
    match level {
        LogLevel::Error => "error",
        LogLevel::Warn => "warn",
        LogLevel::Info => "info",
        LogLevel::Debug => "debug",
        LogLevel::Trace => "trace",
    }
}

// 定义日志宏
#[macro_export]
macro_rules! error {
    ($($arg:tt)*) => {
        if let Err(e) = $crate::get_logger().log($crate::LogLevel::Error, &format!($($arg)*)) {
            eprintln!("日志记录失败: {}", e);
        }
    };
}

#[macro_export]
macro_rules! warn {
    ($($arg:tt)*) => {
        if let Err(e) = $crate::get_logger().log($crate::LogLevel::Warn, &format!($($arg)*)) {
            eprintln!("日志记录失败: {}", e);
        }
    };
}

#[macro_export]
macro_rules! info {
    ($($arg:tt)*) => {
        if let Err(e) = $crate::get_logger().log($crate::LogLevel::Info, &format!($($arg)*)) {
            eprintln!("日志记录失败: {}", e);
        }
    };
}

#[macro_export]
macro_rules! debug {
    ($($arg:tt)*) => {
        if let Err(e) = $crate::get_logger().log($crate::LogLevel::Debug, &format!($($arg)*)) {
            eprintln!("日志记录失败: {}", e);
        }
    };
}

#[macro_export]
macro_rules! trace {
    ($($arg:tt)*) => {
        if let Err(e) = $crate::get_logger().log($crate::LogLevel::Trace, &format!($($arg)*)) {
            eprintln!("日志记录失败: {}", e);
        }
    };
}

/*fn main() {
    init_logger(
        Some(LogLevel::Trace),
        Some("logs/main.log"),
        Some(1 * 1024 * 1024),
    );
    // 测试性能的循环
    for i in 0..10 {
        trace!("这是一个日志，{}", i);
        debug!("这是一个日志，{}", i);
        info!("这是一个日志，{}", i);
        warn!("这是一个日志，{}", i);
        error!("这是一个日志，{}", i);
    }
}*/
