use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "snake_case")]
pub enum GpgMode {
    #[default]
    System,
    Wsl,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppConfig {
    #[serde(default)]
    pub gpg_mode: GpgMode,
    #[serde(default)]
    pub custom_path: String,
}

pub struct ConfigState(pub Mutex<AppConfig>);

fn config_path(app: &AppHandle) -> PathBuf {
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&data_dir).expect("failed to create data dir");
    data_dir.join("config.json")
}

pub fn read_config(app: &AppHandle) -> AppConfig {
    let path = config_path(app);
    std::fs::read_to_string(&path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn write_config(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = config_path(app);
    let json = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())
}

pub fn make_gpg_cmd(config: &AppConfig, args: &[&str]) -> Command {
    let mut cmd = match config.gpg_mode {
        GpgMode::Wsl => {
            let mut c = Command::new("wsl");
            c.arg("gpg");
            c
        }
        GpgMode::Custom if !config.custom_path.is_empty() => {
            Command::new(&config.custom_path)
        }
        _ => Command::new("gpg"),
    };
    cmd.args(args);
    cmd
}
