use logger::{error, info, debug};
use std::process::{Child, Command};
use std::sync::Mutex;
use crate::dirs;

pub fn start() -> bool {
	let mut child_process = CHILD_PROCESS
		.lock()
		.map_err(|_| {
			error!("Failed to lock CHILD_PROCESS");
			return false;
		})
		.unwrap();

	if child_process.is_some() {
		error!("Command is already running");
		return false;
	}

	let ray_dir = dirs::get_dray_ray_dir().unwrap();
	let ray_path: String = ray_dir.join("xray").to_str().unwrap().to_string();
	let ray_config_path: String = ray_dir.join("config.json").to_str().unwrap().to_string();
	debug!("ray_path: {}", ray_path);
	debug!("ray_config_path: {}", ray_config_path);

	if let Err(e) = start_command(&*ray_path, &["-c", &*ray_config_path]) {
		error!("Failed to start Ray Server: {}", e);
		false
	} else {
		info!("Ray Server started successfully");
		true
	}
}

pub fn stop() -> bool {
	if let Err(e) = stop_command() {
		error!("Failed to stop Ray Server: {}", e);
		false
	} else {
		info!("Ray Server stopped successfully");
		true
	}
}

static CHILD_PROCESS: Mutex<Option<Child>> = Mutex::new(None);

fn start_command(command: &str, args: &[&str]) -> Result<(), Box<dyn std::error::Error>> {
	let mut child_process = CHILD_PROCESS
		.lock()
		.map_err(|_| "Failed to lock CHILD_PROCESS")?;

	let child = Command::new(command)
		.args(args)
		.spawn()
		.map_err(|e| format!("Failed to start command: {}", e))?;

	*child_process = Some(child);

	Ok(())
}

fn stop_command() -> Result<(), Box<dyn std::error::Error>> {
	if let Some(mut child) = CHILD_PROCESS
		.lock()
		.map_err(|_| "Failed to lock CHILD_PROCESS")?
		.take()
	{
		child.kill()?;
		child.wait()?;
	} else {
		return Err("No child process found".into());
	}
	Ok(())
}
