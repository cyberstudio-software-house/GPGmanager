import { useState } from 'react';
import { gpgService } from '../services/gpg';
import { KeyGenType } from '../types/gpg';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateKeyForm({ onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [keyType, setKeyType] = useState<KeyGenType>('ed25519');
  const [bits, setBits] = useState(4096);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passphrase !== confirmPassphrase) {
      setError('Hasła nie są identyczne');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError('Nazwa i email są wymagane');
      return;
    }

    setLoading(true);
    try {
      await gpgService.generateKey({ name, email, key_type: keyType, bits, passphrase });
      onSuccess();
    } catch (err) {
      setError(`Błąd generowania: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="prompt-char">$</span> generuj nowy klucz
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">nazwa / identyfikator</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan@example.com"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">typ klucza</label>
              <select
                className="form-select"
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as KeyGenType)}
              >
                <option value="ed25519">Ed25519 (zalecany)</option>
                <option value="rsa">RSA</option>
              </select>
            </div>

            {keyType === 'rsa' && (
              <div className="form-group">
                <label className="form-label">długość klucza (bity)</label>
                <select
                  className="form-select"
                  value={bits}
                  onChange={(e) => setBits(parseInt(e.target.value))}
                >
                  <option value={2048}>2048</option>
                  <option value={3072}>3072</option>
                  <option value={4096}>4096</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">hasło (passphrase)</label>
            <input
              className="form-input"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">potwierdź hasło</label>
            <input
              className="form-input"
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              anuluj
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="blink">_</span> generowanie...</> : 'generuj klucz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
