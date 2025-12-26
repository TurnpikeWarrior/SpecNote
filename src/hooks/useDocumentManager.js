import { useState, useEffect, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { exportToMarkdown, exportToPlainText } from '../utils/export'

const STORAGE_KEY = 'specnote_session'

function createNewDocument(name = 'Untitled') {
  return {
    id: uuidv4(),
    name,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        }
      ]
    },
    filePath: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function useDocumentManager(settings, splitMode) {
  const [leftDoc, setLeftDoc] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const session = JSON.parse(saved)
        return session.leftDoc || createNewDocument()
      } catch {
        return createNewDocument()
      }
    }
    return createNewDocument()
  })

  const [rightDoc, setRightDoc] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const session = JSON.parse(saved)
        return session.rightDoc || createNewDocument('Untitled 2')
      } catch {
        return createNewDocument('Untitled 2')
      }
    }
    return createNewDocument('Untitled 2')
  })

  const [leftSaveState, setLeftSaveState] = useState('saved')
  const [rightSaveState, setRightSaveState] = useState('saved')
  
  const autosaveTimerRef = useRef(null)
  const leftDocRef = useRef(leftDoc)
  const rightDocRef = useRef(rightDoc)

  // Keep refs in sync
  useEffect(() => {
    leftDocRef.current = leftDoc
  }, [leftDoc])

  useEffect(() => {
    rightDocRef.current = rightDoc
  }, [rightDoc])

  // Session persistence
  useEffect(() => {
    const session = {
      leftDoc,
      rightDoc,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [leftDoc, rightDoc])

  // Autosave
  useEffect(() => {
    if (settings.autosaveEnabled) {
      autosaveTimerRef.current = setInterval(() => {
        if (leftSaveState === 'unsaved') {
          saveDocument('left')
        }
        if (splitMode === 'dual-doc' && rightSaveState === 'unsaved') {
          saveDocument('right')
        }
      }, settings.autosaveInterval * 1000)
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearInterval(autosaveTimerRef.current)
      }
    }
  }, [settings.autosaveEnabled, settings.autosaveInterval, leftSaveState, rightSaveState, splitMode])

  const updateLeftDoc = useCallback((updates) => {
    setLeftDoc(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }))
    setLeftSaveState('unsaved')
  }, [])

  const updateRightDoc = useCallback((updates) => {
    setRightDoc(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }))
    setRightSaveState('unsaved')
  }, [])

  const saveDocument = useCallback(async (pane = 'left') => {
    const doc = pane === 'left' ? leftDocRef.current : rightDocRef.current
    const setSaveState = pane === 'left' ? setLeftSaveState : setRightSaveState

    setSaveState('saving')

    try {
      // Use Electron's file save dialog if available
      if (window.electronAPI?.saveFile) {
        const content = JSON.stringify(doc, null, 2)
        const result = await window.electronAPI.saveFile({
          content,
          filePath: doc.filePath,
          defaultName: `${doc.name}.specnote`,
        })

        if (result.success) {
          const setDoc = pane === 'left' ? setLeftDoc : setRightDoc
          setDoc(prev => ({
            ...prev,
            filePath: result.filePath,
            name: result.fileName || prev.name,
          }))
        }
      }

      setSaveState('saved')
    } catch (error) {
      console.error('Save failed:', error)
      setSaveState('unsaved')
    }
  }, [])

  const saveLeftDoc = useCallback(() => saveDocument('left'), [saveDocument])
  const saveRightDoc = useCallback(() => saveDocument('right'), [saveDocument])

  const newDocument = useCallback((pane = 'left') => {
    const doc = createNewDocument(pane === 'left' ? 'Untitled' : 'Untitled 2')
    if (pane === 'left') {
      setLeftDoc(doc)
      setLeftSaveState('unsaved')
    } else {
      setRightDoc(doc)
      setRightSaveState('unsaved')
    }
  }, [])

  const openDocument = useCallback(async (pane = 'left') => {
    try {
      if (window.electronAPI?.openFile) {
        const result = await window.electronAPI.openFile()
        if (result.success && result.content) {
          const doc = JSON.parse(result.content)
          doc.filePath = result.filePath
          doc.name = result.fileName || doc.name

          if (pane === 'left') {
            setLeftDoc(doc)
            setLeftSaveState('saved')
          } else {
            setRightDoc(doc)
            setRightSaveState('saved')
          }
        }
      }
    } catch (error) {
      console.error('Open failed:', error)
    }
  }, [])

  const exportDocument = useCallback(async (doc, format) => {
    try {
      let content
      let extension

      if (format === 'md') {
        content = exportToMarkdown(doc.content)
        extension = 'md'
      } else {
        content = exportToPlainText(doc.content)
        extension = 'txt'
      }

      if (window.electronAPI?.exportFile) {
        await window.electronAPI.exportFile({
          content,
          defaultName: `${doc.name}.${extension}`,
          extension,
        })
      } else {
        // Fallback: download via blob
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.name}.${extension}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [])

  return {
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
  }
}

