import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gpgService } from '../services/gpg';
import { GpgMode, DetectResult, AppConfig } from '../types/gpg';

export default function SettingsPanel() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AppConfig>({ gpg_mode: 'system', custom_path: '' });
  const [detect, setDetect] = useState<DetectResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    gpgService.getConfig().then(setConfig).catch(() => {});
    runDetect();
  }, []);

  const runDetect = async () => {
    setDetecting(true);
    try {
      const result = await gpgService.detectGpg();
      setDetect(result);
    } finally {
      setDetecting(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await gpgService.saveConfig(config.gpg_mode, config.custom_path);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(t('settings.errorSave', { err }));
    } finally {
      setSaving(false);
    }
  };

  const setMode = (mode: GpgMode) => setConfig((c) => ({ ...c, gpg_mode: mode }));

  return (
    <div className="panel-view">
      <div className="view-header">
        <div className="view-title">
          <span className="prompt-char">$</span> {t('settings.title')}
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="settings-section-title">{t('settings.gpgSource')}</div>

          <div className="settings-detect-bar">
            <span className="settings-detect-label">{t('settings.autoDetect')}</span>
            <button className="btn btn-ghost btn-sm" onClick={runDetect} disabled={detecting}>
              {detecting ? <><span className="blink">_</span> {t('settings.detecting')}</> : t('settings.detectBtn')}
            </button>
          </div>

          {detect && (
            <div className="detect-results">
              <div className={`detect-item ${detect.system_available ? 'detect-ok' : 'detect-fail'}`}>
                <span className="detect-dot">{detect.system_available ? '●' : '○'}</span>
                <span>GPG ({t('settings.system')})</span>
                <span className="detect-status">
                  {detect.system_available ? t('settings.available') : t('settings.notFound')}
                </span>
              </div>
              <div className={`detect-item ${detect.wsl_available ? 'detect-ok' : 'detect-fail'}`}>
                <span className="detect-dot">{detect.wsl_available ? '●' : '○'}</span>
                <span>GPG (WSL)</span>
                <span className="detect-status">
                  {detect.wsl_available ? t('settings.available') : t('settings.notFound')}
                </span>
              </div>
            </div>
          )}

          <div className="settings-modes">
            <label className={`mode-option ${config.gpg_mode === 'system' ? 'mode-option-active' : ''} ${detect && !detect.system_available ? 'mode-option-disabled' : ''}`}>
              <input
                type="radio"
                name="gpg_mode"
                value="system"
                checked={config.gpg_mode === 'system'}
                onChange={() => setMode('system')}
              />
              <div className="mode-info">
                <span className="mode-name">{t('settings.modeSystem')}</span>
                <span className="mode-desc">{t('settings.modeSystemDesc')}</span>
              </div>
            </label>

            <label className={`mode-option ${config.gpg_mode === 'wsl' ? 'mode-option-active' : ''} ${detect && !detect.wsl_available ? 'mode-option-disabled' : ''}`}>
              <input
                type="radio"
                name="gpg_mode"
                value="wsl"
                checked={config.gpg_mode === 'wsl'}
                onChange={() => setMode('wsl')}
              />
              <div className="mode-info">
                <span className="mode-name">{t('settings.modeWsl')}</span>
                <span className="mode-desc">{t('settings.modeWslDesc')}</span>
              </div>
            </label>

            <label className={`mode-option ${config.gpg_mode === 'custom' ? 'mode-option-active' : ''}`}>
              <input
                type="radio"
                name="gpg_mode"
                value="custom"
                checked={config.gpg_mode === 'custom'}
                onChange={() => setMode('custom')}
              />
              <div className="mode-info">
                <span className="mode-name">{t('settings.modeCustom')}</span>
                <span className="mode-desc">{t('settings.modeCustomDesc')}</span>
              </div>
            </label>
          </div>

          {config.gpg_mode === 'custom' && (
            <div className="form-group settings-custom-path">
              <label className="form-label">{t('settings.customPath')}</label>
              <input
                className="form-input"
                type="text"
                value={config.custom_path}
                onChange={(e) => setConfig((c) => ({ ...c, custom_path: e.target.value }))}
                placeholder={t('settings.customPathPlaceholder')}
              />
            </div>
          )}
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? <><span className="text-green">✓</span> {t('settings.saved')}</> : saving ? <><span className="blink">_</span> {t('settings.saving')}</> : t('settings.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
