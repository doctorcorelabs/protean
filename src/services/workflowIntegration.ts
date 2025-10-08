// Workflow Integration Service
// Seamless navigation and integration between different features

export interface WorkflowSession {
  id: string
  type: 'search' | 'comparison' | 'analysis' | 'experiment'
  data: any
  timestamp: number
  source: string
}

export interface ComparisonSession {
  id: string
  structures: string[]
  comparisonType: 'structural' | 'functional' | 'evolutionary'
  timestamp: number
}

export interface AnalysisSession {
  id: string
  pdbId: string
  analysisType: 'stability' | 'binding' | 'dynamics' | 'interactions'
  parameters: any
  timestamp: number
}

export interface ExperimentSession {
  id: string
  structures: string[]
  experimentType: 'crystallization' | 'expression' | 'purification' | 'assay'
  parameters: any
  timestamp: number
}

export class WorkflowIntegrationService {
  private static readonly SESSION_PREFIX = 'workflow_session_'
  private static readonly COMPARISON_PREFIX = 'comparison_session_'
  private static readonly ANALYSIS_PREFIX = 'analysis_session_'
  private static readonly EXPERIMENT_PREFIX = 'experiment_session_'
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  // Generate unique session ID
  private static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Direct navigation to other features with context
  static navigateTo3DViewer(pdbId: string, source: string = 'search'): void {
    const sessionId = this.generateSessionId()
    const session: WorkflowSession = {
      id: sessionId,
      type: 'search',
      data: { pdbId, source },
      timestamp: Date.now(),
      source
    }
    
    this.saveSession(session)
    window.location.href = `/viewer?pdb=${pdbId}&session=${sessionId}&source=${source}`
  }

  static navigateToAIAnalysis(pdbId: string, source: string = 'search'): void {
    const sessionId = this.generateSessionId()
    const session: WorkflowSession = {
      id: sessionId,
      type: 'analysis',
      data: { pdbId, source },
      timestamp: Date.now(),
      source
    }
    
    this.saveSession(session)
    window.location.href = `/analysis?pdb=${pdbId}&session=${sessionId}&source=${source}`
  }

  static navigateToAlphaFold(pdbId: string, source: string = 'search'): void {
    const sessionId = this.generateSessionId()
    const session: WorkflowSession = {
      id: sessionId,
      type: 'analysis',
      data: { pdbId, source, analysisType: 'prediction' },
      timestamp: Date.now(),
      source
    }
    
    this.saveSession(session)
    window.location.href = `/alphafold?pdb=${pdbId}&session=${sessionId}&source=${source}`
  }

  static navigateToLabPlanning(pdbId: string, source: string = 'search'): void {
    const sessionId = this.generateSessionId()
    const session: WorkflowSession = {
      id: sessionId,
      type: 'experiment',
      data: { pdbId, source },
      timestamp: Date.now(),
      source
    }
    
    this.saveSession(session)
    window.location.href = `/lab-planning?pdb=${pdbId}&session=${sessionId}&source=${source}`
  }

  // Batch operations with session management
  static createComparisonSession(pdbIds: string[], comparisonType: 'structural' | 'functional' | 'evolutionary' = 'structural'): string {
    const sessionId = this.generateSessionId()
    const session: ComparisonSession = {
      id: sessionId,
      structures: pdbIds,
      comparisonType,
      timestamp: Date.now()
    }
    
    localStorage.setItem(`${this.COMPARISON_PREFIX}${sessionId}`, JSON.stringify(session))
    window.location.href = `/compare?session=${sessionId}&type=${comparisonType}`
    
    return sessionId
  }

  static createAnalysisSession(pdbId: string, analysisType: 'stability' | 'binding' | 'dynamics' | 'interactions', parameters: any = {}): string {
    const sessionId = this.generateSessionId()
    const session: AnalysisSession = {
      id: sessionId,
      pdbId,
      analysisType,
      parameters,
      timestamp: Date.now()
    }
    
    localStorage.setItem(`${this.ANALYSIS_PREFIX}${sessionId}`, JSON.stringify(session))
    window.location.href = `/analysis?pdb=${pdbId}&session=${sessionId}&type=${analysisType}`
    
    return sessionId
  }

