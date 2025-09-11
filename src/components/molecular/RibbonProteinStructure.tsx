import React, { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Cylinder, Text } from '@react-three/drei'
import * as THREE from 'three'
// import { PDBStructureData } from '../../types'

interface RibbonProteinStructureProps {
  pdbData?: any
  pdbId?: string
  showRibbon?: boolean
  showSticks?: boolean
  showAtoms?: boolean
  autoRotate?: boolean
}

const RibbonProteinStructure: React.FC<RibbonProteinStructureProps> = ({ 
  pdbData, 
  pdbId, 
  showRibbon = true,
  showSticks = true,
  showAtoms = false,
  autoRotate = false 
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const [ribbonPoints, setRibbonPoints] = useState<THREE.Vector3[]>([])
  const [sideChains, setSideChains] = useState<any[]>([])
  const [atoms, setAtoms] = useState<any[]>([])

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  // Generate realistic protein ribbon structure
  const generateRibbonStructure = () => {
    if (pdbData && pdbData.polymerEntities.length > 0) {
      const sequence = pdbData.polymerEntities[0].entity_poly?.pdbx_seq_one_letter_code || ''
      return generateFromSequence(sequence)
    } else {
      // Enhanced sample data with realistic protein structure
      const sampleSequence = 'MKVLWAALLVTFLAGCQAKVEQAVETEPEPELRQQTEWQSGQRWELALGRFWDYLRWVQTLSEQVQEELLSSQVTQELRALMDETAQ'
      return generateFromSequence(sampleSequence)
    }
  }

  const generateFromSequence = (sequence: string) => {
    const ribbonPoints: THREE.Vector3[] = []
    const sideChains: any[] = []
    const atoms: any[] = []
    
    // Generate backbone ribbon path
    for (let i = 0; i < Math.min(sequence.length, 100); i++) {
      const t = i / Math.min(sequence.length, 100)
      const angle = t * Math.PI * 8
      const radius = 2.5 + Math.sin(angle * 2) * 0.8 + Math.cos(angle * 3) * 0.4
      const height = t * 12 - 6
      
      let x, y, z
      
      if (i < sequence.length * 0.3) {
        // Alpha helix region - tight spiral
        x = Math.cos(angle) * radius
        y = height + Math.sin(angle * 3.6) * 0.8
        z = Math.sin(angle) * radius
      } else if (i < sequence.length * 0.7) {
        // Beta sheet region - more extended
        const betaAngle = (i - sequence.length * 0.3) / (sequence.length * 0.4) * Math.PI * 3
        x = Math.cos(betaAngle) * (radius + 1.2)
        y = height
        z = Math.sin(betaAngle) * (radius + 1.2)
      } else {
        // Loop region - more random
        const loopAngle = angle + Math.sin(t * Math.PI * 4) * 0.8
        x = Math.cos(loopAngle) * (radius - 0.5)
        y = height + Math.sin(t * Math.PI * 6) * 1.2
        z = Math.sin(loopAngle) * (radius - 0.5)
      }
      
      const point = new THREE.Vector3(x, y, z)
      ribbonPoints.push(point)
      
      // Generate side chains
      if (i % 3 === 0) { // Every 3rd residue has a side chain
        const sideChainLength = 0.8 + Math.random() * 0.4
        const sideChainAngle = Math.random() * Math.PI * 2
        const sideChainHeight = Math.random() * 0.5 - 0.25
        
        const sideChainEnd = new THREE.Vector3(
          x + Math.cos(sideChainAngle) * sideChainLength,
          y + sideChainHeight,
          z + Math.sin(sideChainAngle) * sideChainLength
        )
        
        sideChains.push({
          start: point,
          end: sideChainEnd,
          residue: sequence[i] || 'A',
          id: i
        })
        
        // Add atoms for side chains
        atoms.push({
          position: [sideChainEnd.x, sideChainEnd.y, sideChainEnd.z],
          type: getAtomType(sequence[i]),
          element: sequence[i] || 'C',
          id: `sidechain_${i}`
        })
      }
    }
    
    return { ribbonPoints, sideChains, atoms }
  }

  const getAtomType = (residue: string) => {
    switch (residue) {
      case 'C': return 'carbon'
      case 'N': return 'nitrogen'
      case 'O': return 'oxygen'
      case 'S': return 'sulfur'
      case 'P': return 'phosphorus'
      default: return 'carbon'
    }
  }

  const getAtomColor = (atom: any) => {
    switch (atom.type) {
      case 'carbon': return '#808080' // Grey
      case 'nitrogen': return '#0000FF' // Blue
      case 'oxygen': return '#FF0000' // Red
      case 'sulfur': return '#FFFF00' // Yellow
      case 'phosphorus': return '#FFA500' // Orange
      default: return '#808080'
    }
  }

  const getRibbonColor = (index: number, total: number) => {
    const t = index / total
    // Rainbow gradient from blue to red
    if (t < 0.25) {
      return new THREE.Color().setHSL(0.6 + t * 0.4, 1, 0.5) // Blue to cyan
    } else if (t < 0.5) {
      return new THREE.Color().setHSL(0.3 + (t - 0.25) * 0.4, 1, 0.5) // Cyan to green
    } else if (t < 0.75) {
      return new THREE.Color().setHSL(0.2 + (t - 0.5) * 0.4, 1, 0.5) // Green to yellow
    } else {
      return new THREE.Color().setHSL(0.0 + (t - 0.75) * 0.4, 1, 0.5) // Yellow to red
    }
  }

  useEffect(() => {
    const { ribbonPoints: newRibbonPoints, sideChains: newSideChains, atoms: newAtoms } = generateRibbonStructure()
    setRibbonPoints(newRibbonPoints)
    setSideChains(newSideChains)
    setAtoms(newAtoms)
  }, [pdbData, pdbId])

  return (
    <group ref={groupRef}>
      {/* Ribbon Backbone */}
      {showRibbon && ribbonPoints.map((point, index) => {
        if (index === 0) return null
        
        const prevPoint = ribbonPoints[index - 1]
        const direction = new THREE.Vector3().subVectors(point, prevPoint).normalize()
        const distance = prevPoint.distanceTo(point)
        const midpoint = new THREE.Vector3().addVectors(prevPoint, point).multiplyScalar(0.5)
        
        return (
          <Cylinder
            key={`ribbon_${index}`}
            position={[midpoint.x, midpoint.y, midpoint.z]}
            args={[0.15, 0.15, distance]}
            rotation={[
              Math.atan2(direction.z, direction.y),
              Math.atan2(direction.x, Math.sqrt(direction.y ** 2 + direction.z ** 2)),
              0
            ]}
          >
            <meshStandardMaterial
              color={getRibbonColor(index, ribbonPoints.length)}
              metalness={0.1}
              roughness={0.3}
            />
          </Cylinder>
        )
      })}

      {/* Side Chain Sticks */}
      {showSticks && sideChains.map((sideChain) => {
        const direction = new THREE.Vector3().subVectors(sideChain.end, sideChain.start).normalize()
        const distance = sideChain.start.distanceTo(sideChain.end)
        const midpoint = new THREE.Vector3().addVectors(sideChain.start, sideChain.end).multiplyScalar(0.5)
        
        return (
          <Cylinder
            key={`sidechain_${sideChain.id}`}
            position={[midpoint.x, midpoint.y, midpoint.z]}
            args={[0.02, 0.02, distance]}
            rotation={[
              Math.atan2(direction.z, direction.y),
              Math.atan2(direction.x, Math.sqrt(direction.y ** 2 + direction.z ** 2)),
              0
            ]}
          >
            <meshStandardMaterial
              color="#808080" // Grey for carbon
              metalness={0.1}
              roughness={0.3}
            />
          </Cylinder>
        )
      })}

      {/* Side Chain Atoms */}
      {showAtoms && atoms.map((atom) => (
        <Sphere
          key={atom.id}
          position={atom.position as [number, number, number]}
          args={[0.08, 12, 12]}
        >
          <meshStandardMaterial
            color={getAtomColor(atom)}
            metalness={0.1}
            roughness={0.2}
          />
        </Sphere>
      ))}

      {/* Labels */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.6}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {pdbId ? `PDB: ${pdbId}` : 'Protein Structure'}
      </Text>

      {/* Secondary structure legend */}
      <Text
        position={[-6, 6, 0]}
        fontSize={0.4}
        color="#ef4444"
        anchorX="left"
        anchorY="middle"
      >
        α-Helix
      </Text>
      <Text
        position={[-6, 5.5, 0]}
        fontSize={0.4}
        color="#3b82f6"
        anchorX="left"
        anchorY="middle"
      >
        β-Sheet
      </Text>
      <Text
        position={[-6, 5, 0]}
        fontSize={0.4}
        color="#10b981"
        anchorX="left"
        anchorY="middle"
      >
        Loop
      </Text>
    </group>
  )
}

export default RibbonProteinStructure
