#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod window_state;

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let (_window, saved_window_state) = window_state::build_main_window(app)?;
            app.manage(saved_window_state);

            #[cfg(target_os = "windows")]
            register_windows_screen_capture_shortcut(_window);

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("failed to run Tagak");

    app.run(|app_handle, event| {
        if matches!(
            event,
            tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit
        ) {
            window_state::save_on_exit(app_handle);
        }
    });
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
