use logger::trace;
use once_cell::sync::Lazy;
use serde_json::{json, Value};
use std::sync::Mutex;
use std::time::Instant;
use sysinfo::{Components, Disks, Networks, System, Users};

static SYS: Lazy<Mutex<Option<System>>> = Lazy::new(|| Mutex::new(None));

fn get_or_init_system() -> std::sync::MutexGuard<'static, Option<System>> {
    let mut sys = SYS.lock().unwrap();
    sys.get_or_insert_with(|| System::new_all());
    sys
}

pub fn get_sys_info_json() -> Value {
    let start = Instant::now();
    let mut sys = get_or_init_system();
    sys.as_mut().map(|sys| sys.refresh_all());
    let sys = sys.as_ref().unwrap();
    trace!("System info refresh all, time elapsed: {:?}", start.elapsed());

    json!({
        "long_os_version": System::long_os_version(), // 操作系统长版本信息
        "kernel_long_version": System::kernel_long_version(), // 操作系统内核版本
        "host_name": System::host_name(), // 系统主机名
        "uptime": System::uptime(), // 系统运行时间（以秒为单位）
        "physical_core_count": System::physical_core_count(), // CPU 物理核心数量
        "cpus": sys.cpus().len(), // CPU 核数
        "cpu_arch": System::cpu_arch(), // CPU 架构信息
        "memory": {
            "total_memory": sys.total_memory(),
            "used_memory": sys.used_memory(),
            "total_swap": sys.total_swap(),
            "used_swap": sys.used_swap(),
        }
    })
}

pub fn get_load_average_json() -> Value {
    let load_avg = System::load_average();
    json!({
        "one": load_avg.one,
        "five": load_avg.five,
        "fifteen": load_avg.fifteen,
    })
}

pub fn get_processes_json() -> Value {
    let mut sys = get_or_init_system();
    sys.as_mut().map(|sys| sys.refresh_all());
    let sys = sys.as_ref().unwrap();
    let users = Users::new_with_refreshed_list();

    let process_vec = sys
        .processes()
        .iter()
        .map(|(pid, process)| {
            let username = process.user_id().and_then(|user_id| {
                users.get_user_by_id(user_id).map(|user| user.name().to_string())
            }).unwrap_or_default();

            json!({
                "pid": pid.as_u32(),
                "status": process.status().to_string(),
                "memory": process.memory(),
                // "virtual_memory": process.virtual_memory(),
                "user": username,
                "cpu_usage": process.cpu_usage(),
                "start_time": process.start_time(),
                "name": process.name().to_string_lossy().to_string(),
                "exe": process.exe().map_or("".to_string(), |v| v.to_string_lossy().into_owned()),
            })
        })
        .collect::<Vec<_>>();
    json!(process_vec)
}

pub fn get_disks_json() -> Value {
    let disks = Disks::new_with_refreshed_list()
        .iter()
        .map(|disk| {
            json!({
                "name": disk.name().to_string_lossy().to_string(),
                "total_space": disk.total_space(),
                "available_space": disk.available_space(),
            })
        })
        .collect::<Vec<_>>();
    json!(disks)
}

pub fn get_networks_json() -> Value {
    let mut network_vec = Vec::new();
    let networks = Networks::new_with_refreshed_list();
    for (interface_name, data) in &networks {
        network_vec.push(json!({
            "name": interface_name,
            "up": data.total_transmitted(),
            "down": data.total_received(),
        }));
    }
    json!(network_vec)
}

pub fn get_components_json() -> Value {
    let components = Components::new_with_refreshed_list()
        .iter()
        .map(|component| {
            json!({
                "label": component.label().to_string(),
                "temperature": component.temperature().map_or("".to_string(), |v| v.to_string()),
            })
        })
        .collect::<Vec<_>>();
    json!(components)
}
