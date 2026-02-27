import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gpgService } from '../services/gpg';
import { KeyGenType } from '../types/gpg';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateKeyForm({ onClose, onSuccess }: Props) {
  const { t } = useTranslation();
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
      setError(t('generateKey.errorPassphraseMismatch'));
      return;
    }

    if (!name.trim() || !email.trim()) {
      setError(t('generateKey.errorRequired'));
      return;
    }

    setLoading(true);
    try {
      await gpgService.generateKey({ name, email, key_type: keyType, bits, passphrase });
      onSuccess();
    } catch (err) {
      setError(t('generateKey.errorGenerate', { err }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="prompt-char">$</span> {t('generateKey.title')}
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">{t('generateKey.labelName')}</label>
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
            <label className="form-label">{t('generateKey.labelEmail')}</label>
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
              <label className="form-label">{t('generateKey.labelKeyType')}</label>
              <select
                className="form-select"
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as KeyGenType)}
              >
                <option value="ed25519">{t('generateKey.optionEd25519')}</option>
                <option value="rsa">{t('generateKey.optionRsa')}</option>
              </select>
            </div>

            {keyType === 'rsa' && (
              <div className="form-group">
                <label className="form-label">{t('generateKey.labelBits')}</label>
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
            <label className="form-label">{t('generateKey.labelPassphrase')}</label>
            <input
              className="form-input"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('generateKey.labelConfirmPassphrase')}</label>
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
              {t('generateKey.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="blink">_</span> {t('generateKey.generating')}</> : t('generateKey.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
