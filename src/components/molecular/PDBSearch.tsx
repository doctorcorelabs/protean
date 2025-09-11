import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Database, Download, Eye, Star, BarChart3 } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { PDBApiService, PDBStructureData } from '../../services/pdbApi'
import { useApi } from '../../hooks/useApi'
import GeminiAssistant from '../ui/GeminiAssistant'
import SmartSearchBar from '../ui/SmartSearchBar'
import StructureCard from '../ui/StructureCard'
import ContextualActionsPanel from '../ui/ContextualActionsPanel'
import { EnhancedPDBSearchService, SearchQuery, SearchResult, AdvancedFilters, BatchSearchResult } from '../../services/enhancedPDBSearch'
import { GeminiPDBIntegration, SearchSuggestion, ResultInsight } from '../../services/geminiPDBIntegration'
import { WorkflowIntegrationService } from '../../services/workflowIntegration'

// Remove duplicate interface - using the one from enhancedPDBSearch

const PDBSearch: React.FC = () => {
  // Enhanced state management
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [batchSearchResult, setBatchSearchResult] = useState<BatchSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStructure, setSelectedStructure] = useState<PDBStructureData | null>(null)
  const [selectedStructures, setSelectedStructures] = useState<string[]>([])
  const [filters, setFilters] = useState<AdvancedFilters>({})
  const [searchInsights, setSearchInsights] = useState<ResultInsight | null>(null)
  const [showInsights, setShowInsights] = useState(false)

  const { execute: loadStructure } = useApi<PDBStructureData>()

  // Popular search state
  const [popularSearchQuery, setPopularSearchQuery] = useState('')
  const [popularSearchResults, setPopularSearchResults] = useState<SearchResult[]>([])

  const handlePopularSearch = async () => {
    if (!popularSearchQuery.trim()) return
    setIsSearching(true)
    setError(null)
    try {
      const result = await EnhancedPDBSearchService.searchStructures({ textQuery: popularSearchQuery, searchMode: 'text' })
      setPopularSearchResults(result.results)
    } catch (err) {
      setError('Failed to search popular structures')
    } finally {
      setIsSearching(false)
    }
  }

  // Initialize workflow integration
  useEffect(() => {
    WorkflowIntegrationService.initialize()
  }, [])

  // Popular structures for quick access
  const popularStructures = [
    { id: '4HHB', name: 'Human Hemoglobin', description: 'DNA double helix structure', category: 'DNA/RNA' },
    { id: '1BNA', name: 'B-DNA', description: 'Standard B-form DNA', category: 'DNA/RNA' },
    { id: '1D23', name: 'DNA Dodecamer', description: 'DNA crystal structure', category: 'DNA/RNA' },
    { id: '1FQ2', name: 'DNA Quadruplex', description: 'G-quadruplex DNA', category: 'DNA/RNA' },
    { id: '1G3X', name: 'DNA Triplex', description: 'Triple helix DNA', category: 'DNA/RNA' },
    { id: '1HHO', name: 'Human Hemoglobin', description: 'Oxygen transport protein', category: 'Protein' },
    { id: '1CRN', name: 'Crambin', description: 'Plant seed protein', category: 'Protein' },
    { id: '1ENH', name: 'Engrailed Homeodomain', description: 'DNA-binding protein', category: 'Protein' },
    { id: '1FKB', name: 'FK506 Binding Protein', description: 'Immunosuppressive drug target', category: 'Protein' },
    { id: '1GFL', name: 'Green Fluorescent Protein', description: 'Fluorescent marker', category: 'Protein' },
    { id: '1IGD', name: 'Immunoglobulin', description: 'Antibody fragment', category: 'Protein' },
    { id: '1LMB', name: 'Lysozyme', description: 'Antibacterial enzyme', category: 'Protein' },
    { id: '1MBN', name: 'Myoglobin', description: 'Oxygen storage protein', category: 'Protein' },
    { id: '1PGB', name: 'Protein G B1', description: 'Immunoglobulin binding', category: 'Protein' },
    { id: '1PPT', name: 'Peptidase', description: 'Proteolytic enzyme', category: 'Protein' },
    { id: '5FMB', name: 'Fumarase', description: 'Metabolic enzyme', category: 'Protein' },
    { id: '6L63', name: 'SARS-CoV-2 Spike', description: 'Viral protein', category: 'Protein' },
    { id: '7NHM', name: 'Neurotransmitter', description: 'Neural signaling', category: 'Protein' }
  ]

  // Local type for popularStructures items
  type LocalPopular = { id: string; name: string; description: string; category: string }
  type CombinedStructure = SearchResult | LocalPopular

  const isSearchResult = (s: CombinedStructure): s is SearchResult => {
    return (s as SearchResult).pdbId !== undefined
  }

  const getStructureId = (s: CombinedStructure) => isSearchResult(s) ? s.pdbId : s.id
  const getStructureCategory = (s: CombinedStructure) => isSearchResult(s) ? (s.organism ? 'Protein' : '') : s.category
  const getStructureTitle = (s: CombinedStructure) => isSearchResult(s) ? s.title : s.name
  const getStructureSummary = (s: CombinedStructure) => isSearchResult(s) ? s.summary || '' : s.description

  // Enhanced search handler
  const handleSearch = async (query: SearchQuery) => {
    setIsSearching(true)
    setError(null)
    
    try {
      const result = await EnhancedPDBSearchService.searchStructures(query)
      setBatchSearchResult(result)
      setSearchResults(result.results)
      
      // Show message if no results found for sequence search
      if (query.searchMode === 'sequence' && result.results.length === 0) {
        setError('No protein structures found matching this sequence. Try a shorter sequence or adjust search parameters.')
      }
      
      // Generate AI insights for results
      if (result.results.length > 0) {
        try {
          const insights = await GeminiPDBIntegration.explainSearchResults(
            result.results, 
            query.naturalQuery || query.textQuery || query.sequence || ''
          )
          setSearchInsights(insights)
        } catch (insightError) {
          console.warn('Failed to generate insights:', insightError)
        }
      }
    } catch (err: any) {
      console.error('Search error:', err)
      
      // Show specific error message for sequence search
      if (query.searchMode === 'sequence') {
        setError(`Sequence search failed: ${err.message || 'Unknown error'}. Please check your internet connection and try again.`)
      } else {
        setError(`Search failed: ${err.message || 'Unknown error'}`)
      }
      
      setSearchResults([])
      setBatchSearchResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleLoadStructure = async (pdbId: string) => {
    if (!PDBApiService.validatePDBId(pdbId)) {
      setError('Invalid PDB ID format')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const data = await loadStructure(() => PDBApiService.getCompleteStructureData(pdbId))
      setSelectedStructure(data)
    } catch (err) {
      setError(`Failed to load structure ${pdbId}`)
      setSelectedStructure(null)
    } finally {
      setIsSearching(false)
    }
  }

  // Enhanced handlers
  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    const query: SearchQuery = {
      naturalQuery: suggestion.text,
      searchMode: 'ai'
    }
    await handleSearch(query)
  }

  const handleFiltersChange = (newFilters: AdvancedFilters) => {
    setFilters(newFilters)
  }

  const handleStructureSelect = (pdbId: string, selected: boolean) => {
    if (selected) {
      setSelectedStructures(prev => [...prev, pdbId])
    } else {
      setSelectedStructures(prev => prev.filter(id => id !== pdbId))
    }
  }

  const handleCompareStructure = (pdbId: string) => {
    // Toggle selection for comparison
    const isSelected = selectedStructures.includes(pdbId)
    handleStructureSelect(pdbId, !isSelected)
  }

  const handleClearSelection = () => {
    setSelectedStructures([])
  }

  const handleExportResults = (format: 'json' | 'csv' | 'pdb') => {
    if (selectedStructures.length > 0) {
      const selectedResults = searchResults.filter(r => selectedStructures.includes(r.pdbId))
      WorkflowIntegrationService.exportSearchResults(selectedResults, format)
    } else {
      WorkflowIntegrationService.exportSearchResults(searchResults, format)
    }
  }

  const handleQuickLoad = (pdbId: string) => {
    handleLoadStructure(pdbId)
  }

  // Updated handlers with load structure first, then action
  const handleDownloadPDB = async (pdbId: string) => {
    try {
      // First, load the structure data to show it
      await handleLoadStructure(pdbId)
      
      // Then download the PDB file
      const pdbUrl = PDBApiService.getPDBFileUrl(pdbId)
      window.open(pdbUrl, '_blank')
    } catch (error) {
      console.error('Error loading structure for download:', error)
      // Fallback: just download without showing
      const pdbUrl = PDBApiService.getPDBFileUrl(pdbId)
      window.open(pdbUrl, '_blank')
    }
  }

  const handleViewStructure = async (pdbId: string) => {
    try {
      // First, load the structure data to show it
      await handleLoadStructure(pdbId)
      
      // Small delay to ensure the structure is displayed
      setTimeout(() => {
        // Then navigate to 3D viewer
        WorkflowIntegrationService.navigateTo3DViewer(pdbId, 'pdb-search')
      }, 1000) // 1 second delay to show the structure details
    } catch (error) {
      console.error('Error loading structure for view:', error)
      // Fallback: just navigate without showing
      WorkflowIntegrationService.navigateTo3DViewer(pdbId, 'pdb-search')
    }
  }

  const handleAnalyzeStructure = async (pdbId: string) => {
    try {
      // First, load the structure data to show it
      await handleLoadStructure(pdbId)
      
      // Small delay to ensure the structure is displayed
      setTimeout(() => {
        // Then navigate to AI Analysis
        WorkflowIntegrationService.navigateToAIAnalysis(pdbId, 'pdb-search')
      }, 1000) // 1 second delay to show the structure details
    } catch (error) {
      console.error('Error loading structure for analysis:', error)
      // Fallback: just navigate without showing
      WorkflowIntegrationService.navigateToAIAnalysis(pdbId, 'pdb-search')
    }
  }

  const handleAlphaFold = async (pdbId: string) => {
    try {
      // First, load the structure data to show it
      await handleLoadStructure(pdbId)
      
      // Small delay to ensure the structure is displayed
      setTimeout(() => {
        // Then navigate to AlphaFold
        WorkflowIntegrationService.navigateToAlphaFold(pdbId, 'pdb-search')
      }, 1000) // 1 second delay to show the structure details
    } catch (error) {
      console.error('Error loading structure for AlphaFold:', error)
      // Fallback: just navigate without showing
      WorkflowIntegrationService.navigateToAlphaFold(pdbId, 'pdb-search')
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PDB Structure Search</h1>
          <p className="text-gray-600">Search and explore protein structures from the Protein Data Bank</p>
        </motion.div>

        {/* Gemini AI Assistant */}
        <div className="max-w-4xl mx-auto mb-8">
          <GeminiAssistant
            feature="pdbsearch"
            placeholder="Ask Gemini to find structures, compare proteins, or suggest related structures..."
            compact={false}
          />
        </div>

        {/* Enhanced Search Section */}
        <div className="relative z-10 mb-8">
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="w-6 h-6 text-blue-500 mr-2" />
              Smart Structure Search
            </h3>
            
            <SmartSearchBar
              onSearch={handleSearch}
              onSuggestionClick={handleSuggestionClick}
              onFiltersChange={handleFiltersChange}
              isLoading={isSearching}
              placeholder="Search by protein name, PDB ID, or ask Gemini..."
              showFilters={true}
              initialFilters={filters}
            />

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Popular Structures with Search */}
        <div className="mb-8">
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Popular Structures
            </h3>
            {/* Search input for popular structures */}
            <div className="mb-4 flex space-x-2">
              <input
                type="text"
                value={popularSearchQuery}
                onChange={e => setPopularSearchQuery(e.target.value)}
                placeholder="Search popular structures..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <button
                onClick={handlePopularSearch}
                className="btn-secondary flex items-center"
                disabled={isSearching || !popularSearchQuery.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(popularSearchResults.length > 0 ? popularSearchResults : popularStructures).map((structure: CombinedStructure) => (
                <motion.div
                  key={getStructureId(structure)}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleQuickLoad(getStructureId(structure))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold text-blue-600">
                      {getStructureId(structure)}
                    </span>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        getStructureCategory(structure) === 'DNA/RNA' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getStructureCategory(structure)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewStructure(getStructureId(structure))
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="View in 3D"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadPDB(getStructureId(structure))
                        }}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Download PDB"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{getStructureTitle(structure)}</h4>
                  <p className="text-sm text-gray-600">{getStructureSummary(structure)}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* AI Insights */}
        {searchInsights && (
          <div className="mb-8">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 text-purple-500 mr-2" />
                  AI Search Insights
                </h3>
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showInsights ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              <div className="prose prose-sm max-w-none text-justify">
                <p className="text-gray-700 mb-3">{searchInsights.summary}</p>
                
                {showInsights && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Findings:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {searchInsights.keyFindings.map((finding, index) => (
                          <li key={index}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Related Concepts:</h4>
                      <div className="flex flex-wrap gap-2">
                        {searchInsights.relatedConcepts.map((concept, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Suggested Actions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {searchInsights.suggestedActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Contextual Actions Panel */}
        {selectedStructures.length > 0 && (
          <div className="mb-8">
            <ContextualActionsPanel
              selectedStructures={selectedStructures}
              onClearSelection={handleClearSelection}
              onExportResults={handleExportResults}
            />
          </div>
        )}

        {/* Enhanced Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Search Results ({searchResults.length})
                </h3>
                {batchSearchResult && (
                  <div className="text-sm text-gray-500">
                    Found in {batchSearchResult.searchTime}ms
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchResults.map((result) => (
                  <StructureCard
                    key={result.pdbId}
                    structure={result}
                    onView3D={handleViewStructure}
                    onAnalyze={handleAnalyzeStructure}
                    onCompare={handleCompareStructure}
                    onDownload={handleDownloadPDB}
                    onAlphaFold={handleAlphaFold}
                    isSelected={selectedStructures.includes(result.pdbId)}
                    onSelect={handleStructureSelect}
                    showSelection={true}
                  />
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Selected Structure Details */}
        {selectedStructure && (
          <div className="mb-8">
            <GlassCard>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 text-green-500 mr-2" />
                Structure Details: {selectedStructure.entry.rcsb_id}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="text-gray-900">{selectedStructure.entry.struct.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-gray-900">{selectedStructure.entry.exptl[0]?.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Release Date:</span>
                      <span className="text-gray-900">{selectedStructure.entry.rcsb_accession_info.initial_release_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Authors:</span>
                      <span className="text-gray-900">{selectedStructure.entry.audit_author[0]?.name}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Structure Composition</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Polymer Entities:</span>
                      <span className="text-gray-900">{selectedStructure.polymerEntities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entity Instances:</span>
                      <span className="text-gray-900">{selectedStructure.polymerEntityInstances.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chemical Components:</span>
                      <span className="text-gray-900">{selectedStructure.chemicalComponents.length}</span>
                    </div>
                    {selectedStructure.polymerEntities[0]?.entity_poly?.pdbx_seq_one_letter_code && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sequence Length:</span>
                        <span className="text-gray-900">
                          {selectedStructure.polymerEntities[0].entity_poly.pdbx_seq_one_letter_code.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => handleViewStructure(selectedStructure.entry.rcsb_id)}
                  className="btn-primary flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View in 3D
                </button>
                <button
                  onClick={() => handleDownloadPDB(selectedStructure.entry.rcsb_id)}
                  className="btn-secondary flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDB
                </button>
                <button
                  onClick={() => window.location.href = `/analysis?pdb=${selectedStructure.entry.rcsb_id}`}
                  className="btn-secondary flex items-center"
                >
                  <Database className="w-4 h-4 mr-2" />
                  AI Analysis
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}

export default PDBSearch
