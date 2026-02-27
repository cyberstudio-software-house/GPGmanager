use rusqlite::{Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct HistoryItem {
    pub id: i64,
    pub ciphertext: String,
    pub created_at: String,
}

fn get_db_path(app: &AppHandle) -> PathBuf {
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");
    std::fs::create_dir_all(&data_dir).expect("failed to create data dir");
    data_dir.join("history.db")
}

pub fn init_db(app: &AppHandle) -> SqlResult<()> {
    let path = get_db_path(app);
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS decrypt_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ciphertext TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );",
    )?;
    Ok(())
}

#[tauri::command]
pub fn add_history_item(app: AppHandle, ciphertext: String) -> Result<i64, String> {
    let path = get_db_path(&app);
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO decrypt_history (ciphertext, created_at) VALUES (?1, datetime('now', 'localtime'))",
        [&ciphertext],
    )
    .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn get_history(app: AppHandle) -> Result<Vec<HistoryItem>, String> {
    let path = get_db_path(&app);
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, ciphertext, created_at FROM decrypt_history ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
    let items = stmt
        .query_map([], |row| {
            Ok(HistoryItem {
                id: row.get(0)?,
                ciphertext: row.get(1)?,
                created_at: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<Vec<_>>>()
        .map_err(|e| e.to_string())?;
    Ok(items)
}

#[tauri::command]
pub fn delete_history_item(app: AppHandle, id: i64) -> Result<(), String> {
    let path = get_db_path(&app);
    let conn = Connection::open(path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM decrypt_history WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