  static createExperimentSession(pdbIds: string[], experimentType: 'crystallization' | 'expression' | 'purification' | 'assay', parameters: any = {}): string {
    const sessionId = this.generateSessionId()
    const session: ExperimentSession = {
      id: sessionId,
      structures: pdbIds,
      experimentType,
      parameters,
      timestamp: Date.now()
    }
    
    localStorage.setItem(`${this.EXPERIMENT_PREFIX}${sessionId}`, JSON.stringify(session))
    window.location.href = `/lab-planning?session=${sessionId}&type=${experimentType}`
    
    return sessionId
  }

  // Session management
  static saveSession(session: WorkflowSession): void {
    localStorage.setItem(`${this.SESSION_PREFIX}${session.id}`, JSON.stringify(session))
  }

  static getSession(sessionId: string): WorkflowSession | null {
    try {
      const sessionData = localStorage.getItem(`${this.SESSION_PREFIX}${sessionId}`)
      if (!sessionData) return null
      
      const session = JSON.parse(sessionData) as WorkflowSession
      
      // Check if session is expired
      if (Date.now() - session.timestamp > this.SESSION_DURATION) {
        this.deleteSession(sessionId)
        return null
      }
      
      return session
    } catch (error) {
      console.error('Failed to get session:', error)
      return null
    }
  }

  static getComparisonSession(sessionId: string): ComparisonSession | null {
    try {
      const sessionData = localStorage.getItem(`${this.COMPARISON_PREFIX}${sessionId}`)
      if (!sessionData) return null
      
      const session = JSON.parse(sessionData) as ComparisonSession
      
      // Check if session is expired
      if (Date.now() - session.timestamp > this.SESSION_DURATION) {
        this.deleteComparisonSession(sessionId)
        return null
      }
      
      return session
    } catch (error) {
      console.error('Failed to get comparison session:', error)
      return null
    }
  }

  static getAnalysisSession(sessionId: string): AnalysisSession | null {
    try {
      const sessionData = localStorage.getItem(`${this.ANALYSIS_PREFIX}${sessionId}`)
      if (!sessionData) return null
      
      const session = JSON.parse(sessionData) as AnalysisSession
      
      // Check if session is expired
      if (Date.now() - session.timestamp > this.SESSION_DURATION) {
        this.deleteAnalysisSession(sessionId)
        return null
      }
      
      return session
    } catch (error) {
      console.error('Failed to get analysis session:', error)
      return null
    }
  }

  static getExperimentSession(sessionId: string): ExperimentSession | null {
    try {
      const sessionData = localStorage.getItem(`${this.EXPERIMENT_PREFIX}${sessionId}`)
      if (!sessionData) return null
      
      const session = JSON.parse(sessionData) as ExperimentSession
      
      // Check if session is expired
      if (Date.now() - session.timestamp > this.SESSION_DURATION) {
        this.deleteExperimentSession(sessionId)
        return null
      }
      
      return session
    } catch (error) {
      console.error('Failed to get experiment session:', error)
      return null
    }
  }

  static deleteSession(sessionId: string): void {
    localStorage.removeItem(`${this.SESSION_PREFIX}${sessionId}`)
  }

  static deleteComparisonSession(sessionId: string): void {
    localStorage.removeItem(`${this.COMPARISON_PREFIX}${sessionId}`)
  }

  static deleteAnalysisSession(sessionId: string): void {
    localStorage.removeItem(`${this.ANALYSIS_PREFIX}${sessionId}`)
  }

