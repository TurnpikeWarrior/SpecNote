/**
 * Export utilities for converting TipTap JSON to Markdown and Plain Text
 */

/**
 * Convert TipTap JSON content to Markdown
 * @param {Object} content - TipTap JSON document
 * @returns {string} Markdown string
 */
export function exportToMarkdown(content) {
  if (!content || !content.content) return ''
  
  return content.content
    .map(node => nodeToMarkdown(node))
    .join('\n')
    .trim()
}

/**
 * Convert TipTap JSON content to Plain Text
 * @param {Object} content - TipTap JSON document
 * @returns {string} Plain text string
 */
export function exportToPlainText(content) {
  if (!content || !content.content) return ''
  
  return content.content
    .map(node => nodeToPlainText(node))
    .join('\n')
    .trim()
}

function nodeToMarkdown(node, depth = 0) {
  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1
      const prefix = '#'.repeat(level)
      const text = getTextContent(node)
      return `${prefix} ${text}\n`
    }

    case 'paragraph': {
      const text = marksToMarkdown(node)
      return text ? `${text}\n` : '\n'
    }

    case 'bulletList': {
      return node.content
        ?.map(item => nodeToMarkdown(item, depth))
        .join('')
        || ''
    }

    case 'orderedList': {
      return node.content
        ?.map((item, index) => nodeToMarkdown(item, depth, index + 1))
        .join('')
        || ''
    }

    case 'listItem': {
      const indent = '  '.repeat(depth)
      const bullet = typeof arguments[2] === 'number' ? `${arguments[2]}.` : '-'
      const content = node.content
        ?.map(child => {
          if (child.type === 'paragraph') {
            return marksToMarkdown(child)
          }
          return nodeToMarkdown(child, depth + 1)
        })
        .join('\n')
        || ''
      return `${indent}${bullet} ${content}\n`
    }

    case 'text': {
      return applyMarks(node.text || '', node.marks)
    }

    default:
      return getTextContent(node)
  }
}

function nodeToPlainText(node, depth = 0) {
  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level || 1
      const prefix = '#'.repeat(level)
      const text = getTextContent(node)
      return `${prefix} ${text}\n`
    }

    case 'paragraph': {
      const text = getTextContent(node)
      return text ? `${text}\n` : '\n'
    }

    case 'bulletList': {
      return node.content
        ?.map(item => nodeToPlainText(item, depth))
        .join('')
        || ''
    }

    case 'orderedList': {
      return node.content
        ?.map((item, index) => {
          const indent = '  '.repeat(depth)
          const content = item.content
            ?.map(child => getTextContent(child))
            .join(' ')
            || ''
          return `${indent}${index + 1}. ${content}\n`
        })
        .join('')
        || ''
    }

    case 'listItem': {
      const indent = '  '.repeat(depth)
      const content = node.content
        ?.map(child => {
          if (child.type === 'paragraph') {
            return getTextContent(child)
          }
          return nodeToPlainText(child, depth + 1)
        })
        .join('\n')
        || ''
      return `${indent}- ${content}\n`
    }

    default:
      return getTextContent(node)
  }
}

function getTextContent(node) {
  if (node.type === 'text') {
    return node.text || ''
  }
  
  if (node.content) {
    return node.content
      .map(child => getTextContent(child))
      .join('')
  }
  
  return ''
}

function marksToMarkdown(node) {
  if (!node.content) return ''
  
  return node.content
    .map(child => {
      if (child.type === 'text') {
        return applyMarks(child.text || '', child.marks)
      }
      return nodeToMarkdown(child)
    })
    .join('')
}

function applyMarks(text, marks) {
  if (!marks || marks.length === 0) return text
  
  let result = text
  
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `**${result}**`
        break
      case 'italic':
        result = `*${result}*`
        break
      case 'underline':
        // Underline is dropped in Markdown export (as per PRD)
        break
      case 'textStyle':
        // Font family, size, color are dropped in Markdown export
        break
    }
  }
  
  return result
}

