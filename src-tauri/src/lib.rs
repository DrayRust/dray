// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn dray(name: &str) -> String {
    format!("Hello, {}! Do you know Dray is great?", name) // 哈哈，测试用
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![dray])
        .run(tauri::generate_context!())
        .expect("error while running dray application");
}
