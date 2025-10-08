// Test file untuk memastikan tidak ada infinite recursion
import React from 'react'
import { useFormattedGemini } from '../hooks/useFormattedGemini'

// Test component sederhana
export const GeminiTest: React.FC = () => {
  const {
    rawResponse,
    formattedSections,
    isLoading,
    error,
    submitPrompt,
    clearResponse: _clearResponse,
    regenerateResponse: _regenerateResponse,
    suggestions,
    featureContext,
    copyToClipboard: _copyToClipboard
  } = useFormattedGemini('aianalysis', {
    showBullets: true,
    showHeaders: true,
    compactMode: false
  })

  console.log('GeminiTest rendered:', {
    rawResponse: rawResponse.length,
    formattedSections: formattedSections.length,
    isLoading,
    error,
    suggestions: suggestions.length,
    featureContext: featureContext.title
  })

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gemini Test</h2>
      <p>Raw response length: {rawResponse.length}</p>
      <p>Formatted sections: {formattedSections.length}</p>
      <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      <p>Error: {error || 'None'}</p>
      <p>Suggestions: {suggestions.length}</p>
      <p>Feature: {featureContext.title}</p>
      
      <button
        onClick={() => submitPrompt('Test prompt')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Submit
      </button>
    </div>
  )
}

export default GeminiTest





