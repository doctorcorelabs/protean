// Gemini Output Formatter for Linear Display
// Formats Gemini responses based on feature context

export interface GeminiFormatOptions {
  feature: '3dviewer' | 'alphafold' | 'aianalysis' | 'labplanning' | 'pdbsearch'
  maxLength?: number
  showBullets?: boolean
  showHeaders?: boolean
  compactMode?: boolean
}

export interface FormattedSection {
  title?: string
  content: string
  type: 'text' | 'list' | 'code' | 'table' | 'highlight'
  priority: number
}

export class GeminiFormatter {
  private static featureContexts = {
    '3dviewer': {
      title: '3D Structure Analysis',
      icon: '🔬',
      keywords: ['structure', 'protein', 'molecule', '3d', 'visualization', 'pdb', 'crystal'],
      maxSections: 4,
      preferredFormat: 'structured'
    },
    'alphafold': {
      title: 'AlphaFold Prediction',
      icon: '🧬',
      keywords: ['prediction', 'structure', 'confidence', 'plddt', 'sequence', 'folding'],
      maxSections: 5,
      preferredFormat: 'technical'
    },
    'aianalysis': {
      title: 'AI Protein Analysis',
      icon: '🤖',
      keywords: ['analysis', 'stability', 'binding', 'interactions', 'recommendations', 'insights'],
      maxSections: 6,
      preferredFormat: 'analytical'
    },
    'labplanning': {
      title: 'Lab Planning Assistant',
      icon: '🧪',
      keywords: ['protocol', 'experiment', 'materials', 'safety', 'timeline', 'procedure'],
      maxSections: 5,
      preferredFormat: 'procedural'
    },
    'pdbsearch': {
      title: 'PDB Search Results',
      icon: '🔍',
      keywords: ['search', 'structure', 'pdb', 'database', 'protein', 'crystal'],
      maxSections: 4,
      preferredFormat: 'informational'
    },
  // ...existing code...
  }

  /**
   * Format Gemini response based on feature context
   */
  static formatResponse(
    rawResponse: string, 
    options: GeminiFormatOptions
  ): FormattedSection[] {
    const context = this.featureContexts[options.feature]
    const sections = this.parseResponse(rawResponse, context)
    return this.optimizeSections(sections, options)
  }

  /**
   * Parse raw response into structured sections
   */
  private static parseResponse(
    response: string, 
    context: any
  ): FormattedSection[] {
    const sections: FormattedSection[] = []
    const cleanResponse = response.trim()
    const parts = this.splitByDelimiters(cleanResponse)
    parts.forEach((part, index) => {
      const section = this.analyzeSection(part, context, index)
      if (section) {
        sections.push(section)
      }
    })
    return sections
  }

