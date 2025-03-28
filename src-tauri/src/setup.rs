use crate::dirs;
use crate::config;
use crate::ray;
use crate::web;
use crate::network;
use logger::{error, info};
use tauri::{App, Manager, Runtime};
use tauri::path::BaseDirectory;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::menu::{Submenu, MenuBuilder, PredefinedMenuItem};
use std::fs;
use std::os::unix::fs::PermissionsExt;

pub fn init<R: Runtime>(app: &App<R>) -> tauri::Result<()> {
    if let Err(e) = set_main_window(app) {
        error!("Failed to set main window: {}", e);
    }

    if let Err(e) = set_tray(app) {
        error!("Failed to set tray: {}", e);
    }

    if let Err(e) = set_menu(app) {
        error!("Failed to set menu: {}", e);
    }

    let resource_dir = app.handle().path().resolve("ray", BaseDirectory::Resource)?;
    tauri::async_runtime::spawn(async move {
        if let Err(e) = prepare_ray_resources(resource_dir) {
            error!("Failed to prepare ray resources: {}", e);
        } else {
            start_services();
        }
    });

    Ok(())
}

fn set_main_window<R: Runtime>(app: &App<R>) -> tauri::Result<()> {
    let app = app.handle();
    let main_window = app.get_webview_window("main").unwrap();

    // #[cfg(target_os = "windows")]
    main_window.set_skip_taskbar(true)?;

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory)?;

    let app = app.clone();
    main_window.clone().on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { api, .. } = event {
            api.prevent_close();
            main_window.hide().unwrap();

            #[cfg(target_os = "macos")]
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        }
    });

    Ok(())
}

fn set_tray<R: Runtime>(app: &App<R>) -> tauri::Result<()> {
    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } => {
                if let Some(window) = tray.app_handle().get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        })
        .build(app)?;
    Ok(())
}

fn set_menu<R: Runtime>(app: &App<R>) -> tauri::Result<()> {
    #[cfg(not(target_os = "macos"))]
    {
        // Linux 和 Windows 不显示菜单
        let menu = MenuBuilder::new(app).build()?;
        app.set_menu(menu)?;
    }

    #[cfg(target_os = "macos")]
    {
        let app_handle = app.handle();
        let edit_menu = Submenu::with_items(
            app_handle,
            "Edit",
            true,
            &[
                &PredefinedMenuItem::undo(app_handle, None)?,
                &PredefinedMenuItem::redo(app_handle, None)?,
                &PredefinedMenuItem::separator(app_handle)?,
                &PredefinedMenuItem::cut(app_handle, None)?,
                &PredefinedMenuItem::copy(app_handle, None)?,
                &PredefinedMenuItem::paste(app_handle, None)?,
                &PredefinedMenuItem::select_all(app_handle, None)?,
            ],
        )?;

        let menu = MenuBuilder::new(app).item(&edit_menu).build()?;
        app.set_menu(menu)?;
    }

    Ok(())
}

fn prepare_ray_resources(resource_dir: std::path::PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    if !resource_dir.exists() {
        return Ok(());
    }

    let target_dir = dirs::get_dray_ray_dir().ok_or("Failed to get dray ray directory")?;
    if target_dir.exists() {
        fs::remove_dir_all(&target_dir)?;
    }
    fs::create_dir_all(&target_dir)?;

    info!("Copying ray resources {} to {}", resource_dir.display(), target_dir.display());
    for entry in fs::read_dir(&resource_dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_file() {
            let dest = target_dir.join(entry.file_name());
            fs::copy(&path, &dest)?;

            #[cfg(unix)] // 适用于 macOS 和 Linux
            {
                let mut perms = fs::metadata(&dest)?.permissions();
                if entry.file_name() == "dray-xray" {
                    perms.set_mode(0o755);
                } else {
                    perms.set_mode(0o644);
                }
                fs::set_permissions(&dest, perms)?;
            }

            #[cfg(windows)] // 适用于 Windows
            {
                let mut perms = fs::metadata(&dest)?.permissions();
                perms.set_readonly(false);
                fs::set_permissions(&dest, perms)?;
            }
        }
    }

    fs::remove_dir_all(&resource_dir)?;

    Ok(())
}

fn start_services() {
    let config = config::get_config();
    if config.ray_enable {
        ray::start();
        network::setup_proxies();
    }
    if config.web_server_enable {
        web::start();
    }
}
