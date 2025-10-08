// Gemini PDB Integration Service
// AI-powered search suggestions, query interpretation, and result analysis

import { streamGemini } from './geminiService'

export interface SearchIntent {
  intent: 'research' | 'education' | 'drug_design' | 'comparison' | 'exploration'
  entities: string[]
  relationships: string[]
  context: string
  suggestedActions: string[]
  searchTerms: string[]
  filters?: {
    method?: string[]
    resolution?: { min: number; max: number }
    organism?: string[]
    year?: { min: number; max: number }
  }
}

export interface SearchSuggestion {
  text: string
  type: 'query' | 'filter' | 'action'
  confidence: number
  context?: string
}

export interface ResultInsight {
  summary: string
  keyFindings: string[]
  relatedConcepts: string[]
  suggestedActions: string[]
  researchContext: string
}

export interface ComparisonInsight {
  similarities: string[]
  differences: string[]
  functionalImplications: string[]
  structuralFeatures: string[]
  researchOpportunities: string[]
}

export class GeminiPDBIntegration {
  // Context-aware search suggestions
  static async getSearchSuggestions(context: string, currentQuery?: string): Promise<SearchSuggestion[]> {
    const prompt = `You are a molecular biology expert helping researchers find protein structures in the PDB database.

Context: ${context}
Current Query: ${currentQuery || 'None'}

Generate 5-8 intelligent search suggestions that would help researchers find relevant protein structures. Consider:

1. Natural language queries (e.g., "Find proteins similar to insulin")
2. Specific protein families or functions
3. Recent research trends
4. Common experimental approaches
5. Disease-related proteins
6. Structural biology concepts

Format your response as a JSON array with this structure:
[
  {
    "text": "suggestion text",
    "type": "query|filter|action",
    "confidence": 0.9,
    "context": "brief explanation"
  }
]

Focus on practical, actionable suggestions that would help researchers find relevant structures.`

    try {
      const response = await this.callGeminiAPI(prompt, 'pdbsearch')
      return this.parseSuggestionsResponse(response)
    } catch (error) {
      console.warn('Failed to get AI suggestions, using fallback:', error)
      return this.getFallbackSuggestions(context)
    }
  }

  // Intelligent query interpretation
  static async interpretSearchQuery(query: string): Promise<SearchIntent> {
    const prompt = `You are a molecular biology expert analyzing a search query for the PDB database.

Query: "${query}"

Analyze this query and provide structured information about the user's intent. Consider:

1. What type of research is the user likely conducting?
2. What specific proteins, families, or functions are mentioned?
3. What relationships or comparisons might be relevant?
4. What experimental context might be important?
5. What actions would be most helpful?

Respond with a JSON object in this exact format:
{
  "intent": "research|education|drug_design|comparison|exploration",
  "entities": ["protein1", "protein2", "family"],
  "relationships": ["similar to", "binds with", "inhibits"],
  "context": "brief description of research context",
  "suggestedActions": ["View 3D", "AI Analysis", "Compare", "Download"],
  "searchTerms": ["term1", "term2", "term3"],
  "filters": {
    "method": ["X-RAY DIFFRACTION", "NMR"],
    "resolution": {"min": 1.5, "max": 3.0},
    "organism": ["Homo sapiens"],
    "year": {"min": 2020, "max": 2024}
  }
}

Be specific and practical in your analysis.`

    try {
      const response = await this.callGeminiAPI(prompt, 'pdbsearch')
      return this.parseIntentResponse(response)
    } catch (error) {
      console.warn('Failed to interpret query, using fallback:', error)
      return this.getFallbackIntent(query)
    }
  }

