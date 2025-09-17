'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import React from 'react'

interface MarkdownRendererProps {
  content: string
  isDarkMode: boolean
}

export function MarkdownRenderer({ content, isDarkMode }: MarkdownRendererProps) {
  // Sanitize content to prevent table parsing issues
  const sanitizedContent = React.useMemo(() => {
    // Ensure proper spacing around tables
    return content
      .replace(/\n\|/g, '\n\n|')  // Add spacing before table rows
      .replace(/\|\n/g, '|\n\n')  // Add spacing after table rows
  }, [content])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm max-w-none"
      components={{
        h1: ({children}) => (
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {children}
          </h1>
        ),
        h2: ({children}) => (
          <h2 className={`text-xl font-bold mb-3 mt-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {children}
          </h2>
        ),
        h3: ({children}) => (
          <h3 className={`text-lg font-semibold mb-2 mt-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {children}
          </h3>
        ),
        p: ({children}) => (
          <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {children}
          </p>
        ),
        ul: ({children}) => (
          <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
        ),
        ol: ({children}) => (
          <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
        ),
        li: ({children}) => (
          <li className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {children}
          </li>
        ),
        strong: ({children}) => (
          <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {children}
          </strong>
        ),
        code: ({children, ...props}) => {
          // Check if it's inline code or code block
          const isInline = !('inline' in props) || props.inline
          return isInline ? (
            <code className={`px-2 py-1 rounded text-sm font-mono ${
              isDarkMode ? 'bg-gray-800 text-blue-400' : 'bg-gray-100 text-blue-600'
            }`}>
              {children}
            </code>
          ) : (
            <code className="block">{children}</code>
          )
        },
        pre: ({children}) => (
          <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${
            isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            {children}
          </pre>
        ),
        blockquote: ({children}) => (
          <blockquote className={`border-l-4 pl-4 mb-4 italic ${
            isDarkMode ? 'border-blue-500 text-gray-400' : 'border-blue-500 text-gray-600'
          }`}>
            {children}
          </blockquote>
        ),
        table: ({children}) => (
          <div className="overflow-x-auto mb-4">
            <table className={`min-w-full divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              {children}
            </table>
          </div>
        ),
        thead: ({children}) => (
          <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            {children}
          </thead>
        ),
        tbody: ({children}) => (
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
            {children}
          </tbody>
        ),
        tr: ({children}) => <tr>{children}</tr>,
        th: ({children}) => (
          <th className={`px-4 py-2 text-left text-sm font-semibold ${
            isDarkMode ? 'text-gray-300' : 'text-gray-900'
          }`}>
            {children}
          </th>
        ),
        td: ({children}) => (
          <td className={`px-4 py-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {children}
          </td>
        ),
        hr: () => (
          <hr className={`my-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`} />
        ),
      }}
    >
      {sanitizedContent || ''}
    </ReactMarkdown>
  )
}