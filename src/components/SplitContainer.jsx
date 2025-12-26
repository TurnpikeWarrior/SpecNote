import React, { useState, useCallback, useRef, useEffect } from 'react'
import EditorPane from './EditorPane'

function SplitContainer({
  splitMode,
  activePane,
  setActivePane,
  leftEditorRef,
  rightEditorRef,
  leftDoc,
  rightDoc,
  updateLeftDoc,
  updateRightDoc,
  leftSaveState,
  rightSaveState,
  scrollSync,
  searchOpen,
  setSearchOpen,
}) {
  const [splitPosition, setSplitPosition] = useState(50)
  const containerRef = useRef(null)
  const isDragging = useRef(false)
  const leftScrollRef = useRef(null)
  const rightScrollRef = useRef(null)

  // Handle split divider drag
  const handleMouseDown = useCallback((e) => {
    isDragging.current = true
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    setSplitPosition(Math.max(20, Math.min(80, newPosition)))
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Scroll sync handler
  const handleLeftScroll = useCallback(() => {
    if (!scrollSync || !leftScrollRef.current || !rightScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = leftScrollRef.current
    const scrollRatio = scrollTop / (scrollHeight - clientHeight)
    const rightScrollable = rightScrollRef.current.scrollHeight - rightScrollRef.current.clientHeight
    rightScrollRef.current.scrollTop = scrollRatio * rightScrollable
  }, [scrollSync])

  const handleRightScroll = useCallback(() => {
    if (!scrollSync || !leftScrollRef.current || !rightScrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = rightScrollRef.current
    const scrollRatio = scrollTop / (scrollHeight - clientHeight)
    const leftScrollable = leftScrollRef.current.scrollHeight - leftScrollRef.current.clientHeight
    leftScrollRef.current.scrollTop = scrollRatio * leftScrollable
  }, [scrollSync])

  const isSinglePane = splitMode === 'single'
  const isSameDoc = splitMode === 'same-doc'

  return (
    <div 
      ref={containerRef}
      className={`split-container ${isSinglePane ? 'single-pane' : ''}`}
    >
      <EditorPane
        ref={leftEditorRef}
        paneId="left"
        isActive={activePane === 'left'}
        onFocus={() => setActivePane('left')}
        doc={leftDoc}
        onUpdate={updateLeftDoc}
        saveState={leftSaveState}
        style={!isSinglePane ? { width: `${splitPosition}%` } : undefined}
        scrollRef={leftScrollRef}
        onScroll={isSameDoc ? handleLeftScroll : undefined}
        searchOpen={searchOpen && activePane === 'left'}
        setSearchOpen={setSearchOpen}
      />

      <div 
        className="split-divider"
        onMouseDown={handleMouseDown}
        style={isSinglePane ? { display: 'none' } : undefined}
      />
      <EditorPane
        ref={rightEditorRef}
        paneId="right"
        isActive={activePane === 'right'}
        onFocus={() => setActivePane('right')}
        doc={isSameDoc ? leftDoc : rightDoc}
        onUpdate={isSameDoc ? updateLeftDoc : updateRightDoc}
        saveState={isSameDoc ? leftSaveState : rightSaveState}
        style={isSinglePane ? { display: 'none' } : { width: `${100 - splitPosition}%` }}
        scrollRef={rightScrollRef}
        onScroll={isSameDoc ? handleRightScroll : undefined}
        searchOpen={searchOpen && activePane === 'right'}
        setSearchOpen={setSearchOpen}
      />
    </div>
  )
}

export default SplitContainer

