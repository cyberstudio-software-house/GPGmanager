import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GpgKey } from '../types/gpg';
import { gpgService } from '../services/gpg';

interface Props {
  gpgKey: GpgKey;
  onClose: () => void;
  onRefresh: () => void;
}

export default function KeyDetails({ gpgKey, onClose }: Props) {
  const { t } = useTranslation();
  const [exportedKey, setExportedKey] = useState('');
  const [loadingExport, setLoadingExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (secret: boolean) => {
    setLoadingExport(true);
    try {
      const result = await gpgService.exportKey(gpgKey.fingerprint, secret);
      setExportedKey(result);
    } catch (err) {
      alert(t('keyDetails.exportError', { err }));
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
        <span className="panel-title">{t('keyDetails.title')}</span>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">{t('keyDetails.labelName')}</span>
          <span className="detail-value">{gpgKey.name || '—'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('keyDetails.labelEmail')}</span>
          <span className="detail-value">{gpgKey.email}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('keyDetails.labelKeyId')}</span>
          <span className="detail-value mono">{gpgKey.key_id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('keyDetails.labelFingerprint')}</span>
          <span className="detail-value mono fingerprint">{formatFingerprint(gpgKey.fingerprint)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('keyDetails.labelType')}</span>
          <span className="detail-value">{gpgKey.key_type}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{t('keyDetails.labelHasSecret')}</span>
          <span className={`detail-value ${gpgKey.has_secret ? 'text-green' : 'text-dim'}`}>
            {gpgKey.has_secret ? t('keyDetails.yes') : t('keyDetails.no')}
          </span>
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn btn-ghost" onClick={() => handleExport(false)} disabled={loadingExport}>
          {t('keyDetails.exportPublic')}
        </button>
        {gpgKey.has_secret && (
          <button className="btn btn-ghost btn-warning" onClick={() => handleExport(true)} disabled={loadingExport}>
            {t('keyDetails.exportPrivate')}
          </button>
        )}
      </div>

      {exportedKey && (
        <div className="export-block">
          <div className="export-header">
            <span className="detail-label">{t('keyDetails.exportLabel')}</span>
            <button className="btn-copy" onClick={handleCopy}>
              {copied ? t('keyDetails.copied') : t('keyDetails.copy')}
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
