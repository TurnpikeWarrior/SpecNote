import React, { useState, useEffect, useCallback, useRef } from 'react'
import Toolbar from './components/Toolbar'
import SplitContainer from './components/SplitContainer'
import CommandPalette from './components/CommandPalette'
import SettingsModal from './components/SettingsModal'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDocumentManager } from './hooks/useDocumentManager'
import { useSettings } from './hooks/useSettings'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [splitMode, setSplitMode] = useState('single') // 'single' | 'same-doc' | 'dual-doc'
  const [activePane, setActivePane] = useState('left')
  const [scrollSync, setScrollSync] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  const leftEditorRef = useRef(null)
  const rightEditorRef = useRef(null)
  
  const { settings, updateSettings } = useSettings()
  
  const {
    leftDoc,
    rightDoc,
    updateLeftDoc,
    updateRightDoc,
    saveLeftDoc,
    saveRightDoc,
    newDocument,
    openDocument,
    exportDocument,
    leftSaveState,
    rightSaveState,
  } = useDocumentManager(settings, splitMode)

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Apply line spacing
  useEffect(() => {
    document.documentElement.style.setProperty('--editor-line-height', settings.lineSpacing)
  }, [settings.lineSpacing])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const toggleSplitView = useCallback(() => {
    setSplitMode(prev => {
      if (prev === 'single') return 'same-doc'
      if (prev === 'same-doc') return 'dual-doc'
      return 'single'
    })
  }, [])

  const toggleScrollSync = useCallback(() => {
    setScrollSync(prev => !prev)
  }, [])

  const focusLeftPane = useCallback(() => {
    setActivePane('left')
    leftEditorRef.current?.focus()
  }, [])

  const focusRightPane = useCallback(() => {
    if (splitMode !== 'single') {
      setActivePane('right')
      rightEditorRef.current?.focus()
    }
  }, [splitMode])

  const getActiveEditor = useCallback(() => {
    return activePane === 'left' ? leftEditorRef.current : rightEditorRef.current
  }, [activePane])

  const handleSave = useCallback(() => {
    if (activePane === 'left') {
      saveLeftDoc()
    } else {
      saveRightDoc()
    }
  }, [activePane, saveLeftDoc, saveRightDoc])

  const handleExportMd = useCallback(() => {
    const doc = activePane === 'left' ? leftDoc : rightDoc
    exportDocument(doc, 'md')
  }, [activePane, leftDoc, rightDoc, exportDocument])

  const handleExportTxt = useCallback(() => {
    const doc = activePane === 'left' ? leftDoc : rightDoc
    exportDocument(doc, 'txt')
  }, [activePane, leftDoc, rightDoc, exportDocument])

  const handleNewDocument = useCallback(() => {
    newDocument(activePane)
  }, [activePane, newDocument])

  const handleOpenDocument = useCallback(() => {
    openDocument(activePane)
  }, [activePane, openDocument])

  const commands = [
    { id: 'new', label: 'New Document', shortcut: ['⌘', 'N'], action: handleNewDocument, icon: 'file-plus' },
    { id: 'open', label: 'Open Document', shortcut: ['⌘', 'O'], action: handleOpenDocument, icon: 'folder-open' },
    { id: 'save', label: 'Save', shortcut: ['⌘', 'S'], action: handleSave, icon: 'save' },
    { id: 'export-md', label: 'Export as Markdown', shortcut: ['⌘', '⇧', 'M'], action: handleExportMd, icon: 'file-text' },
    { id: 'export-txt', label: 'Export as Plain Text', shortcut: ['⌘', '⇧', 'T'], action: handleExportTxt, icon: 'file' },
    { id: 'divider-1', divider: true },
    { id: 'split', label: 'Toggle Split View', shortcut: ['⌘', '\\'], action: toggleSplitView, icon: 'columns' },
    { id: 'focus-left', label: 'Focus Left Pane', shortcut: ['⌘', '1'], action: focusLeftPane, icon: 'arrow-left' },
    { id: 'focus-right', label: 'Focus Right Pane', shortcut: ['⌘', '2'], action: focusRightPane, icon: 'arrow-right' },
    { id: 'scroll-sync', label: 'Toggle Scroll Sync', shortcut: ['⌘', '⇧', 'S'], action: toggleScrollSync, icon: 'link' },
    { id: 'divider-2', divider: true },
    { id: 'search', label: 'Search', shortcut: ['⌘', 'F'], action: () => setSearchOpen(true), icon: 'search' },
    { id: 'theme', label: 'Toggle Theme', shortcut: ['⌘', '⇧', 'L'], action: toggleTheme, icon: 'sun' },
    { id: 'settings', label: 'Settings', shortcut: ['⌘', ','], action: () => setSettingsOpen(true), icon: 'settings' },
  ]

  useKeyboardShortcuts({
    onSave: handleSave,
    onNew: handleNewDocument,
    onOpen: handleOpenDocument,
    onExportMd: handleExportMd,
    onExportTxt: handleExportTxt,
    onToggleSplit: toggleSplitView,
    onFocusLeft: focusLeftPane,
    onFocusRight: focusRightPane,
    onToggleScrollSync: toggleScrollSync,
    onToggleTheme: toggleTheme,
    onOpenCommandPalette: () => setCommandPaletteOpen(true),
    onSearch: () => setSearchOpen(prev => !prev),
    onSettings: () => setSettingsOpen(true),
  })

  // Listen for Electron menu events
  useEffect(() => {
    if (!window.electronAPI) return

    const api = window.electronAPI
    api.onMenuNew?.(() => handleNewDocument())
    api.onMenuOpen?.(() => handleOpenDocument())
    api.onMenuSave?.(() => handleSave())
    api.onMenuExportMd?.(() => handleExportMd())
    api.onMenuExportTxt?.(() => handleExportTxt())
    api.onMenuToggleSplit?.(() => toggleSplitView())
    api.onSetLineSpacing?.((value) => updateSettings({ lineSpacing: value }))
    
    // Format commands - apply to active editor
    const getActiveEditor = () => {
      if (activePane === 'left') return leftEditorRef.current?.editor
      return rightEditorRef.current?.editor
    }
    
    api.onFormatBold?.(() => getActiveEditor()?.chain().focus().toggleBold().run())
    api.onFormatItalic?.(() => getActiveEditor()?.chain().focus().toggleItalic().run())
    api.onFormatUnderline?.(() => getActiveEditor()?.chain().focus().toggleUnderline().run())
    api.onFormatHeading?.((level) => getActiveEditor()?.chain().focus().toggleHeading({ level }).run())
    api.onFormatParagraph?.(() => getActiveEditor()?.chain().focus().setParagraph().run())
    api.onFormatBulletList?.(() => getActiveEditor()?.chain().focus().toggleBulletList().run())
    api.onFormatNumberedList?.(() => getActiveEditor()?.chain().focus().toggleOrderedList().run())
  }, [activePane, handleNewDocument, handleOpenDocument, handleSave, handleExportMd, handleExportTxt, toggleSplitView, updateSettings])

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">SpecNote</span>
        <div className="header-actions">
          <span 
            className={`save-status ${activePane === 'left' ? leftSaveState : rightSaveState}`}
          >
            <span className="save-dot" />
            {activePane === 'left' ? leftSaveState : rightSaveState}
          </span>
          <button 
            className="icon-btn" 
            onClick={() => setCommandPaletteOpen(true)}
            title="Command Palette (⌘K)"
          >
            <CommandIcon />
          </button>
          <button 
            className="icon-btn" 
            onClick={toggleTheme}
            title="Toggle Theme (⌘⇧L)"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      <Toolbar 
        editor={getActiveEditor()} 
        splitMode={splitMode}
        scrollSync={scrollSync}
        onToggleSplit={toggleSplitView}
        onToggleScrollSync={toggleScrollSync}
      />

      <main className="main-content">
        <SplitContainer
        splitMode={splitMode}
        activePane={activePane}
        setActivePane={setActivePane}
        leftEditorRef={leftEditorRef}
        rightEditorRef={rightEditorRef}
        leftDoc={leftDoc}
        rightDoc={rightDoc}
        updateLeftDoc={updateLeftDoc}
        updateRightDoc={updateRightDoc}
        leftSaveState={leftSaveState}
        rightSaveState={rightSaveState}
        scrollSync={scrollSync}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
      />
      </main>

      {commandPaletteOpen && (
        <CommandPalette 
          commands={commands}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsModal 
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <div className="keyboard-hint">
        <kbd>⌘</kbd><kbd>K</kbd> Command Palette
      </div>
    </div>
  )
}

// Icons
const CommandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
  </svg>
)

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default App

