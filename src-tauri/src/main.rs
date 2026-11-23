#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg(target_os = "macos")]
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
            let window =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::App("index.html".into()))
                    .title("타각 — Tagak")
                    .inner_size(1120.0, 960.0)
                    .min_inner_size(760.0, 560.0);

            #[cfg(target_os = "macos")]
            let window = window.data_store_identifier(WEBKIT_DATA_STORE_ID);

            let window = window.build()?;

            #[cfg(target_os = "windows")]
            register_windows_screen_capture_shortcut(window);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run Tagak");
}

#[cfg(target_os = "windows")]
fn register_windows_screen_capture_shortcut(window: tauri::WebviewWindow) {
    use webview2_com::{
        AcceleratorKeyPressedEventHandler,
        Microsoft::Web::WebView2::Win32::COREWEBVIEW2_KEY_EVENT_KIND_KEY_DOWN,
    };

    // WebView2 reserves Ctrl+S for its browser accelerator, so forward that key to the app.
    let app_window = window.clone();
    let _ = window.with_webview(move |webview| unsafe {
        let controller = webview.controller();
        let handler = AcceleratorKeyPressedEventHandler::create(Box::new(move |_, args| {
            let Some(args) = args else { return Ok(()) };
            let mut key = 0;
            let mut kind = COREWEBVIEW2_KEY_EVENT_KIND_KEY_DOWN;
            let mut key_event_lparam = 0;
            args.VirtualKey(&mut key)?;
            args.KeyEventKind(&mut kind)?;
            args.KeyEventLParam(&mut key_event_lparam)?;

            if key == b'S' as u32
                && kind.0 == COREWEBVIEW2_KEY_EVENT_KIND_KEY_DOWN.0
                && key_event_lparam & (1 << 30) == 0
                && key_is_down(0x11)
                && !key_is_down(0x10)
                && !key_is_down(0x12)
            {
                args.SetHandled(true)?;
                let _ = app_window
                    .eval("window.dispatchEvent(new Event('tagak:screen-capture-shortcut'))");
            }

            Ok(())
        }));

        let mut token = 0;
        controller
            .add_AcceleratorKeyPressed(&handler, &mut token)
            .expect("failed to register WebView2 keyboard shortcut");
    });
}

#[cfg(target_os = "windows")]
fn key_is_down(virtual_key: i32) -> bool {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn GetKeyState(virtual_key: i32) -> i16;
    }

    unsafe { GetKeyState(virtual_key) < 0 }
}
