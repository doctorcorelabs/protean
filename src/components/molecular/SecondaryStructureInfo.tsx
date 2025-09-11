import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Square, Circle, Info } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { PDBStructureAnalyzer } from '../../services/pdbStructureAnalyzer'

interface SecondaryStructureInfoProps {
  pdbData?: any
  pdbId?: string
}

const SecondaryStructureInfo: React.FC<SecondaryStructureInfoProps> = ({ pdbData }) => {
  // Analyze PDB data to get real secondary structure information
  const structureAnalysis = useMemo(() => {
    return PDBStructureAnalyzer.analyzeStructure(pdbData)
  }, [pdbData])

  const { statistics, secondaryStructures, composition } = structureAnalysis
  const totalResidues = statistics.totalResidues
  const helixResidues = composition.helixPercentage
  const sheetResidues = composition.sheetPercentage
  const loopResidues = composition.loopPercentage

  // Map secondary structures to display format
  const displayStructures = secondaryStructures.map(structure => ({
    type: structure.type,
    name: structure.name,
    color: structure.color,
    icon: structure.type === 'loop' ? Circle : Square,
    count: structure.count,
    residues: structure.residues,
    description: structure.description
  }))

  return (
    <GlassCard>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Info className="w-5 h-5 text-blue-500 mr-2" />
        Secondary Structure Analysis
      </h3>
      
      {/* Structure Overview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Structure Composition</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Alpha Helix</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{helixResidues}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Beta Sheet</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{sheetResidues}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Loop/Turn</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{loopResidues}%</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div 
              className="bg-red-500" 
              style={{ width: `${helixResidues}%` }}
            ></div>
            <div 
              className="bg-blue-500" 
              style={{ width: `${sheetResidues}%` }}
            ></div>
            <div 
              className="bg-green-500" 
              style={{ width: `${loopResidues}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detailed Structure Information */}
      <div className="space-y-4">
        {displayStructures.map((structure, index) => (
          <motion.div
            key={structure.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <structure.icon className="w-4 h-4" style={{ color: structure.color }} />
                <span className="text-sm font-medium text-gray-900">{structure.name}</span>
              </div>
              <span className="text-xs text-gray-500">{structure.count} segments</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">{structure.description}</p>
            <p className="text-xs text-gray-500">Residues: {structure.residues}</p>
          </motion.div>
        ))}
      </div>

      {/* Structure Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Structure Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Residues:</span>
            <span className="ml-2 font-medium text-gray-900">{totalResidues}</span>
          </div>
          <div>
            <span className="text-gray-600">Structured:</span>
            <span className="ml-2 font-medium text-gray-900">55%</span>
          </div>
          <div>
            <span className="text-gray-600">Flexible:</span>
            <span className="ml-2 font-medium text-gray-900">45%</span>
          </div>
          <div>
            <span className="text-gray-600">Stability:</span>
            <span className="ml-2 font-medium text-green-600">High</span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default SecondaryStructureInfo
