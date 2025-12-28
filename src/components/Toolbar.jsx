import React from 'react'

const FONT_FAMILIES = [
  { value: 'IBM Plex Sans', label: 'IBM Plex Sans' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
]

const FONT_SIZES = [
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
]

const COLORS = [
  { color: '#000000', name: 'Black' },
  { color: '#ffffff', name: 'White' },
  { color: '#2563eb', name: 'Blue' },
  { color: '#dc2626', name: 'Red' },
  { color: '#16a34a', name: 'Green' },
]

function Toolbar({ editor, splitMode, scrollSync, onToggleSplit, onToggleScrollSync }) {
  // editor is the ref object with methods like setColor, toggleBold, etc.
  const editorInstance = editor?.getEditor?.()

  const isActive = (type, attrs = {}) => {
    return editorInstance?.isActive(type, attrs) || false
  }

  const handleFontFamily = (e) => {
    editor?.setFontFamily(e.target.value)
  }

  const handleFontSize = (e) => {
    editor?.setFontSize(e.target.value)
  }

  const handleColor = (color) => {
    editor?.setColor(color)
  }

  return (
    <div className="toolbar">
      {/* Font Controls */}
      <div className="toolbar-group">
        <select 
          className="toolbar-select" 
          onChange={handleFontFamily}
          title="Font Family"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select 
          className="toolbar-select" 
          onChange={handleFontSize}
          title="Font Size"
          style={{ minWidth: '60px' }}
        >
          {FONT_SIZES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* Text Formatting */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${isActive('bold') ? 'active' : ''}`}
          onClick={() => editor?.toggleBold()}
          title="Bold (⌘B)"
        >
          <BoldIcon />
        </button>
        <button
          className={`toolbar-btn ${isActive('italic') ? 'active' : ''}`}
          onClick={() => editor?.toggleItalic()}
          title="Italic (⌘I)"
        >
          <ItalicIcon />
        </button>
        <button
          className={`toolbar-btn ${isActive('underline') ? 'active' : ''}`}
          onClick={() => editor?.toggleUnderline()}
          title="Underline (⌘U)"
        >
          <UnderlineIcon />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Headings */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor?.setHeading(1)}
          title="Heading 1"
        >
          H1
        </button>
        <button
          className={`toolbar-btn ${isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor?.setHeading(2)}
          title="Heading 2"
        >
          H2
        </button>
        <button
          className={`toolbar-btn ${isActive('heading', { level: 3 }) ? 'active' : ''}`}
          onClick={() => editor?.setHeading(3)}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Lists */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor?.toggleBulletList()}
          title="Bullet List"
        >
          <BulletListIcon />
        </button>
        <button
          className={`toolbar-btn ${isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor?.toggleOrderedList()}
          title="Numbered List"
        >
          <OrderedListIcon />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          onClick={() => editor?.setTextAlign('left')}
          title="Align Left"
        >
          <AlignLeftIcon />
        </button>
        <button
          className={`toolbar-btn ${isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          onClick={() => editor?.setTextAlign('center')}
          title="Align Center"
        >
          <AlignCenterIcon />
        </button>
        <button
          className={`toolbar-btn ${isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          onClick={() => editor?.setTextAlign('right')}
          title="Align Right"
        >
          <AlignRightIcon />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Colors */}
      <div className="toolbar-group color-picker">
        {COLORS.map(({ color, name }) => (
          <button
            key={color}
            className="toolbar-btn color-swatch"
            onClick={() => handleColor(color)}
            title={`Text Color: ${name}`}
            style={{ 
              backgroundColor: color,
              width: '16px',
              height: '16px',
              minWidth: '16px',
              borderRadius: '3px',
              border: color === '#ffffff' ? '1px solid #ccc' : '1px solid var(--border-primary)',
            }}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Split View Controls */}
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${splitMode !== 'single' ? 'active' : ''}`}
          onClick={onToggleSplit}
          title="Toggle Split View (⌘\)"
        >
          <SplitIcon />
          <span style={{ marginLeft: '4px', fontSize: '11px' }}>
            {splitMode === 'single' ? 'Split' : splitMode === 'same-doc' ? 'Same' : 'Dual'}
          </span>
        </button>
        {splitMode !== 'single' && (
          <button
            className={`toolbar-btn ${scrollSync ? 'active' : ''}`}
            onClick={onToggleScrollSync}
            title="Toggle Scroll Sync (⌘⇧S)"
          >
            <LinkIcon />
          </button>
        )}
      </div>
    </div>
  )
}

// Icons
const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
  </svg>
)

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
  </svg>
)

const UnderlineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
  </svg>
)

const BulletListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
  </svg>
)

const OrderedListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
  </svg>
)

const AlignLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
  </svg>
)

const AlignCenterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
  </svg>
)

const AlignRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
  </svg>
)

const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
  </svg>
)

const RedoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
  </svg>
)

const SplitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="12" y1="3" x2="12" y2="21"/>
  </svg>
)

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

export default Toolbar

