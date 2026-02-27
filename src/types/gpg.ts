export interface GpgKey {
  fingerprint: string;
  key_id: string;
  name: string;
  email: string;
  key_type: 'public' | 'secret';
  created: string;
  expires?: string;
  has_secret: boolean;
}

export type KeyGenType = 'rsa' | 'ed25519';

export interface GenerateKeyParams {
  name: string;
  email: string;
  key_type: KeyGenType;
  bits: number;
  passphrase: string;
}

export type ActiveView = 'keys' | 'encrypt' | 'decrypt' | 'settings';

export type GpgMode = 'system' | 'wsl' | 'custom';

export interface AppConfig {
  gpg_mode: GpgMode;
  custom_path: string;
}

export interface DetectResult {
  system_available: boolean;
  wsl_available: boolean;
}

export interface HistoryItem {
  id: number;
  ciphertext: string;
  created_at: string;
}
