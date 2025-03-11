use std::process::{Child, Command};
use std::sync::Mutex;

/**
使用释例：
mod command;

fn main() {
	if let Err(e) = command::start("./ray-bin/ray", &["-c", "./ray-bin/config.json"]) {
		eprintln!("{}", e);
	}
	println!("启动命令发送完成");

	println!("等待 10 s");
	std::thread::sleep(std::time::Duration::from_secs(10));

	if let Err(e) = command::stop() {
		eprintln!("{}", e);
	}
	println!("停止命令执行完成");

	// 阻塞主线程，直到收到 Ctrl+C 信号
	let rt = tokio::runtime::Runtime::new().unwrap();
	rt.block_on(async {
		tokio::signal::ctrl_c().await.unwrap();
	});
}
*/

static CHILD_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

pub fn start(command: &str, args: &[&str]) -> Result<(), Box<dyn std::error::Error>> {
	let child = Command::new(command)
		.args(args)
		.spawn()
		.map_err(|e| format!("Failed to start command: {}", e))?;

	*CHILD_PROCESS
		.lock()
		.map_err(|_| "Failed to lock CHILD_PROCESS")? = Some(child);

	Ok(())
}

pub fn stop() -> Result<(), Box<dyn std::error::Error>> {
	if let Some(mut child) = CHILD_PROCESS
		.lock()
		.map_err(|_| "Failed to lock CHILD_PROCESS")?
		.take()
	{
		child.kill()?;
	} else {
		return Err("No child process found".into());
	}
	Ok(())
}
