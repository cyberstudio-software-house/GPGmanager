import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gpgService } from '../services/gpg';
import { GpgKey } from '../types/gpg';

export default function EncryptPanel() {
  const [plaintext, setPlaintext] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: publicKeys = [] } = useQuery({
    queryKey: ['keys', 'public'],
    queryFn: gpgService.listKeys,
  });

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult('');

    if (!plaintext.trim()) {
      setError('Wpisz wiadomość do zaszyfrowania');
      return;
    }
    if (!selectedKey) {
      setError('Wybierz klucz odbiorcy');
      return;
    }

    setLoading(true);
    try {
      const encrypted = await gpgService.encryptMessage(plaintext, selectedKey);
      setResult(encrypted);
    } catch (err) {
      setError(`Błąd szyfrowania: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getKeyLabel = (key: GpgKey) => {
    const name = key.name || key.email;
    const id = key.key_id.slice(-8);
    return `${name} <${key.email}> [${id}]`;
  };

  return (
    <div className="panel-view">
      <div className="view-header">
        <div className="view-title">
          <span className="prompt-char">$</span> szyfrowanie
        </div>
      </div>

      <div className="panel-content">
        <form onSubmit={handleEncrypt} className="panel-form">
          <div className="form-group">
            <label className="form-label">odbiorca (klucz publiczny)</label>
            <select
              className="form-select"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
            >
              <option value="">-- wybierz klucz --</option>
              {publicKeys.map((key) => (
                <option key={key.fingerprint} value={key.fingerprint}>
                  {getKeyLabel(key)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-grow">
            <label className="form-label">wiadomość (plaintext)</label>
            <textarea
              className="form-textarea flex-grow"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Wpisz wiadomość do zaszyfrowania..."
              rows={8}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setPlaintext(''); setResult(''); setError(''); }}
            >
              wyczyść
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="blink">_</span> szyfrowanie...</> : '🔒 zaszyfruj'}
            </button>
          </div>
        </form>

        {result && (
          <div className="result-block">
            <div className="result-header">
              <span className="result-label">
                <span className="text-green">✓</span> zaszyfrowana wiadomość
              </span>
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? '✓ skopiowano' : 'kopiuj'}
              </button>
            </div>
            <textarea
              className="result-textarea"
              value={result}
              readOnly
              rows={10}
            />
          </div>
        )}
      </div>
    </div>
  );
}