  /**
   * Split response by various delimiters
   */
  private static splitByDelimiters(text: string): string[] {
    // Try different splitting strategies
    const delimiters = [
      /\n\n+/g,           // Double newlines
      /\n(?=\d+\.|\*|\-|\•)/g,  // Numbered/bulleted lists
      /\n(?=[A-Z][a-z]+:)/g,    // Headers with colons
      /\n(?=##|###)/g,          // Markdown headers
      /\n(?=###|##)/g,          // Alternative markdown
    ]
    
    let parts = [text]
    
    for (const delimiter of delimiters) {
      const newParts: string[] = []
      parts.forEach(part => {
        newParts.push(...part.split(delimiter).filter(p => p.trim()))
      })
      parts = newParts
    }
    
    return parts.filter(part => part.trim().length > 10)
  }

  /**
   * Analyze a text section and determine its type and priority
   */
  private static analyzeSection(
    text: string, 
    context: any, 
    index: number
  ): FormattedSection | null {
    const trimmed = text.trim();
    if (trimmed.length < 10) return null
    
    // Determine section type
    let type: FormattedSection['type'] = 'text'
    let title: string | undefined
    let content = trimmed
    let priority = index + 1
    
    // Check for headers
    if (trimmed.match(/^#{1,6}\s+/)) {
      type = 'highlight'
      const lines = trimmed.split('\n')
      title = lines[0].replace(/^#+\s*/, '')
      content = lines.slice(1).join('\n').trim()
      priority = 1
    } else if (trimmed.match(/^[A-Z][a-z\s]+:/)) {
      type = 'highlight'
      const lines = trimmed.split('\n')
      title = lines[0].replace(':', '')
      content = lines.slice(1).join('\n').trim()
      priority = 2
    } else if (trimmed.match(/^\d+\.|\*|\-|\•/)) {
      type = 'list'
      priority = 3
    } else if (trimmed.match(/```|`/)) {
      type = 'code'
      priority = 4
    } else if (trimmed.match(/\|.*\|/)) {
      type = 'table'
      priority = 5
    }
    
    // Adjust priority based on context keywords
    const lowerText = content.toLowerCase()
    const keywordMatches = context.keywords.filter((keyword: string) => 
      lowerText.includes(keyword.toLowerCase())
    ).length
    
    if (keywordMatches > 0) {
      priority = Math.max(1, priority - keywordMatches)
    }
    
    return {
      title,
      content,
      type,
      priority
    }
  }

  /**
   * Optimize sections for display
   */
  private static optimizeSections(
    sections: FormattedSection[], 
    options: GeminiFormatOptions
  ): FormattedSection[] {
    // Sort by priority
    sections.sort((a, b) => a.priority - b.priority)
    
    // Limit number of sections
    const context = this.featureContexts[options.feature]
    const maxSections = options.maxLength ? 
      Math.min(options.maxLength, context.maxSections) : 
      context.maxSections
    
    const limitedSections = sections.slice(0, maxSections)
    
    // Apply formatting based on options
    return limitedSections.map(section => this.formatSection(section, options))
  }

  /**
   * Format individual section
   */
  private static formatSection(
    section: FormattedSection, 
    options: GeminiFormatOptions
  ): FormattedSection {
    let formattedContent = section.content
    
    // Apply compact mode
    if (options.compactMode) {
      formattedContent = this.makeCompact(formattedContent)
    }
    
    // Apply bullet formatting
    if (options.showBullets && section.type === 'list') {
      formattedContent = this.formatBullets(formattedContent)
    }
    
    // Apply header formatting
    if (options.showHeaders && section.title) {
      formattedContent = this.formatHeader(section.title) + '\n' + formattedContent
    }
    
    return {
      ...section,
      content: formattedContent
    }
  }

  /**
   * Make content more compact
   */
  private static makeCompact(content: string): string {
    return content
      .replace(/\n\s*\n/g, '\n')  // Remove extra newlines
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim()
  }

  /**
   * Format bullet points
   */
  private static formatBullets(content: string): string {
    return content
      .split('\n')
      .map(line => {
        if (line.match(/^\d+\./)) {
          return `• ${line.replace(/^\d+\.\s*/, '')}`
        } else if (line.match(/^[\*\-\•]/)) {
          return `• ${line.replace(/^[\*\-\•]\s*/, '')}`
        }
        return line
      })
      .join('\n')
  }

  /**
   * Format headers
   */
  private static formatHeader(title: string): string {
    return `**${title}**`
  }

  /**
   * Get feature-specific prompt suggestions
   */
  static getPromptSuggestions(feature: GeminiFormatOptions['feature']): string[] {
    const suggestions = {
      '3dviewer': [
        "Explain the structure of this protein",
        "What are the key structural features?",
        "Describe the secondary structure elements",
        "What functional domains are present?"
      ],
      'alphafold': [
        "Analyze the confidence of this prediction",
        "What are the most reliable regions?",
        "Compare with known structures",
        "Explain the folding pattern"
      ],
      'aianalysis': [
        "Analyze protein stability",
        "Identify potential binding sites",
        "Suggest optimization strategies",
        "Evaluate functional implications"
      ],
      'labplanning': [
        "Suggest protocol improvements",
        "Identify potential issues",
        "Recommend safety measures",
        "Optimize experimental timeline"
      ],
      'pdbsearch': [
        "Find similar structures",
        "Compare structural features",
        "Identify functional homologs",
        "Suggest related proteins"
      ],
  // ...existing code...
    }
    
    return suggestions[feature] || []
  }

  /**
   * Get feature context info
   */
  static getFeatureContext(feature: GeminiFormatOptions['feature']) {
    return this.featureContexts[feature]
  }
}

/**
 * React hook for formatted Gemini responses
 */
export const useGeminiFormatter = (
  feature: GeminiFormatOptions['feature'],
  options?: Partial<GeminiFormatOptions>
) => {
  const formatResponse = (rawResponse: string) => {
    return GeminiFormatter.formatResponse(rawResponse, {
      feature,
      showBullets: true,
      showHeaders: true,
      compactMode: false,
      ...options
    })
  }

  const getSuggestions = () => {
    return GeminiFormatter.getPromptSuggestions(feature)
  }

  const getContext = () => {
    return GeminiFormatter.getFeatureContext(feature)
  }

  return {
    formatResponse,
    getSuggestions,
    getContext
  }
}
