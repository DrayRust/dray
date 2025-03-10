use std::process::{Child, Command};
use std::sync::Mutex;

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
    }
    Ok(())
}