  // Result explanation and insights
  static async explainSearchResults(results: any[], query: string): Promise<ResultInsight> {
    const resultsSummary = results.slice(0, 10).map(r => ({
      pdbId: r.pdbId,
      title: r.title,
      method: r.method,
      resolution: r.resolution,
      organism: r.organism
    }))

    const prompt = `You are a molecular biology expert analyzing PDB search results.

Original Query: "${query}"

Search Results (${results.length} total):
${JSON.stringify(resultsSummary, null, 2)}

Provide a comprehensive analysis of these results including:

1. A brief summary of what was found
2. Key findings and patterns in the results
3. Related biological concepts and functions
4. Suggested next actions for the researcher
5. Research context and implications

Respond with a JSON object in this exact format:
{
  "summary": "Brief overview of the search results",
  "keyFindings": ["finding1", "finding2", "finding3"],
  "relatedConcepts": ["concept1", "concept2", "concept3"],
  "suggestedActions": ["action1", "action2", "action3"],
  "researchContext": "Broader research implications and context"
}

Focus on providing actionable insights that would help researchers understand and utilize these results.`

    try {
      const response = await this.callGeminiAPI(prompt, 'pdbsearch')
      return this.parseInsightResponse(response)
    } catch (error) {
      console.warn('Failed to generate insights, using fallback:', error)
      return this.getFallbackInsight(results, query)
    }
  }

  // Structure comparison insights
  static async compareStructures(structures: any[]): Promise<ComparisonInsight> {
    const structureInfo = structures.map(s => ({
      pdbId: s.pdbId,
      title: s.title,
      method: s.method,
      resolution: s.resolution,
      organism: s.organism,
      keywords: s.keywords
    }))

    const prompt = `You are a structural biology expert comparing protein structures.

Structures to Compare (${structures.length}):
${JSON.stringify(structureInfo, null, 2)}

Provide a detailed comparison analysis including:

1. Structural similarities and common features
2. Key differences and unique characteristics
3. Functional implications of structural differences
4. Important structural features to note
5. Research opportunities and questions

Respond with a JSON object in this exact format:
{
  "similarities": ["similarity1", "similarity2", "similarity3"],
  "differences": ["difference1", "difference2", "difference3"],
  "functionalImplications": ["implication1", "implication2", "implication3"],
  "structuralFeatures": ["feature1", "feature2", "feature3"],
  "researchOpportunities": ["opportunity1", "opportunity2", "opportunity3"]
}

Provide specific, actionable insights that would help researchers understand the structural relationships and plan further experiments.`

    try {
      const response = await this.callGeminiAPI(prompt, 'pdbsearch')
      return this.parseComparisonResponse(response)
    } catch (error) {
      console.warn('Failed to generate comparison insights, using fallback:', error)
      return this.getFallbackComparison(structures)
    }
  }

  // Generate contextual help
  static async getContextualHelp(context: string, userAction?: string): Promise<string> {
    const prompt = `You are a helpful molecular biology research assistant.

Context: ${context}
User Action: ${userAction || 'General help'}

Provide helpful guidance and tips for using the PDB search effectively. Include:

1. Search strategies and tips
2. How to interpret results
3. Next steps and recommendations
4. Common pitfalls to avoid

Keep the response concise but informative, focusing on practical advice.`

    try {
      const response = await this.callGeminiAPI(prompt, 'pdbsearch')
      return response
    } catch (error) {
      console.warn('Failed to get contextual help, using fallback:', error)
      return this.getFallbackHelp(context)
    }
  }

  // Generate research recommendations
  static async getResearchRecommendations(query: string, results: any[]): Promise<string[]> {
    const prompt = `You are a research advisor helping with molecular biology research.

Query: "${query}"
Results Found: ${results.length} structures

Based on the search query and results, suggest 5-7 specific research recommendations or next steps. Consider:

1. Experimental approaches
2. Structural analysis methods
3. Comparative studies
4. Functional investigations
5. Drug design opportunities
6. Collaboration possibilities

Provide specific, actionable recommendations that would advance the research.`

    try {
      const response = await this.callGeminiAPI(prompt, 'pdbsearch')
      return this.parseRecommendationsResponse(response)
    } catch (error) {
      console.warn('Failed to get research recommendations, using fallback:', error)
      return this.getFallbackRecommendations(query)
    }
  }

  // Call Gemini API with error handling
  private static async callGeminiAPI(prompt: string, feature: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let response = ''
      
      streamGemini(feature, prompt, (chunk: string) => {
        response += chunk
      }).then(() => {
        resolve(response)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  // Parse suggestions response
  private static parseSuggestionsResponse(response: string): SearchSuggestion[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.warn('Failed to parse suggestions response:', error)
      return this.getFallbackSuggestions('general')
    }
  }

  // Parse intent response
  private static parseIntentResponse(response: string): SearchIntent {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.warn('Failed to parse intent response:', error)
      return this.getFallbackIntent('')
    }
  }

  // Parse insight response
  private static parseInsightResponse(response: string): ResultInsight {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.warn('Failed to parse insight response:', error)
      return this.getFallbackInsight([], '')
    }
  }

