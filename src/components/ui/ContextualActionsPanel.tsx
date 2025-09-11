import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitCompare, 
  BarChart3, 
  Download, 
  FileText, 
  Share2, 
  Eye, 
  TrendingUp,
  X,
  Check,
  AlertCircle,
  Info
} from 'lucide-react'
import { WorkflowIntegrationService } from '../../services/workflowIntegration'
import { GeminiPDBIntegration, ComparisonInsight } from '../../services/geminiPDBIntegration'

interface ContextualActionsPanelProps {
  selectedStructures: string[]
  onClearSelection: () => void
  onExportResults?: (format: 'json' | 'csv' | 'pdb') => void
  onShareResults?: () => void
  className?: string
}

interface BatchAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  description: string
  action: () => void
  disabled?: boolean
  requiresCount?: number
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
}

const ContextualActionsPanel: React.FC<ContextualActionsPanelProps> = ({
  selectedStructures,
  onClearSelection,
  onExportResults,
  className = ''
}) => {
  const [showComparisonInsights, setShowComparisonInsights] = useState(false)
  const [comparisonInsights, setComparisonInsights] = useState<ComparisonInsight | null>(null)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

  const selectedCount = selectedStructures.length

  // Generate comparison insights
  const generateComparisonInsights = async () => {
    if (selectedCount < 2) return

    setIsGeneratingInsights(true)
    try {
      // Create mock structure data for comparison
      const mockStructures = selectedStructures.map(pdbId => ({
        pdbId,
        title: `Structure ${pdbId}`,
        method: 'X-RAY DIFFRACTION',
        resolution: Math.random() * 3 + 1,
        organism: 'Homo sapiens',
        keywords: ['protein', 'structure']
      }))

      const insights = await GeminiPDBIntegration.compareStructures(mockStructures)
      setComparisonInsights(insights)
      setShowComparisonInsights(true)
    } catch (error) {
      console.error('Failed to generate comparison insights:', error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  // Batch actions configuration
  const batchActions: BatchAction[] = [
    {
      id: 'compare',
      label: 'Compare Structures',
      icon: GitCompare,
      description: 'Compare selected structures for similarities and differences',
      action: () => {
        if (selectedCount >= 2) {
          WorkflowIntegrationService.createComparisonSession(selectedStructures, 'structural')
        }
      },
      requiresCount: 2,
      color: 'purple'
    },
    {
      id: 'analyze',
      label: 'Batch AI Analysis',
      icon: BarChart3,
      description: 'Analyze all selected structures with AI',
      action: () => {
        // Navigate to analysis with multiple structures
        WorkflowIntegrationService.createAnalysisSession(
          selectedStructures[0], 
          'stability', 
          { batchStructures: selectedStructures }
        )
      },
      color: 'green'
    },
  // ...existing code...
    {
      id: 'view-3d',
      label: 'View in 3D',
      icon: Eye,
      description: 'Open 3D viewer with selected structures',
      action: () => {
        // Open 3D viewer with first structure, others in comparison mode
        WorkflowIntegrationService.navigateTo3DViewer(selectedStructures[0], 'batch-action')
      },
      color: 'blue'
    },
    {
      id: 'alphafold',
      label: 'AlphaFold Prediction',
      icon: TrendingUp,
      description: 'Generate AlphaFold predictions for selected structures',
      action: () => {
        WorkflowIntegrationService.navigateToAlphaFold(selectedStructures[0], 'batch-action')
      },
      color: 'green'
    },
    {
      id: 'download',
      label: 'Download PDB Files',
      icon: Download,
      description: 'Download PDB files for all selected structures',
      action: () => {
        selectedStructures.forEach(pdbId => {
          window.open(`https://files.rcsb.org/download/${pdbId}.pdb`, '_blank')
        })
      },
      color: 'gray'
    }
  ]

  // Export actions
  const exportActions = [
    {
      id: 'json',
      label: 'Export as JSON',
      description: 'Export results in JSON format',
      action: () => {
        onExportResults?.('json')
        setShowExportOptions(false)
      }
    },
    {
      id: 'csv',
      label: 'Export as CSV',
      description: 'Export results in CSV format',
      action: () => {
        onExportResults?.('csv')
        setShowExportOptions(false)
      }
    },
    {
      id: 'pdb',
      label: 'Export PDB List',
      description: 'Export list of PDB IDs',
      action: () => {
        onExportResults?.('pdb')
        setShowExportOptions(false)
      }
    }
  ]

  // Share actions
  const shareActions = [
    {
      id: 'link',
      label: 'Copy Share Link',
      description: 'Copy a shareable link to these results',
      action: () => {
        const shareUrl = `${window.location.origin}/search?pdb=${selectedStructures.join(',')}`
        navigator.clipboard.writeText(shareUrl)
        setShowShareOptions(false)
      }
    },
    {
      id: 'embed',
      label: 'Generate Embed Code',
      description: 'Generate embed code for these results',
      action: () => {
        const embedCode = `<iframe src="${window.location.origin}/embed/search?pdb=${selectedStructures.join(',')}" width="800" height="600"></iframe>`
        navigator.clipboard.writeText(embedCode)
        setShowShareOptions(false)
      }
    }
  ]

  // Get action color classes
  const getActionColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500 hover:bg-blue-600 text-white',
      green: 'bg-green-500 hover:bg-green-600 text-white',
      purple: 'bg-purple-500 hover:bg-purple-600 text-white',
      orange: 'bg-orange-500 hover:bg-orange-600 text-white',
      red: 'bg-red-500 hover:bg-red-600 text-white',
      gray: 'bg-gray-500 hover:bg-gray-600 text-white'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  if (selectedCount === 0) {
    return null
  }

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        className={`bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${className}`}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-500" />
          <span className="font-medium text-gray-900">
            {selectedCount} structure{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={onClearSelection}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {batchActions.map((action) => {
          const Icon = action.icon
          const isDisabled = action.disabled || (action.requiresCount && selectedCount < action.requiresCount)
          
          return (
            <button
              key={action.id}
              onClick={action.action}
              disabled={Boolean(isDisabled)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center space-y-1 ${
                isDisabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : getActionColorClasses(action.color || 'gray')
              }`}
              title={action.description}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Advanced Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Comparison Insights */}
        {selectedCount >= 2 && (
          <button
            onClick={generateComparisonInsights}
            disabled={isGeneratingInsights}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span>
              {isGeneratingInsights ? 'Generating...' : 'Get AI Insights'}
            </span>
          </button>
        )}

        {/* Export Options */}
        <div className="relative">
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Export</span>
          </button>

          <AnimatePresence>
            {showExportOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48"
              >
                <div className="py-1">
                  {exportActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Share Options */}
        <div className="relative">
          <button
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <AnimatePresence>
            {showShareOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48"
              >
                <div className="py-1">
                  {shareActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Comparison Insights Modal */}
      <AnimatePresence>
        {showComparisonInsights && comparisonInsights && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComparisonInsights(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Comparison Insights
                  </h3>
                  <button
                    onClick={() => setShowComparisonInsights(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Comparing {selectedCount} structures: {selectedStructures.join(', ')}
                </p>
                {/* Similarities */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Key Similarities
                  </h4>
                  <ul className="space-y-1">
                    {comparisonInsights.similarities.map((similarity: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {similarity}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Differences */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                    Key Differences
                  </h4>
                  <ul className="space-y-1">
                    {comparisonInsights.differences.map((difference: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {difference}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Functional Implications */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Info className="w-4 h-4 text-blue-500 mr-2" />
                    Functional Implications
                  </h4>
                  <ul className="space-y-1">
                    {comparisonInsights.functionalImplications.map((implication: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {implication}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Research Opportunities */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-2" />
                    Research Opportunities
                  </h4>
                  <ul className="space-y-1">
                    {comparisonInsights.researchOpportunities.map((opportunity: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  onClick={() => setShowComparisonInsights(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    WorkflowIntegrationService.createComparisonSession(selectedStructures, 'structural')
                    setShowComparisonInsights(false)
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Open Comparison Tool
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ContextualActionsPanel;
