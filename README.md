# GPGmgr

A desktop GPG key manager built with Tauri 2 + React + TypeScript.

## Requirements

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)
- [GPG](https://gnupg.org/) installed and available in `PATH`

## Running

```bash
npm install
npm run tauri dev
```

### Production build

```bash
npm run tauri build
```

## Key Features

### Key Management
- Browse public and private GPG keys from the system keyring
- Generate new keys (RSA 2048/4096, Ed25519)
- Import keys from ASCII armor format
- Export keys (public and private)
- Delete keys

### Encryption
- Encrypt text messages for a selected recipient (by fingerprint)
- Output in ASCII armor format

### Decryption
- Decrypt GPG-encrypted messages with passphrase input
- Decryption history stored locally in SQLite

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Rust (Tauri 2) |
| State | TanStack Query, Zustand |
| Database | SQLite (rusqlite) |
| Cryptography | GPG (system calls) |
