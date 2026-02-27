import { useState } from 'react';
import { gpgService } from '../services/gpg';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportKeyModal({ onClose, onSuccess }: Props) {
  const [keyData, setKeyData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!keyData.trim()) {
      setError('Wklej dane klucza PGP');
      return;
    }

    setLoading(true);
    try {
      await gpgService.importKey(keyData);
      onSuccess();
    } catch (err) {
      setError(`Błąd importu: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="prompt-char">$</span> importuj klucz
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">klucz PGP (ASCII Armor)</label>
            <textarea
              className="form-textarea"
              value={keyData}
              onChange={(e) => setKeyData(e.target.value)}
              placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----&#10;...&#10;-----END PGP PUBLIC KEY BLOCK-----"
              rows={12}
              autoFocus
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              anuluj
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !keyData.trim()}>
              {loading ? <><span className="blink">_</span> importowanie...</> : 'importuj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
