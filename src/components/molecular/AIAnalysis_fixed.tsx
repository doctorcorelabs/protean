import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Upload, Download, TrendingUp, CheckCircle, BarChart3, Target, Database, Search } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { PDBApiService, PDBStructureData } from '../../services/pdbApi'
import { useApi } from '../../hooks/useApi'
import GeminiAssistant from '../ui/GeminiAssistant'
import { streamGemini } from '../../services/geminiService'
import { parseGeminiAnalysis } from '../../utils/geminiAnalysisParser'

interface AnalysisResult {
  stability: number
  bindingSites: Array<{
    position: number
    confidence: number
    type: string
  }>
  interactions: Array<{
    type: string
    count: number
    strength: number
  }>
  recommendations: string[]
  timestamp: string
}

// Helper function for rendering citation link
function renderCitation(citation: any) {
  if (citation?.pdbx_database_id_DOI) {
    return <a href={`https://doi.org/${citation.pdbx_database_id_DOI}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">DOI</a>;
  } else if (citation?.pdbx_database_id_PubMed) {
    return <a href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pdbx_database_id_PubMed}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">PubMed</a>;
  } else {
    return 'Unknown';
  }
}

const AIAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [pdbId, setPdbId] = useState('')
  const [pdbData, setPdbData] = useState<PDBStructureData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{pdbId: string, title: string}[]>([])
  const [error, setError] = useState<string | null>(null)

  const { execute: loadStructure } = useApi<PDBStructureData>()

  const handleAnalysis = async () => {
    if (!pdbData) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    let analysisText = '';
    
    try {
      // Fetch metadata dari RCSB PDB REST API
      let rcsbMeta = null;
      try {
        const mod = await import('../../services/rcsbApiService');
        rcsbMeta = await mod.fetchRCSBMetadata(pdbData.entry.rcsb_id);
      } catch (metaErr) {
        console.warn('Failed to fetch RCSB metadata:', metaErr);
      }
      
      // Gabungkan metadata ke prompt Gemini
      const metadataStr = rcsbMeta ? `
Title: ${rcsbMeta.struct?.title || 'Unknown'}
Method: ${rcsbMeta.exptl?.[0]?.method || 'Unknown'}
Sequence: ${rcsbMeta.polymer_entities?.[0]?.entity_poly?.pdbx_seq_one_letter_code || 'Not available'}
Organism: ${rcsbMeta.polymer_entities?.[0]?.rcsb_entity_source_organism?.[0]?.ncbi_scientific_name || 'Unknown'}` : '';
      
      const prompt = `Analyze the following PDB structure: ${pdbData.entry.rcsb_id}.${metadataStr}

Please provide a comprehensive analysis including:

1. **Protein Stability**: Overall stability score (0-100%), thermodynamic considerations, structural integrity assessment
2. **Binding Sites**: Active sites, allosteric sites, drug binding pockets with positions and confidence scores
3. **Molecular Interactions**: Hydrogen bonds, hydrophobic interactions, electrostatic interactions, van der Waals forces
4. **Domain Architecture**: Secondary structure elements, domain organization, motifs and annotations
5. **Mutational Insights**: Critical residues, mutation sensitivity, evolutionary conservation
6. **Experimental Details**: Resolution, pH conditions, temperature, crystallization method
7. **Chemical Components**: Ligands, cofactors, metal ions, chemical formula and molecular weight
8. **Cross-references**: UniProt IDs, GenBank accessions, DrugBank entries, other database links
9. **Recommendations**: Optimization suggestions, experimental approaches, computational predictions

Format your response as valid JSON with the following structure:
{
  "stability": number (0-100),
  "bindingSites": [{"position": number, "confidence": number, "type": string}],
  "interactions": [{"type": string, "count": number, "strength": number}],
  "recommendations": [string],
  "timestamp": "${new Date().toISOString()}"
}`;
      
      await streamGemini('aianalysis', prompt, (chunk) => {
        analysisText += chunk;
      });
      
      const parsedResult = parseGeminiAnalysis(analysisText);
      if (parsedResult) {
        setResult(parsedResult);
      } else {
        setError('Failed to parse AI analysis result');
      }
    } catch (err) {
      setError('Failed to analyze structure with AI');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handlePdbIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdbId.trim()) return;
    
    setError(null);
    try {
      const data = await loadStructure(() => PDBApiService.getCompleteStructureData(pdbId));
      setPdbData(data);
    } catch (err) {
      setError(`Failed to load PDB structure: ${pdbId}`);
    }
  }

  const handleLoadFromPDB = async (selectedPdbId: string) => {
    setError(null);
    try {
      const data = await loadStructure(() => PDBApiService.getCompleteStructureData(selectedPdbId));
      setPdbData(data);
      setPdbId(selectedPdbId);
    } catch (err) {
      setError(`Failed to load PDB structure: ${selectedPdbId}`);
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setError(null);
    try {
      // Mock search results - replace with actual search API
      const mockResults = [
        { pdbId: '1BRS', title: 'Barnase (ribonuclease)' },
        { pdbId: '1CRN', title: 'Crambin' },
        { pdbId: '1UBI', title: 'Ubiquitin' },
        { pdbId: '1LYS', title: 'Lysozyme' },
        { pdbId: '1MBN', title: 'Myoglobin' }
      ].filter(item => 
        item.pdbId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (err) {
      setError('Failed to search structures');
    }
  }

  const getStabilityLabel = (stability: number) => {
    if (stability >= 80) return 'High Stability';
    if (stability >= 60) return 'Medium Stability';
    return 'Low Stability';
  }

  const getStabilityColor = (stability: number) => {
    if (stability >= 80) return 'text-green-600';
    if (stability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'hydrogen_bond': return 'text-blue-500';
      case 'hydrophobic': return 'text-yellow-500';
      case 'electrostatic': return 'text-purple-500';
      case 'van_der_waals': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'binding', label: 'Binding Sites', icon: Target },
    { id: 'interactions', label: 'Interactions', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Brain }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Protein Analysis</h1>
          <p className="text-gray-600">Advanced computational analysis with machine learning insights</p>
        </motion.div>

        {/* Gemini AI Assistant */}
        <div className="max-w-4xl mx-auto mb-8">
          <GeminiAssistant
            feature="aianalysis"
            placeholder="Ask about protein analysis, stability, binding sites, or interactions..."
            compact={false}
          />
        </div>

        {/* PDB Integration Section */}
        <div className="mb-8">
          <GlassCard>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-6 h-6 text-blue-500 mr-2" />
              Load Structure from PDB
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Direct PDB ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter PDB ID for analysis
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.pdbId}
                      onClick={() => handleLoadFromPDB(result.pdbId)}
                      className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="font-medium text-primary-600">{result.pdbId}</div>
                      <div className="text-sm text-gray-600 truncate">{result.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Structure Information & Analysis */}
        {pdbData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Structure Info */}
            <div className="lg:col-span-1">
              <GlassCard>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Structure Info</h3>
                <div className="space-y-3">
                  {/* Basic Info */}
                  <div>
                    <span className="text-sm font-medium text-gray-500">PDB ID:</span>
                    <div className="text-lg font-mono">{pdbData.entry.rcsb_id}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Title:</span>
                    <div className="text-sm">{pdbData.entry.struct?.title}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Method:</span>
                    <div className="text-sm">{pdbData.entry.exptl?.[0]?.method}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Release Date:</span>
                    <div className="text-sm">{new Date(pdbData.entry.rcsb_accession_info?.initial_release_date).toLocaleDateString()}</div>
                  </div>
                  
                  {/* Organism & Authors */}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Organism:</span>
                    <div className="text-sm">{pdbData.polymerEntities?.[0]?.rcsb_entity_source_organism?.[0]?.ncbi_scientific_name || 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Authors:</span>
                    <div className="text-sm">{pdbData.entry.audit_author?.map(a => a.name).join(', ') || 'Unknown'}</div>
                  </div>
                  
                  {/* Citation */}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Citation:</span>
                    <div className="text-sm">{renderCitation(pdbData.entry.rcsb_primary_citation)}</div>
                  </div>
                  
                  {/* Sequence Info */}
                  <div>
                    <span className="text-sm font-medium text-gray-500">Sequence Length:</span>
                    <div className="text-sm">{pdbData.polymerEntities?.[0]?.entity_poly?.pdbx_seq_one_letter_code?.length || 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Sequence:</span>
                    <div className="text-xs font-mono break-all max-h-20 overflow-y-auto">
                      {pdbData.polymerEntities?.[0]?.entity_poly?.pdbx_seq_one_letter_code || 'Unknown'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing}
                  className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze PDB Structure
                    </>
                  )}
                </button>
              </GlassCard>
            </div>

            {/* Analysis Results */}
            <div className="lg:col-span-2">
              {result && (
                <GlassCard>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                    <div className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedTab(tab.id)}
                          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                            selectedTab === tab.id
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {selectedTab === 'overview' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Analysis Overview</h4>
                        
                        {/* Protein Stability */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Protein Stability</span>
                            <span className={`font-semibold ${getStabilityColor(result.stability)}`}>
                              {result.stability.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                result.stability >= 80 ? 'bg-green-500' :
                                result.stability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${result.stability}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm ${getStabilityColor(result.stability)}`}>
                            {getStabilityLabel(result.stability)}
                          </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Binding Sites</h5>
                            <div className="text-2xl font-bold text-blue-600">
                              {result.bindingSites.length}
                            </div>
                            <div className="text-sm text-gray-600">Identified sites</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Total Interactions</h5>
                            <div className="text-2xl font-bold text-green-600">
                              {result.interactions.reduce((sum, interaction) => sum + interaction.count, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Molecular bonds</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'binding' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Binding Sites</h4>
                        {result.bindingSites.length > 0 ? (
                          <div className="space-y-3">
                            {result.bindingSites.map((site, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Position {site.position}</span>
                                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {site.type}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Confidence: {(site.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                  <div
                                    className="bg-blue-500 h-1 rounded-full"
                                    style={{ width: `${site.confidence * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No binding sites identified
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTab === 'interactions' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Molecular Interactions</h4>
                        {result.interactions.length > 0 ? (
                          <div className="space-y-3">
                            {result.interactions.map((interaction, index) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`font-medium ${getInteractionColor(interaction.type)}`}>
                                    {interaction.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                  <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    {interaction.count} bonds
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Strength: {(interaction.strength * 100).toFixed(1)}%
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                  <div
                                    className={`h-1 rounded-full ${
                                      interaction.type === 'hydrogen_bond' ? 'bg-blue-500' :
                                      interaction.type === 'hydrophobic' ? 'bg-yellow-500' :
                                      interaction.type === 'electrostatic' ? 'bg-purple-500' : 'bg-gray-500'
                                    }`}
                                    style={{ width: `${interaction.strength * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No interactions identified
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTab === 'recommendations' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h4>
                        {result.recommendations.length > 0 ? (
                          <div className="space-y-3">
                            {result.recommendations.map((recommendation, index) => (
                              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-700">{recommendation}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No recommendations available
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Export Options */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <button className="btn-secondary flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
                      </button>
                      <button className="btn-secondary flex items-center">
                        <Upload className="w-4 h-4 mr-2" />
                        Share Analysis
                      </button>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAnalysis
