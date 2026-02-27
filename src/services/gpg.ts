import { invoke } from '@tauri-apps/api/core';
import { GpgKey, GenerateKeyParams, HistoryItem } from '../types/gpg';

export const gpgService = {
  listKeys: () => invoke<GpgKey[]>('list_keys'),
  listSecretKeys: () => invoke<GpgKey[]>('list_secret_keys'),

  generateKey: (params: GenerateKeyParams) =>
    invoke<string>('generate_key', {
      name: params.name,
      email: params.email,
      keyType: params.key_type,
      bits: params.bits,
      passphrase: params.passphrase,
    }),

  importKey: (keyData: string) => invoke<string>('import_key', { keyData }),

  exportKey: (fingerprint: string, secret: boolean) =>
    invoke<string>('export_key', { fingerprint, secret }),

  deleteKey: (fingerprint: string, secret: boolean) =>
    invoke<void>('delete_key', { fingerprint, secret }),

  encryptMessage: (plaintext: string, recipientFingerprint: string) =>
    invoke<string>('encrypt_message', { plaintext, recipientFingerprint }),

  decryptMessage: (ciphertext: string, passphrase: string) =>
    invoke<string>('decrypt_message', { ciphertext, passphrase }),

  addHistoryItem: (ciphertext: string) =>
    invoke<number>('add_history_item', { ciphertext }),

  getHistory: () => invoke<HistoryItem[]>('get_history'),

  deleteHistoryItem: (id: number) =>
    invoke<void>('delete_history_item', { id }),
};
