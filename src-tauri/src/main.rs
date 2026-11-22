#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

const WEBKIT_DATA_STORE_ID: [u8; 16] = [
    59, 115, 200, 135, 242, 170, 77, 19, 135, 10, 94, 240, 36, 52, 200, 57,
];

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                .title("타각 — Tagak")
                .inner_size(1120.0, 820.0)
                .min_inner_size(760.0, 560.0)
                .data_store_identifier(WEBKIT_DATA_STORE_ID)
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run Tagak");
}
