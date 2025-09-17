'use client'

import React from 'react'

interface SimpleMarkdownProps {
  content: string
  isDarkMode: boolean
}

export function SimpleMarkdown({ content, isDarkMode }: SimpleMarkdownProps) {
  // Parse the content to handle basic markdown formatting
  const renderContent = () => {
    if (!content) return null

    // Split content into lines for processing
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []
    let tableHeaders: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true
          // Parse header row
          tableHeaders = line.split('|').slice(1, -1).map(h => h.trim())
        } else if (line.includes('---')) {
          // Skip separator line
          continue
        } else {
          // Parse data row
          const row = line.split('|').slice(1, -1).map(cell => cell.trim())
          tableRows.push(row)
        }

        // Check if next line is not a table line
        if (i === lines.length - 1 || (!lines[i + 1].trim().startsWith('|') || !lines[i + 1].trim().endsWith('|'))) {
          // Render the complete table
          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto mb-4">
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <tr>
                    {tableHeaders.map((header, idx) => (
                      <th key={idx} className={`px-4 py-2 text-left text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
                  {tableRows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className={`px-4 py-2 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {formatInlineText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          inTable = false
          tableRows = []
          tableHeaders = []
        }
      } else if (!inTable) {
        // Handle headers
        if (line.startsWith('### ')) {
          elements.push(
            <h3 key={`h3-${i}`} className={`text-lg font-semibold mb-2 mt-4 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {line.substring(4)}
            </h3>
          )
        } else if (line.startsWith('## ')) {
          elements.push(
            <h2 key={`h2-${i}`} className={`text-xl font-bold mb-3 mt-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {line.substring(3)}
            </h2>
          )
        } else if (line.startsWith('# ')) {
          elements.push(
            <h1 key={`h1-${i}`} className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {line.substring(2)}
            </h1>
          )
        }
        // Handle bullet points
        else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const items = []
          let j = i
          while (j < lines.length && (lines[j].trim().startsWith('- ') || lines[j].trim().startsWith('* '))) {
            items.push(lines[j].trim().substring(2))
            j++
          }
          elements.push(
            <ul key={`ul-${i}`} className="list-disc list-inside mb-3 space-y-1">
              {items.map((item, idx) => (
                <li key={idx} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatInlineText(item)}
                </li>
              ))}
            </ul>
          )
          i = j - 1
        }
        // Handle numbered lists
        else if (/^\d+\.\s/.test(line.trim())) {
          const items = []
          let j = i
          while (j < lines.length && /^\d+\.\s/.test(lines[j].trim())) {
            items.push(lines[j].trim().replace(/^\d+\.\s/, ''))
            j++
          }
          elements.push(
            <ol key={`ol-${i}`} className="list-decimal list-inside mb-3 space-y-1">
              {items.map((item, idx) => (
                <li key={idx} className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatInlineText(item)}
                </li>
              ))}
            </ol>
          )
          i = j - 1
        }
        // Handle horizontal rules
        else if (line.trim() === '---' || line.trim() === '***') {
          elements.push(
            <hr key={`hr-${i}`} className={`my-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />
          )
        }
        // Handle regular paragraphs
        else if (line.trim()) {
          elements.push(
            <p key={`p-${i}`} className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {formatInlineText(line)}
            </p>
          )
        }
      }
    }

    return elements
  }

  // Format inline text with bold and code
  const formatInlineText = (text: string): React.ReactNode => {
    const parts = []
    let current = ''
    let i = 0

    while (i < text.length) {
      // Handle bold
      if (text.substring(i, i + 2) === '**') {
        if (current) {
          parts.push(current)
          current = ''
        }
        const endIndex = text.indexOf('**', i + 2)
        if (endIndex !== -1) {
          parts.push(
            <strong key={`strong-${i}`} className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {text.substring(i + 2, endIndex)}
            </strong>
          )
          i = endIndex + 2
        } else {
          current += text.substring(i, i + 2)
          i += 2
        }
      }
      // Handle inline code
      else if (text[i] === '`') {
        if (current) {
          parts.push(current)
          current = ''
        }
        const endIndex = text.indexOf('`', i + 1)
        if (endIndex !== -1) {
          parts.push(
            <code key={`code-${i}`} className={`px-2 py-1 rounded text-sm font-mono ${
              isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'
            }`}>
              {text.substring(i + 1, endIndex)}
            </code>
          )
          i = endIndex + 1
        } else {
          current += text[i]
          i++
        }
      } else {
        current += text[i]
        i++
      }
    }

    if (current) {
      parts.push(current)
    }

    return parts.length === 0 ? text : parts
  }

  return (
    <div className="prose prose-sm max-w-none">
      {renderContent()}
    </div>
  )
}