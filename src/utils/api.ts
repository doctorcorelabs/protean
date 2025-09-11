// API utility functions

const API_BASE_URL = 'https://ai-molecular-research.your-subdomain.workers.dev'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, errorData.error || 'Request failed')
  }
  
  return response.json()
}

export const api = {
  // AlphaFold prediction
  async predictStructure(sequence: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/alphafold-predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence }),
    })
    
    return handleResponse(response)
  },

  // Protein analysis
  async analyzeProtein(proteinData: any, analysisType = 'comprehensive'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/analyze-protein`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proteinData, analysisType }),
    })
    
    return handleResponse(response)
  },

  // Lab planning
  async generateLabPlan(experimentType: string, parameters: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/lab-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ experimentType, parameters }),
    })
    
    return handleResponse(response)
  },

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/health`)
    return handleResponse(response)
  }
}

// Utility functions
export const formatSequence = (sequence: string): string => {
  return sequence.replace(/\s/g, '').toUpperCase()
}

export const validateSequence = (sequence: string): boolean => {
  const validAminoAcids = 'ACDEFGHIKLMNPQRSTVWY'
  const cleanSequence = formatSequence(sequence)
  return cleanSequence.split('').every(aa => validAminoAcids.includes(aa))
}

export const calculateSequenceStats = (sequence: string) => {
  const cleanSequence = formatSequence(sequence)
  const aminoAcidCounts: Record<string, number> = {}
  
  cleanSequence.split('').forEach(aa => {
    aminoAcidCounts[aa] = (aminoAcidCounts[aa] || 0) + 1
  })
  
  return {
    length: cleanSequence.length,
    aminoAcidCounts,
    molecularWeight: cleanSequence.length * 110, // Approximate
    isoelectricPoint: 7.0 // Simplified
  }
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`
  } else {
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`
  }
}

export const formatCost = (cost: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cost)
}
