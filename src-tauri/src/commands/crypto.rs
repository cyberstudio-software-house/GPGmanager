use std::io::Write;
use std::process::{Command, Stdio};
use zeroize::Zeroize;

#[tauri::command]
pub fn encrypt_message(plaintext: String, recipient_fingerprint: String) -> Result<String, String> {
    let mut child = Command::new("gpg")
        .args([
            "--armor",
            "--encrypt",
            "--recipient",
            &recipient_fingerprint,
            "--trust-model",
            "always",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start gpg: {}", e))?;

    if let Some(stdin) = child.stdin.take() {
        let mut stdin = stdin;
        stdin
            .write_all(plaintext.as_bytes())
            .map_err(|e| format!("Failed to write to gpg stdin: {}", e))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for gpg: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn decrypt_message(ciphertext: String, mut passphrase: String) -> Result<String, String> {
    let input = format!("{}\n{}", passphrase, ciphertext);
    passphrase.zeroize();

    let mut child = Command::new("gpg")
        .args([
            "--decrypt",
            "--pinentry-mode",
            "loopback",
            "--passphrase-fd",
            "0",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start gpg: {}", e))?;

    if let Some(stdin) = child.stdin.take() {
        let mut stdin = stdin;
        stdin
            .write_all(input.as_bytes())
            .map_err(|e| format!("Failed to write to gpg stdin: {}", e))?;
    }

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Failed to wait for gpg: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
