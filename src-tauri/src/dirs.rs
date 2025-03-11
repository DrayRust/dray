use std::env;
use dirs;
use once_cell::sync::Lazy;
use serde::Serialize;
use serde_json;

/**
测试：
fn main() {
	println!("Executable Path: {:?}", get_executable_path());
	println!("Current Dir: {:?}", get_current_dir());
	println!("Home Dir: {:?}", get_home_dir());
	println!("Data Dir: {:?}", get_data_dir());
	println!("Paths JSON: {}", get_paths_json());
}
*/

#[derive(Serialize)]
struct Paths {
	audio_dir: Option<std::path::PathBuf>,
	cache_dir: Option<std::path::PathBuf>,
	config_dir: Option<std::path::PathBuf>,
	current_dir: Option<std::path::PathBuf>,
	data_dir: Option<std::path::PathBuf>,
	desktop_dir: Option<std::path::PathBuf>,
	document_dir: Option<std::path::PathBuf>,
	download_dir: Option<std::path::PathBuf>,
	executable_path: Option<std::path::PathBuf>,
	font_dir: Option<std::path::PathBuf>,
	home_dir: Option<std::path::PathBuf>,
	picture_dir: Option<std::path::PathBuf>,
	public_dir: Option<std::path::PathBuf>,
	video_dir: Option<std::path::PathBuf>,
}

static EXECUTABLE_PATH: Lazy<Option<std::path::PathBuf>> = Lazy::new(|| env::current_exe().ok());
static CURRENT_DIR: Lazy<Option<std::path::PathBuf>> = Lazy::new(|| env::current_dir().ok());
static HOME_DIR: Lazy<Option<std::path::PathBuf>> = Lazy::new(|| dirs::home_dir());
static DATA_DIR: Lazy<Option<std::path::PathBuf>> = Lazy::new(|| dirs::data_dir());

/// Get the path of the current executable.
/// Returns an `Option<std::path::PathBuf>`, containing the path if successful, otherwise `None`.
pub fn get_executable_path() -> Option<std::path::PathBuf> {
	EXECUTABLE_PATH.clone()
}

/// Get the path of the current working directory.
/// Returns an `Option<std::path::PathBuf>`, containing the path if successful, otherwise `None`.
pub fn get_current_dir() -> Option<std::path::PathBuf> {
	CURRENT_DIR.clone()
}

/// Get the path of the user's home directory.
/// Returns an `Option<std::path::PathBuf>`, containing the path if successful, otherwise `None`.
pub fn get_home_dir() -> Option<std::path::PathBuf> {
	HOME_DIR.clone()
}

/// Get the path of the application data directory.
/// Returns an `Option<std::path::PathBuf>`, containing the path if successful, otherwise `None`.
pub fn get_data_dir() -> Option<std::path::PathBuf> {
	DATA_DIR.clone()
}

pub fn get_paths_json() -> String {
	let dirs = Paths {
		audio_dir: dirs::audio_dir(),
		cache_dir: dirs::cache_dir(),
		config_dir: dirs::config_dir(),
		current_dir: CURRENT_DIR.clone(),
		data_dir: DATA_DIR.clone(),
		desktop_dir: dirs::desktop_dir(),
		document_dir: dirs::document_dir(),
		download_dir: dirs::download_dir(),
		executable_path: EXECUTABLE_PATH.clone(),
		font_dir: dirs::font_dir(),
		home_dir: HOME_DIR.clone(),
		picture_dir: dirs::picture_dir(),
		public_dir: dirs::public_dir(),
		video_dir: dirs::video_dir(),
	};
	serde_json::to_string(&dirs).unwrap_or_else(|e| {
		eprintln!("Failed to serialize Paths to JSON: {}", e);
		"{}".to_string()
	})
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_get_executable_path() {
		let path = get_executable_path();
		assert!(path.is_some(), "Executable path should be available");
	}

	#[test]
	fn test_get_current_dir() {
		let path = get_current_dir();
		assert!(path.is_some(), "Current directory should be available");
	}

	#[test]
	fn test_get_home_dir() {
		let path = get_home_dir();
		assert!(path.is_some(), "Home directory should be available");
	}

	#[test]
	fn test_get_data_dir() {
		let path = get_data_dir();
		assert!(path.is_some(), "Data directory should be available");
	}

	#[test]
	fn test_get_paths_json() {
		let json = get_paths_json();
		assert!(!json.is_empty(), "Paths JSON should not be empty");
	}
}
