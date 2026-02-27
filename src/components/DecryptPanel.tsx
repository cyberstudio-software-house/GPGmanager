import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gpgService } from '../services/gpg';
import { HistoryItem } from '../types/gpg';

function getPreview(ciphertext: string): string {
  const lines = ciphertext.trim().split('\n');
  const bodyLine = lines.find(
    (l) => l.trim() && !l.startsWith('-') && !l.startsWith('Version') && !l.startsWith('Hash') && !l.startsWith('Comment')
  );
  const text = bodyLine || ciphertext;
  return text.length > 44 ? text.substring(0, 44) + '…' : text;
}

export default function DecryptPanel() {
  const { t } = useTranslation();
  const [ciphertext, setCiphertext] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = async () => {
    try {
      const items = await gpgService.getHistory();
      setHistory(items);
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult('');

    if (!ciphertext.trim()) {
      setError(t('decrypt.errorEmpty'));
      return;
    }

    setLoading(true);
    try {
      const decrypted = await gpgService.decryptMessage(ciphertext, passphrase);
      setResult(decrypted);
      setPassphrase('');
      await gpgService.addHistoryItem(ciphertext);
      await loadHistory();
    } catch (err) {
      setError(t('decrypt.errorDecrypt', { err }));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setCiphertext(item.ciphertext);
    setResult('');
    setError('');
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await gpgService.deleteHistoryItem(id);
    await loadHistory();
  };

  return (
    <div className="panel-view">
      <div className="view-header">
        <div className="view-title">
          <span className="prompt-char">$</span> {t('decrypt.title')}
        </div>
      </div>

      <div className="decrypt-layout">
        <div className="panel-content">
          <form onSubmit={handleDecrypt} className="panel-form">
            <div className="form-group flex-grow">
              <label className="form-label">{t('decrypt.labelCiphertext')}</label>
              <textarea
                className="form-textarea"
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                placeholder="-----BEGIN PGP MESSAGE-----&#10;...&#10;-----END PGP MESSAGE-----"
                rows={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('decrypt.labelPassphrase')}</label>
              <div className="passphrase-hint">
                {t('decrypt.passphraseHint')}
              </div>
              <input
                className="form-input"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setCiphertext(''); setResult(''); setError(''); setPassphrase(''); }}
              >
                {t('decrypt.clear')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="blink">_</span> {t('decrypt.decrypting')}</> : t('decrypt.submit')}
              </button>
            </div>
          </form>

          {result && (
            <div className="result-block">
              <div className="result-header">
                <span className="result-label">
                  <span className="text-green">✓</span> {t('decrypt.resultLabel')}
                </span>
                <button className="btn-copy" onClick={handleCopy}>
                  {copied ? t('decrypt.copied') : t('decrypt.copy')}
                </button>
              </div>
              <textarea
                className="result-textarea"
                value={result}
                readOnly
                rows={8}
              />
            </div>
          )}
        </div>

        <div className="history-panel">
          <div className="history-header">
            <span className="panel-title">{t('decrypt.historyTitle')}</span>
            <span className="history-count">{history.length}</span>
          </div>
          <div className="history-list">
            {history.length === 0 && (
              <div className="history-empty">{t('decrypt.historyEmpty')}</div>
            )}
            {history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => handleHistoryClick(item)}
              >
                <div className="history-item-date">{item.created_at}</div>
                <div className="history-item-preview">{getPreview(item.ciphertext)}</div>
                <button
                  className="history-item-delete"
                  onClick={(e) => handleDeleteHistory(e, item.id)}
                  title={t('decrypt.historyDelete')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
