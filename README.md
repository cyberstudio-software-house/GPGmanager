# GPGmgr

Desktopowy menedżer kluczy GPG zbudowany na Tauri 2 + React + TypeScript.

## Wymagania

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)
- [GPG](https://gnupg.org/) zainstalowany i dostępny w `PATH`

## Uruchomienie

```bash
npm install
npm run tauri dev
```

### Budowanie wersji produkcyjnej

```bash
npm run tauri build
```

## Kluczowe funkcje

### Zarządzanie kluczami
- Przeglądanie publicznych i prywatnych kluczy GPG z keyring systemu
- Generowanie nowych kluczy (RSA 2048/4096, Ed25519)
- Import kluczy z formatu ASCII armor
- Eksport kluczy (publicznych i prywatnych)
- Usuwanie kluczy

### Szyfrowanie
- Szyfrowanie wiadomości tekstowych dla wybranego odbiorcy (po fingerprint)
- Wynik w formacie ASCII armor

### Deszyfrowanie
- Deszyfrowanie wiadomości zaszyfrowanych GPG z podaniem passphrase
- Historia zdeszyfrownaych wiadomości przechowywana lokalnie w SQLite

## Stos technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Rust (Tauri 2) |
| Stan | TanStack Query, Zustand |
| Baza danych | SQLite (rusqlite) |
| Kryptografia | GPG (wywołania systemowe) |
