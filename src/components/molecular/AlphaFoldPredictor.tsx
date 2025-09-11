import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Zap, Download, AlertCircle, CheckCircle, Clock, Brain, Database, Search, Info, Play, Pause, RotateCcw } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { PDBApiService, PDBStructureData } from '../../services/pdbApi'
import { useApi } from '../../hooks/useApi'
import { ProteinPredictionService, PredictionResult, SequenceAnalysis } from '../../services/proteinPredictionService'
import ProteinStructure3D from './ProteinStructure3D'
import GeminiAssistant from '../ui/GeminiAssistant'

const AlphaFoldPredictor: React.FC = () => {
  const [sequence, setSequence] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [sequenceAnalysis, setSequenceAnalysis] = useState<SequenceAnalysis | null>(null)
  const [predictionProgress, setPredictionProgress] = useState(0)
  const [predictionStep, setPredictionStep] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [pdbId, setPdbId] = useState('')
  const [pdbData, setPdbData] = useState<PDBStructureData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{pdbId: string, title: string}[]>([])
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationSuggestions, setValidationSuggestions] = useState<string[]>([])
  const [predictedPDBData, setPredictedPDBData] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState('ribbon')
  const proteinViewerRef = useRef<any>(null)

  // Check if we should show DNA sample prediction
  const showSamplePrediction = validationErrors.length > 0 && 
    validationErrors.some(e => e.includes('DNA sequence detected'))

  const { execute: loadStructure } = useApi<PDBStructureData>()

  const handleSequenceSubmit = async () => {
    if (!sequence.trim()) return

    // Validate sequence first
    const validation = ProteinPredictionService.validateSequence(sequence)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setValidationSuggestions(validation.suggestions || [])
      return
    }

    setValidationErrors([])
    setValidationSuggestions([])
    setIsAnalyzing(true)
    setError(null)
    setPredictionProgress(0)
    setPredictionStep('Initializing prediction...')
    
    // Analyze sequence properties
    const analysis = ProteinPredictionService.analyzeSequence(sequence)
    setSequenceAnalysis(analysis)
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setPredictionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 500)
    
    const stepInterval = setInterval(() => {
      const steps = [
        'Analyzing sequence properties...',
        'Searching AlphaFold database...',
        'Generating MSA alignment...',
        'Running structure prediction...',
        'Calculating confidence scores...',
        'Finalizing results...'
      ]
      setPredictionStep(steps[Math.floor(Math.random() * steps.length)])
    }, 1000)

    setResult({
      jobId: '',
      confidence: 0,
      plddt: [],
      structure: '',
      timestamp: new Date().toISOString(),
      status: 'running',
      downloadUrls: { pdb: '', json: '' },
      metadata: {
        sequenceLength: sequence.length,
        predictionMethod: 'Initializing...',
        modelVersion: '',
        processingTime: 0
      }
    })

    try {
      // Use real prediction service
      const predictionResult = await ProteinPredictionService.predictStructure({
        sequence: sequence.trim(),
        jobName: `prediction_${Date.now()}`,
        maxRecycles: 3,
        numModels: 5,
        useAmber: false,
        useTemplates: true
      })
      
      setResult(predictionResult)
      setPredictionProgress(100)
      setPredictionStep('Prediction completed!')
      
      // Generate PDB data for 3D visualization
      if (predictionResult.status === 'completed') {
        const pdbData = await generatePDBFromPrediction(predictionResult, sequence)
        setPredictedPDBData(pdbData)
      }
    } catch (err) {
      setError(`Prediction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setResult(null)
      setPredictionStep('Prediction failed')
    } finally {
      setIsAnalyzing(false)
      // Clear intervals
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }

  // Generate PDB data from prediction result
  const generatePDBFromPrediction = async (prediction: PredictionResult, sequence: string): Promise<string> => {
    // For now, generate a simple PDB structure based on the sequence
    // In a real implementation, this would come from the prediction API
    let pdbContent = `HEADER    PREDICTED STRUCTURE                    ${new Date().toISOString().split('T')[0]}   ${prediction.jobId}\n`
    pdbContent += `TITLE     PREDICTED PROTEIN STRUCTURE\n`
    pdbContent += `REMARK   1 PREDICTION METHOD: ${prediction.metadata.predictionMethod}\n`
    pdbContent += `REMARK   1 CONFIDENCE: ${prediction.confidence.toFixed(1)}%\n`
    pdbContent += `REMARK   1 SEQUENCE: ${sequence}\n`
    pdbContent += `ATOM      1  N   ALA A   1      20.154  16.967  23.862  1.00 ${prediction.plddt[0]?.toFixed(2) || '50.00'}           N\n`
    pdbContent += `ATOM      2  CA  ALA A   1      19.030  16.067  23.862  1.00 ${prediction.plddt[0]?.toFixed(2) || '50.00'}           C\n`
    pdbContent += `ATOM      3  C   ALA A   1      18.030  16.067  25.062  1.00 ${prediction.plddt[0]?.toFixed(2) || '50.00'}           C\n`
    pdbContent += `ATOM      4  O   ALA A   1      18.030  16.067  26.262  1.00 ${prediction.plddt[0]?.toFixed(2) || '50.00'}           O\n`
    
    // Add more atoms based on sequence length
    for (let i = 1; i < sequence.length; i++) {
      const x = 20.154 + i * 3.8
      const y = 16.967 + Math.sin(i * 0.5) * 2
      const z = 23.862 + Math.cos(i * 0.5) * 2
      const confidence = prediction.plddt[i]?.toFixed(2) || '50.00'
      
      pdbContent += `ATOM    ${(i*4+1).toString().padStart(3)}  N   ${sequence[i]}   A   ${(i+1).toString().padStart(2)}      ${x.toFixed(3)}  ${y.toFixed(3)}  ${z.toFixed(3)}  1.00 ${confidence}           N\n`
      pdbContent += `ATOM    ${(i*4+2).toString().padStart(3)}  CA  ${sequence[i]}   A   ${(i+1).toString().padStart(2)}      ${(x+1).toFixed(3)}  ${y.toFixed(3)}  ${z.toFixed(3)}  1.00 ${confidence}           C\n`
      pdbContent += `ATOM    ${(i*4+3).toString().padStart(3)}  C   ${sequence[i]}   A   ${(i+1).toString().padStart(2)}      ${(x+2).toFixed(3)}  ${y.toFixed(3)}  ${z.toFixed(3)}  1.00 ${confidence}           C\n`
      pdbContent += `ATOM    ${(i*4+4).toString().padStart(3)}  O   ${sequence[i]}   A   ${(i+1).toString().padStart(2)}      ${(x+3).toFixed(3)}  ${y.toFixed(3)}  ${z.toFixed(3)}  1.00 ${confidence}           O\n`
    }
    
    pdbContent += `END\n`
    return pdbContent
  }

  // 3D Viewer controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    if (proteinViewerRef.current) {
      proteinViewerRef.current.zoomTo()
    }
  }

  const getViewerStyle = (mode: string) => {
    switch (mode) {
      case 'ribbon':
        return 'ribbon+stick'
      case 'atoms':
        return 'sphere'
      case 'bonds':
        return 'stick'
      case 'all':
        return 'sphere+stick'
      case 'surface':
        return 'surface'
      default:
        return 'ribbon+stick'
    }
  }

  const handleLoadFromPDB = async (selectedPdbId: string) => {
    if (!PDBApiService.validatePDBId(selectedPdbId)) {
      setError('Invalid PDB ID format')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setPdbId(selectedPdbId)
    
    // Reset previous results
    setResult(null)
    setPredictedPDBData(null)
    setSequenceAnalysis(null)
    setPdbData(null)

    try {
      const data = await loadStructure(() => PDBApiService.getCompleteStructureData(selectedPdbId))
      setPdbData(data)
      
      // Extract sequence from PDB data
      if (data.polymerEntities.length > 0 && data.polymerEntities[0].entity_poly?.pdbx_seq_one_letter_code) {
        setSequence(data.polymerEntities[0].entity_poly.pdbx_seq_one_letter_code)
      }
    } catch (err) {
      setError(`Failed to load structure ${selectedPdbId}`)
      setPdbData(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const results = await PDBApiService.searchStructures(searchQuery)
      setSearchResults(results)
    } catch (err) {
      setError('Failed to search structures')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePdbIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pdbId.trim()) {
      handleLoadFromPDB(pdbId.trim().toUpperCase())
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        // Clean FASTA format if present
        const cleanSequence = content
          .split('\n')
          .filter(line => !line.startsWith('>'))
          .join('')
          .replace(/\s/g, '')
          .toUpperCase()
        setSequence(cleanSequence)
        
        // Auto-analyze sequence when loaded from file
        if (cleanSequence.length > 0) {
          const analysis = ProteinPredictionService.analyzeSequence(cleanSequence)
          setSequenceAnalysis(analysis)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleSequenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSequence = e.target.value
    setSequence(newSequence)
    
    // Clear previous analysis and errors
    setSequenceAnalysis(null)
    setValidationErrors([])
    setValidationSuggestions([])
    
    // Auto-analyze sequence if it's valid
    if (newSequence.trim().length > 0) {
      const validation = ProteinPredictionService.validateSequence(newSequence)
      if (validation.isValid) {
        const analysis = ProteinPredictionService.analyzeSequence(newSequence)
        setSequenceAnalysis(analysis)
      } else {
        setValidationErrors(validation.errors)
        setValidationSuggestions(validation.suggestions || [])
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        // Clean FASTA format if present
        const cleanSequence = content
          .split('\n')
          .filter(line => !line.startsWith('>'))
          .join('')
          .replace(/\s/g, '')
          .toUpperCase()
        setSequence(cleanSequence)
        
        // Auto-analyze sequence when dropped
        if (cleanSequence.length > 0) {
          const analysis = ProteinPredictionService.analyzeSequence(cleanSequence)
          setSequenceAnalysis(analysis)
        }
      }
      reader.readAsText(file)
    }
  }


  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500'
    if (confidence >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'Very High'
    if (confidence >= 70) return 'High'
    if (confidence >= 50) return 'Medium'
    return 'Low'
  }

  const handleConvertDNAtoProtein = () => {
    try {
      const proteinSequence = ProteinPredictionService.convertDNAtoProtein(sequence)
      if (proteinSequence.length > 0) {
        setSequence(proteinSequence)
        setValidationErrors([])
        setValidationSuggestions([])
        
        // Auto-analyze the converted protein sequence
        const analysis = ProteinPredictionService.analyzeSequence(proteinSequence)
        setSequenceAnalysis(analysis)
      }
    } catch (error) {
      setError('Failed to convert DNA sequence to protein')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AlphaFold Predictor</h1>
          <p className="text-gray-600">Predict protein structures using advanced AI models</p>
        </motion.div>

        {/* Gemini AI Assistant */}
        <div className="max-w-4xl mx-auto mb-8">
          <GeminiAssistant
            feature="alphafold"
            placeholder="Ask about AlphaFold predictions, confidence scores, or structure analysis..."
            compact={false}
          />
        </div>

        {/* PDB Integration Section */}
        <div className="mb-8">
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 text-blue-500 mr-2" />
              Load Sequence from PDB
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Direct PDB ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter PDB ID to extract sequence
                </label>
                <form onSubmit={handlePdbIdSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={pdbId}
                    onChange={(e) => setPdbId(e.target.value.toUpperCase())}
                    placeholder="Enter PDB ID..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    maxLength={4}
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzing || !pdbId.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Loading...' : 'Load'}
                  </button>
                </form>
              </div>

              {/* Search PDB Structures */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Popular Structures
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search structures..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isAnalyzing || !searchQuery.trim()}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results & Error */}
            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Results:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.map(({ pdbId, title }) => (
                    <button
                      key={pdbId}
                      onClick={() => handleLoadFromPDB(pdbId)}
                      className="p-2 text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span className="font-mono text-blue-700">{pdbId}</span>
                      <span className="block text-xs text-gray-700 mt-1">{title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* PDB Structure Info */}
            {pdbData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Loaded Structure:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">PDB ID:</span>
                    <span className="text-green-900 ml-2">{pdbData.entry.rcsb_id}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Title:</span>
                    <span className="text-green-900 ml-2">{pdbData.entry.struct.title}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Method:</span>
                    <span className="text-green-900 ml-2">{pdbData.entry.exptl[0]?.method}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Sequence Length:</span>
                    <span className="text-green-900 ml-2">
                      {pdbData.polymerEntities[0]?.entity_poly?.pdbx_seq_one_letter_code?.length || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                Protein Sequence Input
              </h3>
              
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop a FASTA file here, or
                </p>
                <label className="btn-primary cursor-pointer inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    accept=".fasta,.fa,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sequence Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {pdbData ? 'Sequence loaded from PDB:' : 'Or paste your protein sequence:'}
                </label>
                <textarea
                  value={sequence}
                  onChange={handleSequenceChange}
                  placeholder={pdbData ? "Sequence loaded from PDB..." : "Enter protein sequence (single letter code)..."}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  readOnly={!!pdbData}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {sequence.length} characters
                  </span>
                  <span className="text-sm text-gray-500">
                    {sequence.length > 0 ? Math.ceil(sequence.length / 3) : 0} amino acids
                  </span>
                </div>
                {pdbData && (
                  <div className="mt-2 text-sm text-blue-600">
                    ✓ Sequence automatically loaded from PDB structure
                  </div>
                )}
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Sequence Validation Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                  
                  {/* Suggestions */}
                  {validationSuggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Suggestions:</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {validationSuggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                      
                      {/* Convert DNA to Protein Button */}
                      {validationSuggestions.some(s => s.includes('Convert DNA to protein')) && (
                        <button
                          onClick={handleConvertDNAtoProtein}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Convert DNA to Protein Sequence
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSequenceSubmit}
                disabled={!sequence.trim() || isAnalyzing || validationErrors.length > 0}
                className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Predict Structure
                  </>
                )}
              </button>
            </GlassCard>

            {/* Sequence Analysis */}
            {sequenceAnalysis && (
              <GlassCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="w-6 h-6 text-blue-500 mr-2" />
                  Sequence Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Length:</span>
                    <span className="font-medium text-gray-900">{sequenceAnalysis.length} residues</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Molecular Weight:</span>
                    <span className="font-medium text-gray-900">{Math.round(sequenceAnalysis.molecularWeight)} Da</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Isoelectric Point:</span>
                    <span className="font-medium text-gray-900">{sequenceAnalysis.isoelectricPoint.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hydrophobicity:</span>
                    <span className="font-medium text-gray-900">{sequenceAnalysis.hydrophobicity.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Secondary Structure Prediction:</h4>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Helix: {sequenceAnalysis.secondaryStructurePrediction.helix}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>Sheet: {sequenceAnalysis.secondaryStructurePrediction.sheet}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Coil: {sequenceAnalysis.secondaryStructurePrediction.coil}%</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Prediction Status */}
            {(result || isAnalyzing) && (
              <GlassCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Prediction Status</h3>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="text-gray-900">{Math.round(predictionProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${predictionProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{predictionStep}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center">
                      {isAnalyzing && (
                        <>
                          <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="text-yellow-600">Processing</span>
                        </>
                      )}
                      {result && result.status === 'completed' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-green-600">Completed</span>
                        </>
                      )}
                      {result && result.status === 'failed' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          <span className="text-red-600">Error</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {result && result.status === 'completed' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className={`font-semibold ${getConfidenceColor(result?.confidence || 0)}`}>
                          {(result?.confidence || 0).toFixed(1)}% ({getConfidenceLabel(result?.confidence || 0)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="text-gray-900">{result?.metadata?.predictionMethod || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Model Version:</span>
                        <span className="text-gray-900">{result?.metadata?.modelVersion || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="text-gray-900">{result?.metadata?.processingTime || 0}s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Timestamp:</span>
                        <span className="text-gray-900">
                          {result?.timestamp ? new Date(result.timestamp).toLocaleString() : 'Unknown'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result && result.status === 'completed' && (
              <>
                {/* Confidence Visualization */}
                <GlassCard>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Confidence Score</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall Confidence:</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                          <div 
                            className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                            style={{ width: `${result?.confidence || 0}%` }}
                          />
                        </div>
                        <span className={`font-semibold ${getConfidenceColor(result?.confidence || 0)}`}>
                          {(result?.confidence || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Confidence levels:</p>
                      <ul className="mt-2 space-y-1">
                        <li className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          Very High (90-100%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          High (70-89%)
                        </li>
                        <li className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          Low (0-69%)
                        </li>
                      </ul>
                    </div>
                  </div>
                </GlassCard>

                {/* PLDDT Scores */}
                <GlassCard>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Per-Residue Confidence (PLDDT)</h3>
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 rounded-lg p-4 overflow-x-auto">
                      <div className="flex h-full items-end space-x-1">
                        {result?.plddt?.map((score, index) => (
                          <div
                            key={index}
                            className="flex-1 min-w-[2px]"
                            style={{
                              height: `${score}%`,
                              backgroundColor: score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'
                            }}
                            title={`Residue ${index + 1}: ${score.toFixed(1)}%`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>PLDDT scores indicate confidence for each residue position</p>
                    </div>
                  </div>
                </GlassCard>

                {/* 3D Structure Viewer */}
                {predictedPDBData && (
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">3D Structure</h3>
                      <div className="flex items-center gap-2">
                        {/* View Mode Selector */}
                        <select
                          value={viewMode}
                          onChange={(e) => setViewMode(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="ribbon">Ribbon</option>
                          <option value="atoms">Atoms</option>
                          <option value="bonds">Bonds</option>
                          <option value="all">All</option>
                          <option value="surface">Surface</option>
                        </select>
                        
                        {/* Animation Controls */}
                        <button
                          onClick={handlePlayPause}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleReset}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Reset View"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <ProteinStructure3D
                      ref={proteinViewerRef}
                      pdbData={predictedPDBData}
                      pdbId={result?.jobId || 'predicted'}
                      style={getViewerStyle(viewMode)}
                      autoRotate={isPlaying}
                    />
                  </GlassCard>
                )}

                {/* Download Options */}
                <GlassCard>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Download Results</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const blob = new Blob([predictedPDBData || ''], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `predicted_${result?.jobId || 'structure'}.pdb`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-glass-white hover:bg-glass-white-strong transition-colors"
                    >
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-3" />
                        <span>PDB Structure File</span>
                      </div>
                      <span className="text-sm text-gray-500">.pdb</span>
                    </button>
                    <button 
                      onClick={() => {
                        const jsonData = {
                          jobId: result?.jobId || 'unknown',
                          confidence: result?.confidence || 0,
                          plddt: result?.plddt || [],
                          metadata: result?.metadata || {},
                          timestamp: result?.timestamp || new Date().toISOString()
                        }
                        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `prediction_${result?.jobId || 'structure'}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-glass-white hover:bg-glass-white-strong transition-colors"
                    >
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-3" />
                        <span>Confidence Scores</span>
                      </div>
                      <span className="text-sm text-gray-500">.json</span>
                    </button>
                  </div>
                </GlassCard>
              </>
            )}

            {/* Sample Results - Enhanced for DNA sequences */}
            {!result && (
              <GlassCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Sample Prediction</h3>
                <div className="space-y-4">
                  {/* Show sample for DNA sequences */}
                  {showSamplePrediction && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">DNA Sequence Detected</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Your input appears to be a DNA sequence. Here's what a protein structure prediction would look like:
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Sample Protein:</span>
                          <span className="text-blue-900 font-medium">Insulin (Converted from DNA)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Confidence:</span>
                          <span className="text-green-600 font-semibold">87.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Residues:</span>
                          <span className="text-blue-900">51</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Method:</span>
                          <span className="text-blue-900">AlphaFold Database</span>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                        💡 <strong>Tip:</strong> Click "Convert DNA to Protein Sequence" to see your actual prediction!
                      </div>
                    </div>
                  )}
                  
                  {/* Default sample */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {pdbData ? `Example: ${pdbData.entry.struct.title}` : 'Example: Insulin Protein'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="text-green-600 font-semibold">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Residues:</span>
                        <span className="text-gray-900">
                          {pdbData ? pdbData.polymerEntities[0]?.entity_poly?.pdbx_seq_one_letter_code?.length || 'N/A' : '51'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="text-gray-900">
                          {pdbData ? pdbData.entry.exptl[0]?.method || 'N/A' : 'X-RAY DIFFRACTION'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {showSamplePrediction
                      ? 'Convert your DNA sequence to protein to see the actual prediction results.'
                      : pdbData 
                        ? `Structure ${pdbData.entry.rcsb_id} loaded. Click "Predict Structure" to analyze.`
                        : 'Load a PDB structure or upload your protein sequence to get started with structure prediction.'
                    }
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlphaFoldPredictor
