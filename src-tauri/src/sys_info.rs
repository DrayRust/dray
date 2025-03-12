use serde::Serialize;
use serde_json::json;
use sysinfo::{Components, Disks, System};

#[derive(Serialize)]
struct SystemInfo {
	os: String,
	kernel_version: String,
	hostname: String,
	cpu_count: usize,
	memory_total: u64,
	memory_used: u64,
	swap_total: u64,
	swap_used: u64,
	disks: Vec<DiskInfo>,
	components: Vec<ComponentInfo>,
}

#[derive(Serialize)]
struct DiskInfo {
	name: String,
	total_space: u64,
	available_space: u64,
}

#[derive(Serialize)]
struct ComponentInfo {
	label: String,
	temperature: f32,
}

pub fn sys_info_json() -> serde_json::Value {
	let mut sys = System::new_all();
	sys.refresh_all();

	let disks = sys_info::Disks::new_with_refreshed_list();
	let disk_info = disks.iter().map(|disk| DiskInfo {
		name: disk.name().to_string_lossy().to_string(),
		total_space: disk.total_space(),
		available_space: disk.available_space(),
	}).collect::<Vec<_>>();

	let components = sys_info::Components::new_with_refreshed_list();
	let component_info = components.iter().map(|component| ComponentInfo {
		label: component.label().to_string(),
		temperature: component.temperature(),
	}).collect::<Vec<_>>();

	let sys_info = SystemInfo {
		os: std::env::consts::OS.to_string(),
		kernel_version: sys_info::linux_os_release().unwrap_or_default(),
		hostname: sys_info::hostname().unwrap_or_default(),
		cpu_count: sys_info::cpu_num().unwrap_or(0),
		memory_total: sys.mem_info().unwrap_or_default().total,
		memory_used: sys.used_memory(),
		swap_total: sys.total_swap(),
		swap_used: sys.used_swap(),
		disks: disk_info,
		components: component_info,
	};

	json!({
        "os": sys_info.os,
        "kernel_version": sys_info.kernel_version,
        "hostname": sys_info.hostname,
        "cpu_count": sys_info.cpu_count,
        "memory_total": sys_info.memory_total,
        "memory_used": sys_info.memory_used,
        "swap_total": sys_info.swap_total,
        "swap_used": sys_info.swap_used,
        "disks": sys_info.disks,
        "components": sys_info.components,
    })
}
