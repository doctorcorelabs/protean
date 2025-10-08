// Contoh penggunaan sistem Gemini formatting
import React from 'react'
import GeminiAssistant from '../components/ui/GeminiAssistant'
import { useFormattedGemini } from '../hooks/useFormattedGemini'
import FormattedGeminiOutput from '../components/ui/FormattedGeminiOutput'

// Contoh 1: Penggunaan sederhana dengan GeminiAssistant
export const SimpleUsageExample: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AI Analysis Assistant</h2>
      <GeminiAssistant
        feature="aianalysis"
        placeholder="Ask about protein stability, binding sites, or interactions..."
        showSuggestions={true}
        compact={false}
      />
    </div>
  )
}

// Contoh 2: Penggunaan advanced dengan hook custom
export const AdvancedUsageExample: React.FC = () => {
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
  } = useFormattedGemini('alphafold', {
    showBullets: true,
    showHeaders: true,
    compactMode: false
  })

  const handleCustomSubmit = async () => {
    await submitPrompt("Analyze the confidence of this AlphaFold prediction")
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{featureContext.icon}</span>
        <h2 className="text-2xl font-bold">{featureContext.title}</h2>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleCustomSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Analyze Prediction'}
        </button>
        
        <button
          onClick={clearResponse}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {formattedSections.length > 0 && (
        <FormattedGeminiOutput
          sections={formattedSections}
          feature="alphafold"
          isLoading={isLoading}
          onCopy={copyToClipboard}
          onRegenerate={regenerateResponse}
          showSuggestions={true}
          suggestions={suggestions}
        />
      )}

      {/* Raw response untuk debugging */}
      {rawResponse && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600">
            Raw Response (Debug)
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {rawResponse}
          </pre>
        </details>
      )}
    </div>
  )
}

// Contoh 3: Multiple features dalam satu halaman
export const MultiFeatureExample: React.FC = () => {
  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">3D Structure Analysis</h2>
        <GeminiAssistant
          feature="3dviewer"
          placeholder="Ask about this 3D structure..."
          compact={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Lab Planning</h2>
        <GeminiAssistant
          feature="labplanning"
          placeholder="Ask for protocol suggestions..."
          compact={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">PDB Search</h2>
        <GeminiAssistant
          feature="pdbsearch"
          placeholder="Find similar structures..."
          compact={true}
        />
      </div>
    </div>
  )
}

// Contoh 4: Custom formatting options
export const CustomFormattingExample: React.FC = () => {
  const { formattedSections, submitPrompt, isLoading } = useFormattedGemini('aianalysis', {
    showBullets: false,
    showHeaders: false,
    compactMode: true,
    maxLength: 3
  })

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Compact Analysis</h2>
      
      <button
        onClick={() => submitPrompt("Brief analysis of protein stability")}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Get Compact Analysis
      </button>

      {formattedSections.map((section, index) => (
        <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
          <p className="text-sm">{section.content}</p>
        </div>
      ))}
    </div>
  )
}

// Contoh 5: Error handling dan retry
export const ErrorHandlingExample: React.FC = () => {
  const {
    formattedSections,
    isLoading,
    error,
    submitPrompt,
    regenerateResponse
  } = useFormattedGemini('3dviewer')

  const handleSubmit = async () => {
    try {
      await submitPrompt("Explain protein structure")
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Error Handling Example</h2>
      
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Explain Structure'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 mb-2">{error}</p>
          <button
            onClick={regenerateResponse}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      )}

      {formattedSections.length > 0 && (
        <FormattedGeminiOutput
          sections={formattedSections}
          feature="3dviewer"
          isLoading={isLoading}
          onRegenerate={regenerateResponse}
        />
      )}
    </div>
  )
}

// Contoh 6: Integration dengan data eksternal
export const DataIntegrationExample: React.FC = () => {
  const [pdbId, setPdbId] = React.useState('1CRN')
  
  const { submitPrompt, isLoading } = useFormattedGemini('3dviewer')

  const handleAnalyzeWithData = async () => {
    const prompt = `Analyze the structure of PDB ID ${pdbId}. Focus on:
    - Secondary structure elements
    - Functional domains
    - Binding sites
    - Stability factors`
    
    await submitPrompt(prompt)
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Structure Analysis with PDB Data</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">PDB ID:</label>
        <input
          type="text"
          value={pdbId}
          onChange={(e) => setPdbId(e.target.value.toUpperCase())}
          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Enter PDB ID"
        />
      </div>

      <button
        onClick={handleAnalyzeWithData}
        disabled={isLoading || !pdbId}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Analyzing...' : `Analyze ${pdbId}`}
      </button>
    </div>
  )
}

export default {
  SimpleUsageExample,
  AdvancedUsageExample,
  MultiFeatureExample,
  CustomFormattingExample,
  ErrorHandlingExample,
  DataIntegrationExample
}





