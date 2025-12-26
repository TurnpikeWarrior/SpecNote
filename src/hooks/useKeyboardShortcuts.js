import { useEffect, useCallback } from 'react'

export function useKeyboardShortcuts({
  onSave,
  onNew,
  onOpen,
  onExportMd,
  onExportTxt,
  onToggleSplit,
  onFocusLeft,
  onFocusRight,
  onToggleScrollSync,
  onToggleTheme,
  onOpenCommandPalette,
  onSearch,
  onSettings,
}) {
  const handleKeyDown = useCallback((e) => {
    const isMod = e.metaKey || e.ctrlKey
    const isShift = e.shiftKey

    // Command Palette: Cmd+K
    if (isMod && e.key === 'k') {
      e.preventDefault()
      onOpenCommandPalette?.()
      return
    }

    // Save: Cmd+S
    if (isMod && !isShift && e.key === 's') {
      e.preventDefault()
      onSave?.()
      return
    }

    // New: Cmd+N
    if (isMod && !isShift && e.key === 'n') {
      e.preventDefault()
      onNew?.()
      return
    }

    // Open: Cmd+O
    if (isMod && !isShift && e.key === 'o') {
      e.preventDefault()
      onOpen?.()
      return
    }

    // Export MD: Cmd+Shift+M
    if (isMod && isShift && e.key === 'm') {
      e.preventDefault()
      onExportMd?.()
      return
    }

    // Export TXT: Cmd+Shift+T
    if (isMod && isShift && e.key === 't') {
      e.preventDefault()
      onExportTxt?.()
      return
    }

    // Toggle Split: Cmd+\
    if (isMod && e.key === '\\') {
      e.preventDefault()
      onToggleSplit?.()
      return
    }

    // Focus Left: Cmd+1
    if (isMod && e.key === '1') {
      e.preventDefault()
      onFocusLeft?.()
      return
    }

    // Focus Right: Cmd+2
    if (isMod && e.key === '2') {
      e.preventDefault()
      onFocusRight?.()
      return
    }

    // Scroll Sync: Cmd+Shift+S
    if (isMod && isShift && e.key === 's') {
      e.preventDefault()
      onToggleScrollSync?.()
      return
    }

    // Toggle Theme: Cmd+Shift+L
    if (isMod && isShift && e.key === 'l') {
      e.preventDefault()
      onToggleTheme?.()
      return
    }

    // Search: Cmd+F
    if (isMod && !isShift && e.key === 'f') {
      e.preventDefault()
      onSearch?.()
      return
    }

    // Settings: Cmd+,
    if (isMod && e.key === ',') {
      e.preventDefault()
      onSettings?.()
      return
    }
  }, [
    onSave,
    onNew,
    onOpen,
    onExportMd,
    onExportTxt,
    onToggleSplit,
    onFocusLeft,
    onFocusRight,
    onToggleScrollSync,
    onToggleTheme,
    onOpenCommandPalette,
    onSearch,
    onSettings,
  ])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

