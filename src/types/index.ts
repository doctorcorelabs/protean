// Common types for the application

export interface ProteinStructure {
  coordinates: Array<{
    x: number
    y: number
    z: number
    atom: string
    residue: number
  }>
  format: string
  resolution: number
}

export interface AlphaFoldPrediction {
  confidence: number
  structure: ProteinStructure
  plddt: number[]
  timestamp: string
  sequenceLength: number
  aminoAcids: number
  predictedChains: number
}

export interface BindingSite {
  position: number
  confidence: number
  type: 'active' | 'allosteric' | 'regulatory'
  description: string
}

export interface MolecularInteraction {
  type: 'hydrogen_bond' | 'hydrophobic' | 'electrostatic' | 'van_der_waals'
  count: number
  strength: number
}

export interface ProteinAnalysis {
  stability: number
  bindingSites: BindingSite[]
  interactions: MolecularInteraction[]
  recommendations: string[]
  timestamp: string
  analysisType: string
  confidence: number
}

export interface ExperimentStep {
  id: number
  title: string
  description: string
  duration: string
  materials: string[]
  safety: string[]
  status: 'pending' | 'in-progress' | 'completed'
}

export interface Material {
  name: string
  quantity: string
  unit: string
  supplier: string
  cost: number
}

export interface SafetyNote {
  level: 'low' | 'medium' | 'high'
  description: string
  precautions: string[]
}

export interface ExperimentPlan {
  steps: ExperimentStep[]
  materials: Material[]
  timeline: {
    totalDuration: string
    phases: Array<{
      name: string
      duration: string
      steps: number[]
    }>
  }
  safety: SafetyNote[]
  cost: number
  timestamp: string
  experimentType: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface User {
  id: string
  name: string
  email: string
  role: 'researcher' | 'student' | 'admin'
  organization: string
}

export interface Project {
  id: string
  name: string
  description: string
  owner: string
  collaborators: string[]
  createdAt: string
  updatedAt: string
  status: 'active' | 'archived' | 'shared'
}







