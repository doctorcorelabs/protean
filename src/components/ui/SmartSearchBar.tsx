import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Lightbulb, Sparkles, TrendingUp, Clock, Star } from 'lucide-react'
import { GeminiPDBIntegration, SearchSuggestion } from '../../services/geminiPDBIntegration'
import { SearchQuery, AdvancedFilters } from '../../services/enhancedPDBSearch'

interface SmartSearchBarProps {
  onSearch: (query: SearchQuery) => void
  onSuggestionClick: (suggestion: SearchSuggestion) => void
  isLoading?: boolean
  placeholder?: string
  showFilters?: boolean
  onFiltersChange?: (filters: AdvancedFilters) => void
  initialFilters?: AdvancedFilters
  className?: string
}

interface SearchHistory {
  query: string
  timestamp: number
  results: number
}

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  onSuggestionClick,
  isLoading = false,
  placeholder = "Search by protein name, PDB ID, or ask Gemini...",
  showFilters = true,
  onFiltersChange,
  initialFilters = {},
  className = ''
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters)
  const [searchMode, setSearchMode] = useState<'text' | 'ai' | 'sequence' | 'structure'>('text')
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pdb_search_history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.warn('Failed to load search history:', error)
      }
    }
  }, [])

  // Generate suggestions when query changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.trim().length > 2) {
      debounceRef.current = setTimeout(async () => {
        setIsGeneratingSuggestions(true)
        try {
          const newSuggestions = await GeminiPDBIntegration.getSearchSuggestions(query, query)
          setSuggestions(newSuggestions)
        } catch (error) {
          console.warn('Failed to generate suggestions:', error)
          setSuggestions([])
        } finally {
          setIsGeneratingSuggestions(false)
        }
      }, 300)
    } else {
      setSuggestions([])
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Handle input focus
  const handleFocus = useCallback(() => {
    setShowSuggestions(true)
  }, [])

  // Handle input blur
  const handleBlur = useCallback((_e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
      }
    }, 150)
  }, [])

  // Handle search submission
  const handleSearch = useCallback(async (searchQuery?: string) => {
    const finalQuery = searchQuery || query.trim()
    if (!finalQuery) return

    const searchQueryObj: SearchQuery = {
      naturalQuery: searchMode === 'ai' ? finalQuery : undefined,
      textQuery: searchMode === 'text' ? finalQuery : undefined,
      sequence: searchMode === 'sequence' ? finalQuery : undefined,
      pdbId: searchMode === 'structure' ? finalQuery : undefined,
      searchMode,
      filters: Object.keys(filters).length > 0 ? filters : undefined
    }

    // Add to history
    const newHistoryItem: SearchHistory = {
      query: finalQuery,
      timestamp: Date.now(),
      results: 0 // Will be updated after search
    }
    
    const updatedHistory = [newHistoryItem, ...history.filter(h => h.query !== finalQuery)].slice(0, 10)
    setHistory(updatedHistory)
    localStorage.setItem('pdb_search_history', JSON.stringify(updatedHistory))

    // Execute search
    onSearch(searchQueryObj)
    setShowSuggestions(false)
  }, [query, searchMode, filters, history, onSearch])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }, [handleSearch])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    onSuggestionClick(suggestion)
    setShowSuggestions(false)
  }, [onSuggestionClick])

  // Handle history click
  const handleHistoryClick = useCallback((historyItem: SearchHistory) => {
    setQuery(historyItem.query)
    handleSearch(historyItem.query)
  }, [handleSearch])

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: AdvancedFilters) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [onFiltersChange])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [])

  // Get quick filter suggestions
  const getQuickFilters = useCallback(() => {
    return [
      { label: 'High Resolution', key: 'resolution', value: { min: 0, max: 2.0 } },
      { label: 'Recent', key: 'year', value: { min: 2020, max: 2024 } },
      { label: 'Human', key: 'organism', value: ['Homo sapiens'] },
      { label: 'X-ray', key: 'method', value: ['X-RAY DIFFRACTION'] },
      { label: 'COVID-19', key: 'keywords', value: ['COVID-19', 'SARS-CoV-2'] }
    ]
  }, [])

  // Apply quick filter
  const applyQuickFilter = useCallback((filterKey: string, filterValue: any) => {
    const newFilters = { ...filters, [filterKey]: filterValue }
    handleFilterChange(newFilters)
  }, [filters, handleFilterChange])

  // Remove filter
  const removeFilter = useCallback((filterKey: string) => {
    const newFilters = { ...filters }
    delete newFilters[filterKey as keyof AdvancedFilters]
    handleFilterChange(newFilters)
  }, [filters, handleFilterChange])

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          {/* Search Mode Selector */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {[
              { key: 'text', label: 'Text', icon: Search },
              { key: 'ai', label: 'AI', icon: Sparkles },
              { key: 'sequence', label: 'Seq', icon: TrendingUp },
              { key: 'structure', label: 'Struct', icon: Star }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSearchMode(key as any)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  searchMode === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title={`${label} search mode`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            
            {/* Clear Button */}
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Filters Toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-3 py-3 border rounded-lg transition-colors ${
                Object.keys(filters).length > 0
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {key}: {Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}
                <button
                  onClick={() => removeFilter(key)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || history.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Lightbulb className="w-3 h-3" />
                  <span>AI Suggestions</span>
                  {isGeneratingSuggestions && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  )}
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>{suggestion.text}</span>
                      {suggestion.confidence && (
                        <span className="text-xs text-gray-400">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    {suggestion.context && (
                      <div className="text-xs text-gray-500 mt-1">{suggestion.context}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {history.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <Clock className="w-3 h-3" />
                  <span>Recent Searches</span>
                </div>
                {history.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.query}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Filters */}
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <Filter className="w-3 h-3" />
                <span>Quick Filters</span>
              </div>
              <div className="flex flex-wrap gap-1 px-3">
                {getQuickFilters().map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => applyQuickFilter(filter.key, filter.value)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Panel */}
      {showFiltersPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experimental Method
              </label>
              <select
                value={filters.method?.[0] || ''}
                onChange={(e) => {
                  const method = e.target.value ? [e.target.value as 'X-RAY DIFFRACTION' | 'NMR' | 'ELECTRON MICROSCOPY' | 'ALL'] : undefined
                  handleFilterChange({ ...filters, method })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Methods</option>
                <option value="X-RAY DIFFRACTION">X-ray Crystallography</option>
                <option value="NMR">NMR Spectroscopy</option>
                <option value="ELECTRON MICROSCOPY">Electron Microscopy</option>
              </select>
            </div>

            {/* Resolution Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution (Å)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.resolution?.min || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseFloat(e.target.value) : 0
                    const max = filters.resolution?.max || 10
                    handleFilterChange({
                      ...filters,
                      resolution: { min, max }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.resolution?.max || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseFloat(e.target.value) : 10
                    const min = filters.resolution?.min || 0
                    handleFilterChange({
                      ...filters,
                      resolution: { min, max }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Release Year
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="From"
                  value={filters.year?.min || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : 1900
                    const max = filters.year?.max || new Date().getFullYear()
                    handleFilterChange({
                      ...filters,
                      year: { min, max }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="To"
                  value={filters.year?.max || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : new Date().getFullYear()
                    const min = filters.year?.min || 1900
                    handleFilterChange({
                      ...filters,
                      year: { min, max }
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Organism Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organism
              </label>
              <input
                type="text"
                placeholder="e.g., Homo sapiens"
                value={filters.organism?.[0] || ''}
                onChange={(e) => {
                  const organism = e.target.value ? [e.target.value] : undefined
                  handleFilterChange({ ...filters, organism })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SmartSearchBar
