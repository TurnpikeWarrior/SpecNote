import React, { useState, useEffect, useRef, useCallback } from 'react'

function SearchPanel({ editor, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState({ count: 0, current: 0 })
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (searchTerm && editor?.current) {
      const result = editor.current.findText(searchTerm)
      setResults(result)
    } else {
      setResults({ count: 0, current: 0 })
    }
  }, [searchTerm, editor])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter') {
      // Navigate to next result
      // This would require more sophisticated search highlighting
    }
  }, [onClose])

  return (
    <div className="search-panel">
      <div className="search-panel-header">
        <input
          ref={inputRef}
          type="text"
          className="search-panel-input"
          placeholder="Find in document..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="search-nav">
          <button className="icon-btn" title="Previous (⇧↩)">
            <ChevronUpIcon />
          </button>
          <button className="icon-btn" title="Next (↩)">
            <ChevronDownIcon />
          </button>
        </div>
        <button className="icon-btn" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="search-results">
        {searchTerm ? (
          results.count > 0 ? (
            `${results.current} of ${results.count} results`
          ) : (
            'No results found'
          )
        ) : (
          'Type to search'
        )}
      </div>
    </div>
  )
}

const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default SearchPanel

