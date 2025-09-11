import React, { useMemo } from 'react'
import { Info, Atom, Link, Database } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { PDBStructureAnalyzer } from '../../services/pdbStructureAnalyzer'

interface ProteinStructureInfoProps {
  pdbData?: any
  pdbId?: string
  viewMode?: string
}

const ProteinStructureInfo: React.FC<ProteinStructureInfoProps> = ({ pdbData, pdbId, viewMode }) => {
  // Analyze PDB data to get real structure information
  const structureAnalysis = useMemo(() => {
    return PDBStructureAnalyzer.analyzeStructure(pdbData)
  }, [pdbData])

  const structureInfo = structureAnalysis.statistics

  const getViewModeDescription = (mode: string) => {
    switch (mode) {
      case 'ribbon':
        return 'Ribbon representation shows the protein backbone as a smooth ribbon with rainbow coloring from N- to C-terminus. Side chains are shown as thin sticks.'
      case 'atoms':
        return 'Space-filling representation showing all atoms as spheres with standard CPK coloring.'
      case 'bonds':
        return 'Stick representation showing all covalent bonds as cylinders connecting atoms.'
      case 'all':
        return 'Combined representation showing both atoms and bonds for detailed analysis.'
      case 'surface':
        return 'Molecular surface representation showing the solvent-accessible surface.'
      default:
        return 'Select a view mode to see the protein structure.'
    }
  }

  return (
    <GlassCard>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Info className="w-5 h-5 text-blue-500 mr-2" />
        Structure Information
      </h3>
      
      {/* Current View Mode */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current View</h4>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900 capitalize">
              {viewMode} Representation
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {getViewModeDescription(viewMode || '')}
          </p>
        </div>
      </div>

      {/* Structure Statistics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Structure Statistics</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Residues:</span>
            <span className="font-medium text-gray-900">{structureInfo.totalResidues}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">α-Helices:</span>
            <span className="font-medium text-red-600">{structureInfo.secondaryStructures.helix.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">β-Sheets:</span>
            <span className="font-medium text-blue-600">{structureInfo.secondaryStructures.sheet.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loops:</span>
            <span className="font-medium text-green-600">{structureInfo.secondaryStructures.loop.count}</span>
          </div>
        </div>
      </div>

      {/* Atom Composition */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Atom className="w-4 h-4 mr-1" />
          Atom Composition
        </h4>
        <div className="space-y-2">
          {Object.entries(structureInfo.atoms).map(([element, count]) => (
            <div key={element} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: element === 'carbon' ? '#808080' :
                                   element === 'nitrogen' ? '#0000FF' :
                                   element === 'oxygen' ? '#FF0000' :
                                   element === 'sulfur' ? '#FFFF00' : '#808080'
                  }}
                ></div>
                <span className="text-sm text-gray-600 capitalize">{element}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bond Information */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Link className="w-4 h-4 mr-1" />
          Bond Information
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Covalent Bonds:</span>
            <span className="font-medium text-gray-900">{structureInfo.bonds.covalent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hydrogen Bonds:</span>
            <span className="font-medium text-gray-900">{structureInfo.bonds.hydrogen}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Disulfide Bonds:</span>
            <span className="font-medium text-yellow-600">{structureInfo.bonds.disulfide}</span>
          </div>
        </div>
      </div>

      {/* PDB Information */}
      {pdbId && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Database className="w-4 h-4 mr-1" />
            PDB Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">PDB ID:</span>
              <span className="font-mono font-medium text-gray-900">{pdbId}</span>
            </div>
            {pdbData && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="text-gray-900 text-right max-w-32 truncate">
                    {pdbData.entry?.struct?.title || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="text-gray-900">
                    {pdbData.entry?.exptl?.[0]?.method || 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </GlassCard>
  )
}

export default ProteinStructureInfo
