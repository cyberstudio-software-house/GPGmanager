use serde::Serialize;
use std::process::Command;
use tauri::{AppHandle, State};

use crate::gpg_config::{AppConfig, ConfigState, GpgMode, write_config};

#[derive(Serialize)]
pub struct DetectResult {
    pub system_available: bool,
    pub wsl_available: bool,
}

fn probe(program: &str, args: &[&str]) -> bool {
    Command::new(program)
        .args(args)
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[tauri::command]
pub fn detect_gpg() -> DetectResult {
    DetectResult {
        system_available: probe("gpg", &["--version"]),
        wsl_available: probe("wsl", &["gpg", "--version"]),
    }
}

#[tauri::command]
pub fn get_config(state: State<ConfigState>) -> AppConfig {
    state.0.lock().unwrap().clone()
}

#[tauri::command]
pub fn save_config(
    app: AppHandle,
    state: State<ConfigState>,
    gpg_mode: String,
    custom_path: String,
) -> Result<(), String> {
    let mode = match gpg_mode.as_str() {
        "wsl" => GpgMode::Wsl,
        "custom" => GpgMode::Custom,
        _ => GpgMode::System,
    };
    let config = AppConfig { gpg_mode: mode, custom_path };
    write_config(&app, &config)?;
    *state.0.lock().unwrap() = config;
    Ok(())
}

