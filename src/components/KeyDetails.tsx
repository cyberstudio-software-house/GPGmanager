import { useState } from 'react';
import { GpgKey } from '../types/gpg';
import { gpgService } from '../services/gpg';

interface Props {
  gpgKey: GpgKey;
  onClose: () => void;
  onRefresh: () => void;
}

export default function KeyDetails({ gpgKey, onClose }: Props) {
  const [exportedKey, setExportedKey] = useState('');
  const [loadingExport, setLoadingExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (secret: boolean) => {
    setLoadingExport(true);
    try {
      const result = await gpgService.exportKey(gpgKey.fingerprint, secret);
      setExportedKey(result);
    } catch (err) {
      alert(`Błąd eksportu: ${err}`);
    } finally {
      setLoadingExport(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFingerprint = (fp: string) => {
    return fp.match(/.{1,4}/g)?.join(' ') ?? fp;
  };

  return (
    <div className="key-details-panel">
      <div className="panel-header">
        <span className="panel-title">szczegóły klucza</span>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">nazwa</span>
          <span className="detail-value">{gpgKey.name || '—'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">email</span>
          <span className="detail-value">{gpgKey.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">id klucza</span>
          <span className="detail-value mono">{gpgKey.key_id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">fingerprint</span>
          <span className="detail-value mono fingerprint">{formatFingerprint(gpgKey.fingerprint)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">typ</span>
          <span className="detail-value">{gpgKey.key_type}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">ma klucz prywatny</span>
          <span className={`detail-value ${gpgKey.has_secret ? 'text-green' : 'text-dim'}`}>
            {gpgKey.has_secret ? '✓ tak' : '✗ nie'}
          </span>
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn btn-ghost" onClick={() => handleExport(false)} disabled={loadingExport}>
          eksportuj publiczny
        </button>
        {gpgKey.has_secret && (
          <button className="btn btn-ghost btn-warning" onClick={() => handleExport(true)} disabled={loadingExport}>
            eksportuj prywatny
          </button>
        )}
      </div>

      {exportedKey && (
        <div className="export-block">
          <div className="export-header">
            <span className="detail-label">klucz (PEM/ASCII Armor)</span>
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? '✓ skopiowano' : 'kopiuj'}
            </button>
          </div>
          <textarea
            className="export-textarea"
            value={exportedKey}
            readOnly
            rows={8}
          />
        </div>
      )}
    </div>
  );
}
