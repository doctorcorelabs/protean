import { useState, useCallback } from 'react'
import { api, ApiError } from '../utils/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await apiCall()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred'
      
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specific hooks for different API endpoints
export function useAlphaFoldPrediction() {
  const { data, loading, error, execute, reset } = useApi()
  
  const predictStructure = useCallback((sequence: string) => {
    return execute(() => api.predictStructure(sequence))
  }, [execute])

  return {
    prediction: data,
    loading,
    error,
    predictStructure,
    reset,
  }
}

export function useProteinAnalysis() {
  const { data, loading, error, execute, reset } = useApi()
  
  const analyzeProtein = useCallback((proteinData: any, analysisType = 'comprehensive') => {
    return execute(() => api.analyzeProtein(proteinData, analysisType))
  }, [execute])

  return {
    analysis: data,
    loading,
    error,
    analyzeProtein,
    reset,
  }
}

export function useLabPlanning() {
  const { data, loading, error, execute, reset } = useApi()
  
  const generatePlan = useCallback((experimentType: string, parameters: any) => {
    return execute(() => api.generateLabPlan(experimentType, parameters))
  }, [execute])

  return {
    plan: data,
    loading,
    error,
    generatePlan,
    reset,
  }
}









