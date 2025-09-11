import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Cylinder, Text } from '@react-three/drei'
import * as THREE from 'three'

interface DNAHelixProps {
  pdbId?: string
  showLabels?: boolean
  autoRotate?: boolean
}

const DNAHelix: React.FC<DNAHelixProps> = ({ pdbId = "4HHB", showLabels = true, autoRotate = true }) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  // Generate DNA double helix structure
  const generateDNAStructure = () => {
    const points = []
    const bonds = []
    const basePairs = []
    
    const radius = 1.5
    const height = 8
    const turns = 2
    const pointsPerTurn = 20
    const totalPoints = turns * pointsPerTurn

    // Generate backbone points for both strands
    for (let i = 0; i < totalPoints; i++) {
      const t = (i / totalPoints) * height
      const angle1 = (i / totalPoints) * turns * Math.PI * 2
      const angle2 = angle1 + Math.PI // Second strand is 180° offset
      
      // First strand (blue)
      const x1 = Math.cos(angle1) * radius
      const z1 = Math.sin(angle1) * radius
      points.push({
        position: [x1, t - height/2, z1],
        type: 'backbone1',
        id: i
      })
      
      // Second strand (blue)
      const x2 = Math.cos(angle2) * radius
      const z2 = Math.sin(angle2) * radius
      points.push({
        position: [x2, t - height/2, z2],
        type: 'backbone2',
        id: i + totalPoints
      })
      
      // Base pairs (red dots)
      if (i % 2 === 0) {
        basePairs.push({
          position: [(x1 + x2) / 2, t - height/2, (z1 + z2) / 2],
          type: 'basepair',
          id: i
        })
      }
    }

    // Generate backbone bonds
    for (let i = 0; i < totalPoints - 1; i++) {
      // First strand bonds
      bonds.push({
        start: points[i].position,
        end: points[i + 1].position,
        type: 'backbone',
        id: i
      })
      
      // Second strand bonds
      bonds.push({
        start: points[i + totalPoints].position,
        end: points[i + totalPoints + 1].position,
        type: 'backbone',
        id: i + totalPoints
      })
    }

      // Generate base pair bonds
      for (let i = 0; i < basePairs.length; i++) {
        const strand1Index = i * 2
        const strand2Index = i * 2 + totalPoints
      
      if (strand1Index < points.length && strand2Index < points.length) {
        bonds.push({
          start: points[strand1Index].position,
          end: points[strand2Index].position,
          type: 'basepair',
          id: i + totalPoints * 2
        })
      }
    }

    return { points, bonds, basePairs }
  }

  const { points, bonds, basePairs } = generateDNAStructure()

  return (
    <group ref={groupRef}>
      {/* Backbone atoms */}
      {points.map((point) => (
        <Sphere
          key={point.id}
          position={point.position as [number, number, number]}
          args={[0.08, 12, 12]}
        >
          <meshStandardMaterial
            color={point.type.includes('backbone') ? '#1e40af' : '#ef4444'}
            metalness={0.1}
            roughness={0.2}
          />
        </Sphere>
      ))}

      {/* Base pair atoms */}
      {basePairs.map((bp) => (
        <Sphere
          key={bp.id}
          position={bp.position as [number, number, number]}
          args={[0.06, 12, 12]}
        >
          <meshStandardMaterial
            color="#ef4444"
            metalness={0.1}
            roughness={0.2}
          />
        </Sphere>
      ))}

      {/* Backbone bonds */}
      {bonds.filter(bond => bond.type === 'backbone').map((bond) => {
        const start = new THREE.Vector3(...bond.start)
        const end = new THREE.Vector3(...bond.end)
        const distance = start.distanceTo(end)
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        
        return (
          <Cylinder
            key={bond.id}
            position={[midpoint.x, midpoint.y, midpoint.z]}
            args={[0.02, 0.02, distance]}
            rotation={[
              Math.atan2(end.z - start.z, end.y - start.y),
              Math.atan2(end.x - start.x, Math.sqrt((end.y - start.y) ** 2 + (end.z - start.z) ** 2)),
              0
            ]}
          >
            <meshStandardMaterial
              color="#1e40af"
              metalness={0.1}
              roughness={0.3}
            />
          </Cylinder>
        )
      })}

      {/* Base pair bonds */}
      {bonds.filter(bond => bond.type === 'basepair').map((bond) => {
        const start = new THREE.Vector3(...bond.start)
        const end = new THREE.Vector3(...bond.end)
        const distance = start.distanceTo(end)
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        
        return (
          <Cylinder
            key={bond.id}
            position={[midpoint.x, midpoint.y, midpoint.z]}
            args={[0.015, 0.015, distance]}
            rotation={[
              Math.atan2(end.z - start.z, end.y - start.y),
              Math.atan2(end.x - start.x, Math.sqrt((end.y - start.y) ** 2 + (end.z - start.z) ** 2)),
              0
            ]}
          >
            <meshStandardMaterial
              color="#64748b"
              metalness={0.1}
              roughness={0.3}
            />
          </Cylinder>
        )
      })}

      {/* PDB Label */}
      {showLabels && (
        <Text
          position={[-2, 0, 0]}
          fontSize={0.5}
          color="#374151"
          anchorX="left"
          anchorY="middle"
        >
          PDB: {pdbId}
        </Text>
      )}
    </group>
  )
}

export default DNAHelix
