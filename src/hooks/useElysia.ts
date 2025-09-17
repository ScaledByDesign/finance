'use client'

import { useState, useCallback } from 'react'

interface AnalysisRequest {
  query: string
  financial_data?: any
  collection_names?: string[]
}

interface AnalysisResponse {
  response: string
  objects?: any[]
  metadata?: any
}

interface ElysiaHealth {
  status: string
  services: {
    elysia: {
      status: string
      elysia_version: string
      weaviate_connected: boolean
    }
    weaviate: {
      connected: boolean
      url: string
    }
  }
  timestamp: string
}

interface Collections {
  collections: string[]
  preprocessed: string[]
}

export function useElysia() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (request: AnalysisRequest): Promise<AnalysisResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/elysia/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const result: AnalysisResponse = await response.json()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Elysia analysis error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const checkHealth = useCallback(async (): Promise<ElysiaHealth | null> => {
    try {
      const response = await fetch('/api/v1/elysia/health')
      
      if (!response.ok) {
        throw new Error('Health check failed')
      }

      const health: ElysiaHealth = await response.json()
      return health

    } catch (err) {
      console.error('Health check error:', err)
      return null
    }
  }, [])

  const getCollections = useCallback(async (): Promise<Collections | null> => {
    try {
      const response = await fetch('/api/v1/elysia/collections')
      
      if (!response.ok) {
        throw new Error('Failed to get collections')
      }

      const collections: Collections = await response.json()
      return collections

    } catch (err) {
      console.error('Collections error:', err)
      return null
    }
  }, [])

  const preprocessCollections = useCallback(async (collectionNames: string[]): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/elysia/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection_names: collectionNames }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Preprocessing failed')
      }

      return true

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Preprocessing error:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Helper function to determine if a query should use Elysia
  const isComplexQuery = useCallback((query: string): boolean => {
    const complexKeywords = [
      'analyze', 'analysis', 'pattern', 'trend', 'optimize', 'optimization',
      'recommend', 'recommendation', 'predict', 'prediction', 'forecast',
      'compare', 'comparison', 'strategy', 'portfolio', 'investment',
      'budget', 'spending', 'saving', 'goal', 'risk', 'diversification'
    ]

    const lowerQuery = query.toLowerCase()
    return complexKeywords.some(keyword => lowerQuery.includes(keyword))
  }, [])

  return {
    analyze,
    checkHealth,
    getCollections,
    preprocessCollections,
    isComplexQuery,
    loading,
    error,
  }
}
