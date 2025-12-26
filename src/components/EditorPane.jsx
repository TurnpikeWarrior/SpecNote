import React, { forwardRef, useRef } from 'react'
import Editor from './Editor'
import SearchPanel from './SearchPanel'

const EditorPane = forwardRef(({
  paneId,
  isActive,
  onFocus,
  doc,
  onUpdate,
  saveState,
  style,
  scrollRef,
  onScroll,
  searchOpen,
  setSearchOpen,
}, ref) => {
  const contentRef = useRef(null)

  // Use contentRef as scrollRef if not provided
  const actualScrollRef = scrollRef || contentRef

  return (
    <div 
      className={`editor-pane ${isActive ? 'active' : ''}`}
      style={style}
      onClick={onFocus}
    >
      <div className="pane-header">
        <span className="doc-name">
          {doc?.name || 'Untitled'}
          {saveState === 'unsaved' && ' •'}
        </span>
        <div className="pane-actions">
          <span className={`save-status ${saveState}`}>
            <span className="save-dot" />
          </span>
        </div>
      </div>
      
      <div className="editor-content" ref={contentRef}>
        <Editor
          ref={ref}
          content={doc?.content}
          onUpdate={(content) => onUpdate({ ...doc, content })}
          onFocus={onFocus}
          placeholder="Start writing your document..."
          scrollRef={actualScrollRef}
          onScroll={onScroll}
        />
        
        {searchOpen && (
          <SearchPanel
            editor={ref}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </div>
    </div>
  )
})

EditorPane.displayName = 'EditorPane'

export default EditorPane

