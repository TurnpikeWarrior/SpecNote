import { useState, useCallback, useEffect } from 'react'

const SETTINGS_KEY = 'specnote_settings'

const defaultSettings = {
  autosaveEnabled: true,
  autosaveInterval: 30, // seconds
  showLineNumbers: false,
  defaultFontSize: '15px',
  lineSpacing: 1.4, // 1.0 = single, 1.5 = 1.5x, 2.0 = double
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  return { settings, updateSettings }
}

