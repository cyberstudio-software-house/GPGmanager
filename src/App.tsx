import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveView } from './types/gpg';
import KeyList from './components/KeyList';
import EncryptPanel from './components/EncryptPanel';
import DecryptPanel from './components/DecryptPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000,
    },
  },
});

function AppContent() {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveView>('keys');

  const navItems: { id: ActiveView; label: string; icon: string }[] = [
    { id: 'keys', label: t('nav.keys'), icon: '⚿' },
    { id: 'encrypt', label: t('nav.encrypt'), icon: '🔒' },
    { id: 'decrypt', label: t('nav.decrypt'), icon: '🔓' },
  ];

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'pl' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚿</span>
          <span className="logo-text">GPG<span className="logo-accent">mgr</span></span>
        </div>

        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'nav-item-active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeView === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="lang-toggle" onClick={toggleLang}>
            {i18n.language === 'en' ? 'EN' : 'PL'}
          </button>
          <span className="version-tag">v0.1.0</span>
        </div>
      </nav>

      <main className="main-content">
        {activeView === 'keys' && <KeyList />}
        {activeView === 'encrypt' && <EncryptPanel />}
        {activeView === 'decrypt' && <DecryptPanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
