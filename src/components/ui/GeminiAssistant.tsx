import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Lightbulb, RefreshCw } from 'lucide-react'
import { useFormattedGemini } from '../../hooks/useFormattedGemini'
import FormattedGeminiOutput from './FormattedGeminiOutput'
import { GeminiFormatOptions } from '../../utils/geminiFormatter'

interface GeminiAssistantProps {
  feature: GeminiFormatOptions['feature']
  placeholder?: string
  title?: string
  showSuggestions?: boolean
  compact?: boolean
  className?: string
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({
  feature,
  placeholder,
  title,
  showSuggestions = true,
  compact = false,
  className = ''
}) => {
  const [prompt, setPrompt] = useState('')
  const [_isExpanded, _setIsExpanded] = useState(false)

  const {
    rawResponse,
    formattedSections,
    isLoading,
    error,
    submitPrompt,
    clearResponse,
    regenerateResponse,
    suggestions,
    featureContext,
    copyToClipboard
  } = useFormattedGemini(feature, {
    showBullets: true,
    showHeaders: true,
    compactMode: compact
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      await submitPrompt(prompt.trim())
      // Note: Expand functionality not implemented
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    setPrompt(suggestion)
    await submitPrompt(suggestion)
    // Note: Expand functionality not implemented
  }

  const handleClear = () => {
    clearResponse()
    setPrompt('')
    // Note: Expand functionality not implemented
  }

  const displayTitle = title || featureContext.title
  const displayPlaceholder = placeholder || `Ask about ${featureContext.title.toLowerCase()}...`

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{featureContext.icon}</span>
            <h2 className="text-lg font-semibold text-gray-900">
              {displayTitle}
            </h2>
          </div>
          {rawResponse && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear response"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={displayPlaceholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Processing...' : 'Ask'}</span>
            </button>
          </div>
        </form>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && !rawResponse && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              Suggested questions:
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response */}
      {(rawResponse || error) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-gray-200"
        >
          <div className="p-4">
            {error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm text-justify">{error}</p>
                <button
                  onClick={regenerateResponse}
                  className="mt-2 flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try again</span>
                </button>
              </div>
            ) : (
              <FormattedGeminiOutput
                sections={formattedSections}
                feature={feature}
                isLoading={isLoading}
                onCopy={copyToClipboard}
                onRegenerate={regenerateResponse}
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default GeminiAssistant
