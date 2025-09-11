import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Download, Upload } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { PDBApiService, PDBStructureData } from '../../services/pdbApi';
import { useApi } from '../../hooks/useApi';
import ProteinStructure3D from './ProteinStructure3D';
import SecondaryStructureInfo from './SecondaryStructureInfo';
import ProteinStructureInfo from './ProteinStructureInfo';
import GeminiAssistant from '../ui/GeminiAssistant';

const MolecularViewer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState('ribbon')

  // Mapping mode ke style string 3Dmol.js
  const getViewerStyle = (mode: string) => {
    switch (mode) {
      case 'ribbon':
        return 'ribbon+stick';
      case 'atoms':
        return 'sphere';
      case 'bonds':
        return 'stick';
      case 'all':
        return 'sphere+stick';
      case 'surface':
        return 'surface';
      default:
        return 'ribbon+stick';
    }
  }
  const [pdbId, setPdbId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  // Removed unused searchResults state
  const [searchResultDetails, setSearchResultDetails] = useState<{ pdbId: string; title: string }[]>([])
  const [pdbData, setPdbData] = useState<PDBStructureData | null>(null)
  const [pdbString, setPdbString] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const proteinViewerRef = useRef<any>(null)

  const { execute: loadStructure } = useApi<PDBStructureData>()

  // Handle URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const pdbParam = urlParams.get('pdb')
    const sessionParam = urlParams.get('session')
    const sourceParam = urlParams.get('source')
    
    if (pdbParam) {
      console.log('Loading PDB from URL:', pdbParam, 'Session:', sessionParam, 'Source:', sourceParam)
      setPdbId(pdbParam.toUpperCase())
      handleLoadStructure(pdbParam.toUpperCase())
    }
  }, [])

  const handlePlayPause = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (proteinViewerRef.current && proteinViewerRef.current.setSpin) {
        proteinViewerRef.current.setSpin(next);
      }
      return next;
    });
  }

  const handleReset = () => {
    if (proteinViewerRef.current && proteinViewerRef.current.zoomTo) {
      proteinViewerRef.current.zoomTo();
    } else {
      window.location.reload();
    }
  }

  const handleExport = () => {
    if (pdbId) {
      const pdbUrl = PDBApiService.getPDBFileUrl(pdbId)
      window.open(pdbUrl, '_blank')
    }
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPdbString(content);
      };
      reader.readAsText(file);
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const results = await PDBApiService.searchStructures(searchQuery)
      if (results.length > 0) {
        setSearchResultDetails(results)
      } else {
        setSearchResultDetails([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadStructure = async (selectedPdbId: string) => {
    setPdbId(selectedPdbId)
    setError(null)
    setIsLoading(true)

    try {
      console.log('Loading structure:', selectedPdbId)
      const structureData = await loadStructure(() => 
        PDBApiService.getCompleteStructureData(selectedPdbId)
      )
      if (structureData) {
        setPdbData(structureData)
        console.log('Structure data loaded:', structureData)
        
        // Fetch PDB string from RCSB
        const pdbUrl = PDBApiService.getPDBFileUrl(selectedPdbId)
        console.log('Fetching PDB string from:', pdbUrl)
        const response = await fetch(pdbUrl)
        if (response.ok) {
          const pdbText = await response.text()
          setPdbString(pdbText)
          console.log('PDB string loaded, length:', pdbText.length)
        } else {
          console.error('Failed to fetch PDB string:', response.status)
          setPdbString(null)
        }
      }
    } catch (err) {
      console.error('Error loading structure:', err)
      setError(err instanceof Error ? err.message : 'Failed to load structure')
      setPdbString(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePdbIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pdbId.trim()) {
      handleLoadStructure(pdbId.trim().toUpperCase())
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3D Molecular Viewer</h1>
          <p className="text-gray-600">Interactive 3D visualization of protein structures with advanced analysis tools</p>
        </motion.div>

        {/* Gemini AI Assistant */}
        <div className="max-w-4xl mx-auto mb-8">
          <GeminiAssistant
            feature="3dviewer"
            placeholder="Ask about this 3D structure, molecular features, or visualization..."
            compact={false}
          />
        </div>

        {/* PDB Search and Load Section */}
        <div className="mb-6">
          <GlassCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDB ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load PDB Structure
                </label>
                <form onSubmit={handlePdbIdSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={pdbId}
                    onChange={(e) => setPdbId(e.target.value.toUpperCase())}
                    placeholder="Enter PDB ID (e.g., 1CRN)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load'}
                  </button>
                </form>
              </div>

              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Structures
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or keyword"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? '...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results & Error */}
            {error && (
              <div className="mt-4 text-red-600 text-sm">{error}</div>
            )}
            {searchResultDetails.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Results:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResultDetails.map(({ pdbId, title }) => (
                    <button
                      key={pdbId}
                      onClick={() => handleLoadStructure(pdbId)}
                      className="p-2 text-left bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span className="font-mono text-blue-700">{pdbId}</span>
                      <span className="block text-xs text-gray-700 mt-1">{title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDB File
              </label>
              <input
                type="file"
                accept=".pdb"
                onChange={handleUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          </GlassCard>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <GlassCard>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* 3D Viewer */}
        {pdbString && (
          <div className="mb-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {pdbId ? `Structure: ${pdbId}` : '3D Structure Viewer'}
                </h3>
                <div className="flex items-center gap-2">
                  {/* View Mode Controls */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {['ribbon', 'atoms', 'bonds', 'all', 'surface'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          viewMode === mode
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Animation Controls */}
                  <div className="flex items-center gap-2">
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
                    <button
                      onClick={handleExport}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Download PDB"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <ProteinStructure3D
                ref={proteinViewerRef}
                pdbData={pdbString}
                pdbId={pdbId}
                style={getViewerStyle(viewMode)}
                autoRotate={isPlaying}
              />
            </GlassCard>
          </div>
        )}

        {/* Structure Information */}
        {pdbData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProteinStructureInfo pdbData={pdbData} pdbId={pdbId} viewMode={viewMode} />
            <SecondaryStructureInfo pdbData={pdbData} pdbId={pdbId} />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6">
            <GlassCard>
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading structure data...</p>
              </div>
            </GlassCard>
          </div>
        )}

        {/* No Structure Loaded */}
        {!pdbString && !isLoading && !error && (
          <div className="mb-6">
            <GlassCard>
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Upload className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Structure Loaded</h3>
                <p className="text-gray-600 mb-4">
                  Enter a PDB ID, search for structures, or upload a PDB file to get started.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleLoadStructure('1CRN')}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Load Example (1CRN)
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default MolecularViewer;