import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Download, 
  BarChart3, 
  FlaskConical, 
  GitCompare, 
  Star, 
  Calendar, 
  User, 
  Tag, 
  Activity,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  TrendingUp
} from 'lucide-react'
import { SearchResult } from '../../services/enhancedPDBSearch'
import { WorkflowIntegrationService } from '../../services/workflowIntegration'

interface StructureCardProps {
  structure: SearchResult
  onView3D?: (pdbId: string) => void
  onAnalyze?: (pdbId: string) => void
  onCompare?: (pdbId: string) => void
  onDownload?: (pdbId: string) => void
  onAlphaFold?: (pdbId: string) => void
  isSelected?: boolean
  onSelect?: (pdbId: string, selected: boolean) => void
  showSelection?: boolean
  className?: string
}

const StructureCard: React.FC<StructureCardProps> = ({
  structure,
  onView3D,
  onAnalyze,
  onCompare,
  onDownload,
  onAlphaFold,
  isSelected = false,
  onSelect,
  showSelection = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)

  // Handle quick actions
  const handleView3D = () => {
    if (onView3D) {
      onView3D(structure.pdbId)
    } else {
      WorkflowIntegrationService.navigateTo3DViewer(structure.pdbId, 'structure-card')
    }
  }

  const handleAnalyze = () => {
    if (onAnalyze) {
      onAnalyze(structure.pdbId)
    } else {
      WorkflowIntegrationService.navigateToAIAnalysis(structure.pdbId, 'structure-card')
    }
  }

  const handleCompare = () => {
    if (onCompare) {
      onCompare(structure.pdbId)
    } else {
      WorkflowIntegrationService.quickCompareStructures([structure.pdbId])
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(structure.pdbId)
    } else {
      window.open(`https://files.rcsb.org/download/${structure.pdbId}.pdb`, '_blank')
    }
  }


  const handleAlphaFold = () => {
    if (onAlphaFold) {
      onAlphaFold(structure.pdbId)
    } else {
      WorkflowIntegrationService.navigateToAlphaFold(structure.pdbId, 'structure-card')
    }
  }

  // Copy PDB ID to clipboard
  const handleCopyPDBId = async () => {
    try {
      await navigator.clipboard.writeText(structure.pdbId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy PDB ID:', error)
    }
  }

  // Get resolution badge color
  const getResolutionBadgeColor = (resolution?: number) => {
    if (!resolution) return 'bg-gray-100 text-gray-600'
    if (resolution <= 1.5) return 'bg-green-100 text-green-700'
    if (resolution <= 2.5) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Get method icon
  const getMethodIcon = (method: string) => {
    if (method.includes('X-RAY')) return '🔬'
    if (method.includes('NMR')) return '🧲'
    if (method.includes('ELECTRON')) return '🔍'
    return '🧪'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Selection Checkbox */}
            {showSelection && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect?.(structure.pdbId, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            )}

            {/* PDB ID */}
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-bold text-blue-600">
                {structure.pdbId}
              </span>
              <button
                onClick={handleCopyPDBId}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy PDB ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Resolution Badge */}
            {structure.resolution && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResolutionBadgeColor(structure.resolution)}`}>
                {structure.resolution.toFixed(1)} Å
              </span>
            )}

            {/* Method Badge */}
            <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              <span>{getMethodIcon(structure.method)}</span>
              <span>{structure.method}</span>
            </span>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <div className="py-1">
                  <button
                    onClick={handleView3D}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View 3D</span>
                  </button>
                  <button
                    onClick={handleAnalyze}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>AI Analysis</span>
                  </button>
                  <button
                    onClick={handleAlphaFold}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>AlphaFold</span>
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FlaskConical className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDB</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">
          {structure.title}
        </h3>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Structure Image */}
          <div className="lg:col-span-1">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {structure.thumbnail && !imageError ? (
                <img
                  src={structure.thumbnail}
                  alt={`${structure.pdbId} structure`}
                  className={`w-full h-full object-cover transition-opacity duration-200 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={handleView3D}
                  className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {/* Structure Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary */}
            {structure.summary && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {structure.summary}
              </p>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {/* Release Date */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Released:</span>
                <span className="font-medium">{formatDate(structure.releaseDate)}</span>
              </div>

              {/* Organism */}
              {structure.organism && (
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Organism:</span>
                  <span className="font-medium truncate">{structure.organism}</span>
                </div>
              )}

              {/* Authors */}
              {structure.authors && structure.authors.length > 0 && (
                <div className="flex items-center space-x-2 col-span-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Authors:</span>
                  <span className="font-medium truncate">
                    {structure.authors.slice(0, 2).join(', ')}
                    {structure.authors.length > 2 && ` +${structure.authors.length - 2} more`}
                  </span>
                </div>
              )}

              {/* Keywords */}
              {structure.keywords && structure.keywords.length > 0 && (
                <div className="flex items-start space-x-2 col-span-2">
                  <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {structure.keywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                    {structure.keywords.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{structure.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleView3D}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View 3D</span>
              </button>
              
              <button
                onClick={handleAnalyze}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analyze</span>
              </button>
              
              <button
                onClick={handleCompare}
                className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Similarity Score */}
        {structure.similarity && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Similarity Score: {Math.round(structure.similarity.score * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Citation */}
        {structure.citation && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Citation:</span>
              {structure.citation.pmid && (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${structure.citation.pmid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  PubMed: {structure.citation.pmid}
                </a>
              )}
              {structure.citation.doi && (
                <a
                  href={`https://doi.org/${structure.citation.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  DOI: {structure.citation.doi}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StructureCard
