import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gpgService } from '../services/gpg';
import { GpgKey } from '../types/gpg';
import GenerateKeyForm from './GenerateKeyForm';
import ImportKeyModal from './ImportKeyModal';
import KeyDetails from './KeyDetails';

export default function KeyList() {
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
    return date.toLocaleDateString('pl-PL');
  };

  return (
    <div className="key-list-view">
      <div className="view-header">
        <div className="view-title">
          <span className="prompt-char">$</span> klucze gpg
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setShowImport(true)}>
            <span>↑</span> importuj
          </button>
          <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>
            <span>+</span> nowy klucz
          </button>
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab ${activeTab === 'public' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          klucze publiczne <span className="tab-count">{publicKeys.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'secret' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('secret')}
        >
          klucze prywatne <span className="tab-count">{secretKeys.length}</span>
        </button>
      </div>

      <div className="key-table-container">
        {isLoading ? (
          <div className="loading-state">
            <span className="blink">_</span> ładowanie kluczy...
          </div>
        ) : keys.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚿</div>
            <p>brak kluczy w keyring</p>
            <button className="btn btn-primary" onClick={() => setShowGenerate(true)}>
              wygeneruj pierwszy klucz
            </button>
          </div>
        ) : (
          <table className="key-table">
            <thead>
              <tr>
                <th>tożsamość</th>
                <th>typ</th>
                <th>id klucza</th>
                <th>utworzony</th>
                <th>wygaśnięcie</th>
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
                        if (confirm(`Usunąć klucz ${key.key_id}?`)) {
                          deleteMutation.mutate({ fingerprint: key.fingerprint, secret: key.has_secret });
                        }
                      }}
                      title="Usuń klucz"
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
