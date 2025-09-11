import { useState, useCallback } from 'react'
import { streamGemini } from '../services/geminiService'
import { useGeminiFormatter, GeminiFormatOptions } from '../utils/geminiFormatter'
import { FormattedSection } from '../utils/geminiFormatter'

interface UseFormattedGeminiOptions extends Partial<GeminiFormatOptions> {
  autoFormat?: boolean
  showSuggestions?: boolean
}

interface UseFormattedGeminiReturn {
  // State
  rawResponse: string
  formattedSections: FormattedSection[]
  isLoading: boolean
  error: string | null
  
  // Actions
  submitPrompt: (prompt: string) => Promise<void>
  clearResponse: () => void
  regenerateResponse: () => Promise<void>
  
  // Utilities
  suggestions: string[]
  featureContext: any
  copyToClipboard: (content: string) => Promise<void>
}

export const useFormattedGemini = (
  feature: GeminiFormatOptions['feature'],
  options: UseFormattedGeminiOptions = {}
): UseFormattedGeminiReturn => {
  const [rawResponse, setRawResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastPrompt, setLastPrompt] = useState('')

  const {
    formatResponse,
    getSuggestions,
    getContext
  } = useGeminiFormatter(feature, options)

  // Format the raw response into sections
  const formattedSections = options.autoFormat !== false ? 
    formatResponse(rawResponse) : 
    []

  const submitPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)
    setRawResponse('')
    setLastPrompt(prompt)

    try {
      await streamGemini(feature, prompt, (chunk) => {
        setRawResponse(prev => prev + chunk)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to get response from Gemini')
    } finally {
      setIsLoading(false)
    }
  }, [feature])

  const clearResponse = useCallback(() => {
    setRawResponse('')
    setError(null)
    setLastPrompt('')
  }, [])

  const regenerateResponse = useCallback(async () => {
    if (lastPrompt) {
      await submitPrompt(lastPrompt)
    }
  }, [lastPrompt, submitPrompt])

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }, [])

  return {
    // State
    rawResponse,
    formattedSections,
    isLoading,
    error,
    
    // Actions
    submitPrompt,
    clearResponse,
    regenerateResponse,
    
    // Utilities
    suggestions: getSuggestions(),
    featureContext: getContext(),
    copyToClipboard
  }
}