  // Parse comparison response
  private static parseComparisonResponse(response: string): ComparisonInsight {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('No JSON found in response')
    } catch (error) {
      console.warn('Failed to parse comparison response:', error)
      return this.getFallbackComparison([])
    }
  }

  // Parse recommendations response
  private static parseRecommendationsResponse(response: string): string[] {
    try {
      // Try to extract list from response
      const lines = response.split('\n').filter(line => 
        line.trim().match(/^\d+\.|^[-*]/) || line.trim().length > 10
      )
      return lines.slice(0, 7).map(line => line.replace(/^\d+\.\s*|^[-*]\s*/, '').trim())
    } catch (error) {
      console.warn('Failed to parse recommendations response:', error)
      return this.getFallbackRecommendations('')
    }
  }

  // Fallback methods
  private static getFallbackSuggestions(context: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [
      { text: 'Find proteins similar to insulin', type: 'query', confidence: 0.9, context: 'Similarity search' },
      { text: 'Show recent COVID-19 structures', type: 'query', confidence: 0.8, context: 'Recent research' },
      { text: 'High resolution enzyme structures', type: 'filter', confidence: 0.7, context: 'Quality filter' },
      { text: 'Human protein structures', type: 'filter', confidence: 0.8, context: 'Organism filter' },
      { text: 'X-ray crystallography structures', type: 'filter', confidence: 0.7, context: 'Method filter' }
    ]

    if (context.includes('drug')) {
      suggestions.unshift({ text: 'Drug target proteins', type: 'query', confidence: 0.9, context: 'Drug discovery' })
    }

    return suggestions
  }

  private static getFallbackIntent(query: string): SearchIntent {
    return {
      intent: 'exploration',
      entities: [query],
      relationships: [],
      context: `Search for ${query}`,
      suggestedActions: ['View 3D', 'AI Analysis', 'Compare', 'Download'],
      searchTerms: [query],
      filters: {}
    }
  }

  private static getFallbackInsight(results: any[], query: string): ResultInsight {
    return {
      summary: `Found ${results.length} structures related to "${query}"`,
      keyFindings: [
        'Multiple structures found with varying resolution',
        'Different experimental methods used',
        'Various organisms represented'
      ],
      relatedConcepts: ['Protein structure', 'Molecular biology', 'Structural biology'],
      suggestedActions: ['View 3D structures', 'Compare structures', 'Download PDB files'],
      researchContext: 'These structures provide valuable insights for structural biology research'
    }
  }

  private static getFallbackComparison(_structures: any[]): ComparisonInsight {
    return {
      similarities: [
        'Common structural motifs',
        'Similar experimental methods',
        'Related biological functions'
      ],
      differences: [
        'Resolution variations',
        'Different organisms',
        'Structural variations'
      ],
      functionalImplications: [
        'Functional diversity',
        'Evolutionary relationships',
        'Structural flexibility'
      ],
      structuralFeatures: [
        'Secondary structure elements',
        'Active site characteristics',
        'Binding interfaces'
      ],
      researchOpportunities: [
        'Comparative structural analysis',
        'Functional studies',
        'Drug design applications'
      ]
    }
  }

  private static getFallbackHelp(_context: string): string {
    return `Here are some tips for effective PDB searching:

1. Use specific protein names or PDB IDs for precise results
2. Try natural language queries like "Find proteins similar to insulin"
3. Use filters to narrow down results by resolution, method, or organism
4. Compare multiple structures to understand structural relationships
5. Check the 3D viewer for detailed structural analysis

For more help, try asking Gemini specific questions about your research needs.`
  }

  private static getFallbackRecommendations(_query: string): string[] {
    return [
      'Analyze the 3D structure in detail',
      'Compare with related structures',
      'Investigate functional implications',
      'Consider experimental validation',
      'Explore drug design opportunities',
      'Study evolutionary relationships',
      'Plan structural biology experiments'
    ]
  }
}

export default GeminiPDBIntegration





