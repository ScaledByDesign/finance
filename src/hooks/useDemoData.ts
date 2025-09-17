'use client'

import { useEffect, useState } from 'react'

// Centralized demo data hook to ensure consistency across all components
export const useDemoData = () => {
  const [demoData, setDemoData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        // Import demo data dynamically to ensure it works on client side
        const { generateDemoData, isDemoMode } = await import('../lib/demoData')
        
        if (isDemoMode()) {
          const data = generateDemoData()
          setDemoData(data)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading demo data:', error)
        setIsLoading(false)
      }
    }

    fetchDemoData()
  }, [])

  return {
    demoData,
    isLoading,
    isDemoMode: !!demoData
  }
}

// Helper hook to get consistent account data
export const useAccountData = () => {
  const { demoData, isLoading } = useDemoData()
  
  return {
    accounts: demoData?.accounts || [],
    isLoading
  }
}

// Helper hook to get consistent transaction data
export const useTransactionData = () => {
  const { demoData, isLoading } = useDemoData()
  
  return {
    transactions: demoData?.transactions || [],
    isLoading
  }
}
