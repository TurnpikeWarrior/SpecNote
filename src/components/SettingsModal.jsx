import React, { useState } from 'react'

function SettingsModal({ settings, onUpdate, onClose }) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onUpdate(localSettings)
    onClose()
  }

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <span className="settings-title">Settings</span>
          <button className="icon-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="settings-content">
          <div className="settings-group">
            <label className="settings-label">Autosave</label>
            <div className="settings-row">
              <span>Enable autosave</span>
              <button
                className={`toggle ${localSettings.autosaveEnabled ? 'active' : ''}`}
                onClick={() => handleChange('autosaveEnabled', !localSettings.autosaveEnabled)}
              />
            </div>
          </div>

          {localSettings.autosaveEnabled && (
            <div className="settings-group">
              <label className="settings-label">Autosave Interval (seconds)</label>
              <input
                type="number"
                className="settings-input"
                min="5"
                max="300"
                value={localSettings.autosaveInterval}
                onChange={e => handleChange('autosaveInterval', parseInt(e.target.value) || 30)}
              />
            </div>
          )}

          <div className="settings-group">
            <label className="settings-label">Editor</label>
            <div className="settings-row">
              <span>Show line numbers</span>
              <button
                className={`toggle ${localSettings.showLineNumbers ? 'active' : ''}`}
                onClick={() => handleChange('showLineNumbers', !localSettings.showLineNumbers)}
              />
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">Default Font Size</label>
            <select
              className="settings-input"
              value={localSettings.defaultFontSize}
              onChange={e => handleChange('defaultFontSize', e.target.value)}
              style={{ width: '100px' }}
            >
              <option value="14px">14px</option>
              <option value="15px">15px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
            </select>
          </div>

          <div className="settings-group" style={{ marginTop: '24px' }}>
            <button 
              className="toolbar-btn" 
              onClick={handleSave}
              style={{ 
                width: '100%', 
                justifyContent: 'center',
                background: 'var(--accent-primary)',
                color: 'white',
                padding: '10px',
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default SettingsModal

