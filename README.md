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