  static deleteExperimentSession(sessionId: string): void {
    localStorage.removeItem(`${this.EXPERIMENT_PREFIX}${sessionId}`)
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    const now = Date.now()
    
    // Clean up workflow sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.SESSION_PREFIX)) {
        try {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData) as WorkflowSession
            if (now - session.timestamp > this.SESSION_DURATION) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          console.warn('Failed to parse session data:', error)
          localStorage.removeItem(key)
        }
      }
    }
    
    // Clean up comparison sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.COMPARISON_PREFIX)) {
        try {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData) as ComparisonSession
            if (now - session.timestamp > this.SESSION_DURATION) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          console.warn('Failed to parse comparison session data:', error)
          localStorage.removeItem(key)
        }
      }
    }
    
    // Clean up analysis sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.ANALYSIS_PREFIX)) {
        try {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData) as AnalysisSession
            if (now - session.timestamp > this.SESSION_DURATION) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          console.warn('Failed to parse analysis session data:', error)
          localStorage.removeItem(key)
        }
      }
    }
    
    // Clean up experiment sessions
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.EXPERIMENT_PREFIX)) {
        try {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData) as ExperimentSession
            if (now - session.timestamp > this.SESSION_DURATION) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          console.warn('Failed to parse experiment session data:', error)
          localStorage.removeItem(key)
        }
      }
    }
  }

  // Export functionality
  static exportSearchResults(results: any[], format: 'json' | 'csv' | 'pdb' = 'json'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `pdb_search_results_${timestamp}.${format}`
    
    let content: string
    let mimeType: string
    
    switch (format) {
      case 'json':
        content = JSON.stringify(results, null, 2)
        mimeType = 'application/json'
        break
      case 'csv':
        content = this.convertToCSV(results)
        mimeType = 'text/csv'
        break
      case 'pdb':
        content = this.convertToPDBList(results)
        mimeType = 'text/plain'
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static exportComparisonResults(comparisonData: any, format: 'json' | 'csv' = 'json'): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `pdb_comparison_${timestamp}.${format}`
    
    let content: string
    let mimeType: string
    
    switch (format) {
      case 'json':
        content = JSON.stringify(comparisonData, null, 2)
        mimeType = 'application/json'
        break
      case 'csv':
        content = this.convertComparisonToCSV(comparisonData)
        mimeType = 'text/csv'
        break
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
    
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Utility methods for data conversion
  private static convertToCSV(results: any[]): string {
    if (results.length === 0) return ''
    
    const headers = ['PDB ID', 'Title', 'Method', 'Resolution', 'Organism', 'Release Date', 'Authors']
    const csvRows = [headers.join(',')]
    
    results.forEach(result => {
      const row = [
        result.pdbId || '',
        `"${(result.title || '').replace(/"/g, '""')}"`,
        result.method || '',
        result.resolution || '',
        `"${(result.organism || '').replace(/"/g, '""')}"`,
        result.releaseDate || '',
        `"${(result.authors?.join('; ') || '').replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })
    
    return csvRows.join('\n')
  }

  private static convertToPDBList(results: any[]): string {
    return results.map(result => result.pdbId).join('\n')
  }

  private static convertComparisonToCSV(comparisonData: any): string {
    const headers = ['Structure 1', 'Structure 2', 'Similarity Score', 'Key Differences', 'Common Features']
    const csvRows = [headers.join(',')]
    
    if (comparisonData.comparisons) {
      comparisonData.comparisons.forEach((comparison: any) => {
        const row = [
          comparison.structure1 || '',
          comparison.structure2 || '',
          comparison.similarityScore || '',
          `"${(comparison.keyDifferences || '').replace(/"/g, '""')}"`,
          `"${(comparison.commonFeatures || '').replace(/"/g, '""')}"`
        ]
        csvRows.push(row.join(','))
      })
    }
    
    return csvRows.join('\n')
  }

  // Quick actions for common workflows
  static quickAnalyzeStructure(pdbId: string): void {
    this.navigateToAIAnalysis(pdbId, 'quick-action')
  }

  static quickView3D(pdbId: string): void {
    this.navigateTo3DViewer(pdbId, 'quick-action')
  }

  static quickCompareStructures(pdbIds: string[]): void {
    if (pdbIds.length >= 2) {
      this.createComparisonSession(pdbIds)
    }
  }

  static quickPlanExperiment(pdbId: string): void {
    this.navigateToLabPlanning(pdbId, 'quick-action')
  }

  // Get workflow history
  static getWorkflowHistory(): WorkflowSession[] {
    const sessions: WorkflowSession[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.SESSION_PREFIX)) {
        try {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData) as WorkflowSession
            if (Date.now() - session.timestamp <= this.SESSION_DURATION) {
              sessions.push(session)
            }
          }
        } catch (error) {
          console.warn('Failed to parse session data:', error)
        }
      }
    }
    
    return sessions.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Initialize workflow integration
  static initialize(): void {
    // Clean up expired sessions on initialization
    this.cleanupExpiredSessions()
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, 60 * 60 * 1000) // Clean up every hour
  }
}

export default WorkflowIntegrationService





