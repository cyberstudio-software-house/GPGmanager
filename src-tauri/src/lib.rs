mod commands;

use commands::crypto::{decrypt_message, encrypt_message};
use commands::history::{add_history_item, delete_history_item, get_history, init_db};
use commands::keys::{delete_key, export_key, generate_key, import_key, list_keys, list_secret_keys};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            init_db(&app.handle().clone()).map_err(|e| e.to_string())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_keys,
            list_secret_keys,
            generate_key,
            import_key,
            export_key,
            delete_key,
            encrypt_message,
            decrypt_message,
            add_history_item,
            get_history,
            delete_history_item,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
