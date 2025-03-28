use serde::Serialize;
use serde_json::json;
use sysinfo::{Components, Disks, System};

#[derive(Serialize)]
struct SystemInfo {
    os: String,
    kernel_version: String,
    hostname: String,
    cpu_count: String,
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
    temperature: String,
}

pub fn get_sys_info_json() -> String {
    let mut sys = System::new_all();
    sys.refresh_all();

    let disks = Disks::new_with_refreshed_list();
    let disk_info = disks
        .iter()
        .map(|disk| DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            total_space: disk.total_space(),
            available_space: disk.available_space(),
        })
        .collect::<Vec<_>>();

    let components = Components::new_with_refreshed_list();
    let component_info = components
        .iter()
        .map(|component| ComponentInfo {
            label: component.label().to_string(),
            temperature: format!("{:?}", component.temperature()),
        })
        .collect::<Vec<_>>();

    let sys_info = SystemInfo {
        os: std::env::consts::OS.to_string(),
        kernel_version: format!("{:?}", System::kernel_version()),
        hostname: format!("{:?}", System::host_name()),
        cpu_count: format!("{}", sys.cpus().len()),
        memory_total: sys.total_memory(),
        memory_used: sys.used_memory(),
        swap_total: sys.total_swap(),
        swap_used: sys.used_swap(),
        disks: disk_info,
        components: component_info,
    };

    serde_json::to_string(&json!({
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
    }))
    .unwrap()
}
