use tauri::{plugin::Plugin, AppHandle, RunEvent, Runtime};
use crate::network;
use crate::ray;

struct CleanupPlugin;

impl<R: Runtime> Plugin<R> for CleanupPlugin {
	fn name(&self) -> &'static str {
		"cleanup-plugin"
	}

	fn on_event(&mut self, _app: &AppHandle<R>, event: &RunEvent) {
		match event {
			RunEvent::Exit => {
				network::disable_proxies();
				ray::force_kill_ray();
			}
			_ => {}
		}
	}
}
