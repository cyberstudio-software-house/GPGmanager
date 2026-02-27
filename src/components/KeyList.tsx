import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gpgService } from '../services/gpg';
import { GpgKey } from '../types/gpg';
import GenerateKeyForm from './GenerateKeyForm';
import ImportKeyModal from './ImportKeyModal';
import KeyDetails from './KeyDetails';

export default function KeyList() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedKey, setSelectedKey] = useState<GpgKey | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'secret'>('public');

  const { data: publicKeys = [], isLoading: loadingPublic } = useQuery({
    queryKey: ['keys', 'public'],
    queryFn: gpgService.listKeys,
  });

  const { data: secretKeys = [], isLoading: loadingSecret } = useQuery({
    queryKey: ['keys', 'secret'],
    queryFn: gpgService.listSecretKeys,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ fingerprint, secret }: { fingerprint: string; secret: boolean }) =>
      gpgService.deleteKey(fingerprint, secret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      setSelectedKey(null);
    },
  });

  const keys = activeTab === 'public' ? publicKeys : secretKeys;
  const isLoading = activeTab === 'public' ? loadingPublic : loadingSecret;

  const formatDate = (timestamp: string) => {
    if (!timestamp) return '—';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString(i18n.language === 'pl' ? 'pl-PL' : 'en-US');
  };

  return (
    <div className="key-list-view">
      <div className="view-header">
        <div className="view-title">
          <span className="prompt-char">$</span> {t('keyList.title')}
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setShowImport(true)}>
            <span>↑</span> {t('keyList.importBtn')}
          </button>
          <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>
            <span>+</span> {t('keyList.newKeyBtn')}
          </button>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'public' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          {t('keyList.publicTab')} <span className="tab-count">{publicKeys.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'secret' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('secret')}
        >
          {t('keyList.secretTab')} <span className="tab-count">{secretKeys.length}</span>
        </button>
      </div>

      <div className="key-table-container">
        {isLoading ? (
          <div className="loading-state">
            <span className="blink">_</span> {t('keyList.loading')}
          </div>
        ) : keys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚿</div>
            <p>{t('keyList.noKeys')}</p>
            <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>
              {t('keyList.generateFirst')}
            </button>
          </div>
        ) : (
          <table className="key-table">
            <thead>
              <tr>
                <th>{t('keyList.colIdentity')}</th>
                <th>{t('keyList.colType')}</th>
                <th>{t('keyList.colKeyId')}</th>
                <th>{t('keyList.colCreated')}</th>
                <th>{t('keyList.colExpires')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr
                  key={key.fingerprint}
                  className={`key-row ${selectedKey?.fingerprint === key.fingerprint ? 'key-row-selected' : ''}`}
                  onClick={() => setSelectedKey(selectedKey?.fingerprint === key.fingerprint ? null : key)}
                >
                  <td>
                    <div className="key-identity">
                      <span className="key-name">{key.name || '—'}</span>
                      <span className="key-email">{key.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="key-type-badge">{key.key_type.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className="key-id">{key.key_id.slice(-8)}</span>
                  </td>
                  <td className="key-date">{formatDate(key.created)}</td>
                  <td className="key-date">
                    {key.expires ? (
                      <span className="key-expires">{formatDate(key.expires)}</span>
                    ) : (
                      <span className="key-no-expire">∞</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-icon btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t('keyList.confirmDelete', { keyId: key.key_id }))) {
                          deleteMutation.mutate({ fingerprint: key.fingerprint, secret: key.has_secret });
                        }
                      }}
                      title={t('keyList.deleteTitle')}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedKey && (
        <KeyDetails
          gpgKey={selectedKey}
          onClose={() => setSelectedKey(null)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['keys'] })}
        />
      )}

      {showGenerate && (
        <GenerateKeyForm
          onClose={() => setShowGenerate(false)}
          onSuccess={() => {
            setShowGenerate(false);
            queryClient.invalidateQueries({ queryKey: ['keys'] });
          }}
        />
      )}

      {showImport && (
        <ImportKeyModal
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            queryClient.invalidateQueries({ queryKey: ['keys'] });
          }}
        />
      )}
    </div>
  );
}
