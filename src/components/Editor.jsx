import React, { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { FontSize } from '../extensions/FontSize'
import { sinkListItem, liftListItem } from '@tiptap/pm/schema-list'

const Editor = forwardRef(({ 
  content, 
  onUpdate, 
  onFocus,
  placeholder = 'Start writing...',
  scrollRef,
  onScroll,
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON())
    },
    onFocus: () => {
      onFocus?.()
    },
    editorProps: {
      handlePaste: (view, event, slice) => {
        // Default to plain text paste
        const text = event.clipboardData?.getData('text/plain')
        if (text) {
          event.preventDefault()
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
        return false
      },
      handleKeyDown: (view, event) => {
        const isMod = event.metaKey || event.ctrlKey
        const { state, dispatch } = view
        
        // Indent list: Cmd+]
        if (isMod && event.key === ']') {
          const listItemType = state.schema.nodes.listItem
          if (listItemType && sinkListItem(listItemType)(state, dispatch)) {
            event.preventDefault()
            return true
          }
        }
        
        // Unindent list: Cmd+[
        if (isMod && event.key === '[') {
          const listItemType = state.schema.nodes.listItem
          if (listItemType && liftListItem(listItemType)(state, dispatch)) {
            event.preventDefault()
            return true
          }
        }
        
        return false
      },
      attributes: {
        class: 'prose',
      },
    },
  })

  // Expose editor methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    getEditor: () => editor,
    getContent: () => editor?.getJSON(),
    getHTML: () => editor?.getHTML(),
    getText: () => editor?.getText(),
    setContent: (content) => editor?.commands.setContent(content),
    // Formatting commands
    toggleBold: () => editor?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
    setHeading: (level) => editor?.chain().focus().toggleHeading({ level }).run(),
    toggleBulletList: () => editor?.chain().focus().toggleBulletList().run(),
    toggleOrderedList: () => editor?.chain().focus().toggleOrderedList().run(),
    setTextAlign: (align) => editor?.chain().focus().setTextAlign(align).run(),
    setFontFamily: (font) => editor?.chain().focus().setFontFamily(font).run(),
    setFontSize: (size) => editor?.chain().focus().setFontSize(size).run(),
    setColor: (color) => editor?.chain().focus().setColor(color).run(),
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    // Search
    findText: (text) => {
      if (!editor || !text) return { count: 0, current: 0 }
      // Simple find implementation using decorations
      const { doc } = editor.state
      let count = 0
      doc.descendants((node) => {
        if (node.isText) {
          const matches = node.text?.match(new RegExp(text, 'gi'))
          if (matches) count += matches.length
        }
      })
      return { count, current: count > 0 ? 1 : 0 }
    },
  }), [editor])

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Handle scroll sync
  useEffect(() => {
    const scrollElement = scrollRef?.current
    if (scrollElement && onScroll) {
      scrollElement.addEventListener('scroll', onScroll)
      return () => scrollElement.removeEventListener('scroll', onScroll)
    }
  }, [scrollRef, onScroll])

  if (!editor) {
    return null
  }

  return (
    <div className="editor-wrapper" ref={scrollRef}>
      <EditorContent editor={editor} />
    </div>
  )
})

Editor.displayName = 'Editor'

export default Editor

