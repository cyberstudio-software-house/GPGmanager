use serde::{Deserialize, Serialize};
use std::io::Write;
use std::process::{Command, Stdio};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GpgKey {
    pub fingerprint: String,
    pub key_id: String,
    pub name: String,
    pub email: String,
    pub key_type: String,
    pub created: String,
    pub expires: Option<String>,
    pub has_secret: bool,
}

fn parse_colons_output(output: &str, has_secret: bool) -> Vec<GpgKey> {
    let mut keys: Vec<GpgKey> = Vec::new();
    let mut current_key: Option<GpgKey> = None;

    for line in output.lines() {
        let fields: Vec<&str> = line.split(':').collect();
        if fields.len() < 10 {
            continue;
        }

        match fields[0] {
            "pub" | "sec" => {
                if let Some(key) = current_key.take() {
                    keys.push(key);
                }
                let key_type = if fields[0] == "sec" { "secret" } else { "public" }.to_string();
                let created = fields[5].to_string();
                let expires = if fields[6].is_empty() {
                    None
                } else {
                    Some(fields[6].to_string())
                };
                current_key = Some(GpgKey {
                    fingerprint: String::new(),
                    key_id: fields[4].to_string(),
                    name: String::new(),
                    email: String::new(),
                    key_type,
                    created,
                    expires,
                    has_secret,
                });
            }
            "fpr" => {
                if let Some(ref mut key) = current_key {
                    key.fingerprint = fields[9].to_string();
                }
            }
            "uid" => {
                if let Some(ref mut key) = current_key {
                    if key.name.is_empty() {
                        let uid = fields[9];
                        if let Some(email_start) = uid.find('<') {
                            let email_end = uid.find('>').unwrap_or(uid.len());
                            key.email = uid[email_start + 1..email_end].to_string();
                            key.name = uid[..email_start].trim().to_string();
                        } else {
                            key.name = uid.to_string();
                        }
                    }
                }
            }
            _ => {}
        }
    }

    if let Some(key) = current_key {
        keys.push(key);
    }

    keys
}

#[tauri::command]
pub fn list_keys() -> Result<Vec<GpgKey>, String> {
    let output = Command::new("gpg")
        .args(["--list-keys", "--with-colons", "--with-fingerprint"])
        .output()
        .map_err(|e| format!("Failed to run gpg: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(parse_colons_output(&stdout, false))
}

#[tauri::command]
pub fn list_secret_keys() -> Result<Vec<GpgKey>, String> {
    let output = Command::new("gpg")
        .args(["--list-secret-keys", "--with-colons", "--with-fingerprint"])
        .output()
        .map_err(|e| format!("Failed to run gpg: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    Ok(parse_colons_output(&stdout, true))
}

#[tauri::command]
pub fn generate_key(
    name: String,
    email: String,
    key_type: String,
    bits: u32,
    passphrase: String,
) -> Result<String, String> {
    let key_type_str = match key_type.as_str() {
        "rsa" => format!("RSA"),
        "ed25519" => "EdDSA".to_string(),
        _ => return Err("Unsupported key type".to_string()),
    };

    let length_line = if key_type.as_str() == "ed25519" {
        String::new()
    } else {
        format!("Key-Length: {}\n", bits)
    };

    let batch_input = format!(
        "%echo Generating key\nKey-Type: {}\n{}Name-Real: {}\nName-Email: {}\nExpire-Date: 0\nPassphrase: {}\n%commit\n%echo done\n",
        key_type_str, length_line, name, email, passphrase
    );

    let mut child = Command::new("gpg")
        .args(["--batch", "--gen-key"])
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start gpg: {}", e))?;

    if let Some(stdin) = child.stdin.take() {
        let mut stdin = stdin;
        stdin
            .write_all(batch_input.as_bytes())
            .map_err(|e| format!("Failed to write to gpg stdin: {}", e))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for gpg: {}", e))?;

    if output.status.success() {
        Ok("Key generated successfully".to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Key generation failed: {}", stderr))
    }
}

#[tauri::command]
pub fn import_key(key_data: String) -> Result<String, String> {
    let mut child = Command::new("gpg")
        .args(["--import"])
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start gpg: {}", e))?;

    if let Some(stdin) = child.stdin.take() {
        let mut stdin = stdin;
        stdin
            .write_all(key_data.as_bytes())
            .map_err(|e| format!("Failed to write to gpg stdin: {}", e))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for gpg: {}", e))?;

    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    if output.status.success() || stderr.contains("imported") || stderr.contains("unchanged") {
        Ok(stderr)
    } else {
        Err(format!("Import failed: {}", stderr))
    }
}

#[tauri::command]
pub fn export_key(fingerprint: String, secret: bool) -> Result<String, String> {
    let export_arg = if secret {
        "--export-secret-keys"
    } else {
        "--export"
    };

    let output = Command::new("gpg")
        .args(["--armor", export_arg, &fingerprint])
        .output()
        .map_err(|e| format!("Failed to run gpg: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn delete_key(fingerprint: String, secret: bool) -> Result<(), String> {
    if secret {
        let output = Command::new("gpg")
            .args([
                "--batch",
                "--yes",
                "--delete-secret-keys",
                &fingerprint,
            ])
            .output()
            .map_err(|e| format!("Failed to run gpg: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            return Err(format!("Failed to delete secret key: {}", stderr));
        }
    }

    let output = Command::new("gpg")
        .args(["--batch", "--yes", "--delete-keys", &fingerprint])
        .output()
        .map_err(|e| format!("Failed to run gpg: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
