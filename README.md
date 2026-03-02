# GPGmgr — Desktop OpenPGP (GnuPG) Key Manager

**GPGmgr** is a **cross-platform desktop GPG/PGP (OpenPGP) key manager** built with **Tauri 2 + React + TypeScript**.
Manage your local **GnuPG keyring**, **generate/import/export** keys, and **encrypt/decrypt** ASCII-armored messages — all locally.

> Keywords: GPG, GnuPG, PGP, OpenPGP, key manager, keyring, encryption, decryption, ASCII armor, fingerprint, Tauri, Rust, React, desktop app.

## Why GPGmgr?

- **Local-first / offline**: works with your **system GnuPG installation** (no cloud storage)
- **Simple keyring UX**: browse public/private keys, fingerprints, and key details
- **Encrypt/decrypt quickly**: ASCII-armored text that you can paste into email/chat
- **Audit-friendly**: optional **local decryption history** stored in **SQLite**
- **Cross-platform**: Windows / macOS / Linux via **Tauri 2** *(TODO: confirm & list supported OS versions)*

## Key Features

### Key Management (GPG keyring)
- Browse **public and private GPG keys** from the system keyring
- Generate new keys: **RSA 2048/4096**, **Ed25519**
- Import keys from **ASCII armor** (`.asc`)
- Export keys (**public and private**) *(use responsibly)*
- Delete keys from the keyring

### Encryption (OpenPGP)
- Encrypt text messages for a selected recipient (**by fingerprint**)
- Output in **ASCII armor** (portable text format)

### Decryption
- Decrypt **GPG-encrypted** ASCII-armored messages with passphrase input
- **Decryption history** stored locally in **SQLite** (rusqlite)

## Requirements

- **Node.js** v18+
- **Rust toolchain**
- **GnuPG (gpg)** installed and available in `PATH`

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Rust (Tauri 2) |
| State | TanStack Query, Zustand |
| Database | SQLite (rusqlite) |
| Cryptography | GPG (system calls) |


## Usage (GPG / OpenPGP Quick Guide)

GPGmgr works with your **local GnuPG (gpg) keyring**. You can manage **OpenPGP/PGP keys** and **encrypt/decrypt** messages in **ASCII armor** format.

### Keyring: browse, import, export
- Open **Keys** to list **public/private OpenPGP keys** from the system **GPG keyring**
- Use **Search** to find keys by **UID / email / fingerprint** *(if implemented)*
- **Import**: add a key from **ASCII-armored** `.asc` text/file
- **Export**: copy **public key** (and optionally **private key**) in ASCII armor *(handle private keys carefully)*
- **Generate**: create new keys (**RSA 2048/4096**, **Ed25519**) and store them in your local keyring

### Encrypt (OpenPGP encryption)
1. Go to **Encrypt**
2. Select recipient by **fingerprint** (or UID/email if available)
3. Paste your message
4. Copy the output: **ASCII-armored OpenPGP message** (`-----BEGIN PGP MESSAGE-----`)
5. Send it via email/chat — it stays readable as text, but encrypted

### Decrypt (OpenPGP decryption)
1. Go to **Decrypt**
2. Paste an ASCII-armored encrypted message (`BEGIN PGP MESSAGE`)
3. Enter your **GPG passphrase** if prompted by your private key
4. Read and copy the decrypted plaintext
5. *(Optional)* Review **decryption history** stored locally in **SQLite** (for auditing/traceability)

### Troubleshooting
- Ensure `gpg` is installed and available in `PATH`:
  ```bash
  gpg --version

