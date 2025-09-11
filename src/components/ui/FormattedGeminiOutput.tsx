import React from 'react'
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Copy, Check, Lightbulb, RefreshCw } from 'lucide-react'
import { FormattedSection, GeminiFormatOptions } from '../../utils/geminiFormatter'

interface FormattedGeminiOutputProps {
  sections: FormattedSection[]
  feature: GeminiFormatOptions['feature']
  isLoading?: boolean
  onCopy?: (content: string) => void
  onRegenerate?: () => void
  showSuggestions?: boolean
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
}

const FormattedGeminiOutput: React.FC<FormattedGeminiOutputProps> = ({
  sections,
  feature: _feature,
  isLoading = false,
  onCopy,
  onRegenerate,
  showSuggestions = false,
  suggestions = [],
  onSuggestionClick
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      onCopy?.(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getSectionIcon = (type: FormattedSection['type']) => {
    switch (type) {
      case 'highlight': return '🔍'
      case 'list': return '📋'
      case 'code': return '💻'
      case 'table': return '📊'
      default: return '📝'
    }
  }

  const getSectionColor = (type: FormattedSection['type']) => {
    switch (type) {
      case 'highlight': return 'border-blue-200 bg-blue-50'
      case 'list': return 'border-green-200 bg-green-50'
      case 'code': return 'border-gray-200 bg-gray-50'
      case 'table': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No response to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Gemini Analysis Results
        </h3>
        <div className="flex space-x-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Formatted sections */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getSectionColor(section.type)}`}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getSectionIcon(section.type)}</span>
                {section.title && (
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                )}
              </div>
              <button
                onClick={() => handleCopy(section.content, index)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy content"
              >
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Section content */}
            <div className="prose prose-sm max-w-none text-justify gemini-output">
              {section.type === 'code' ? (
                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto text-left">
                  <code>{section.content}</code>
                </pre>
              ) : section.type === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <tbody>
                      {section.content.split('\n').map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.split('|').map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-2 py-1 border-b text-justify">
                              {cell.trim()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 text-justify">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-justify">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-justify">{children}</ol>,
                    li: ({ children }) => <li className="mb-1 text-justify">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-left">
                        {children}
                      </code>
                    ),
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-justify">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-justify">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-justify">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-medium mb-1 text-justify">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-sm font-medium mb-1 text-justify">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-xs font-medium mb-1 text-justify">{children}</h6>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 text-justify">
                        {children}
                      </blockquote>
                    )
                  }}
                >
                  {section.content}
                </ReactMarkdown>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Suggested Questions
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FormattedGeminiOutput
