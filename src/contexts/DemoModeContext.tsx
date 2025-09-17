'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'react-hot-toast'

interface DemoModeContextType {
  isDemoMode: boolean
  toggleDemoMode: () => void
  isLoading: boolean
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

interface DemoModeProviderProps {
  children: ReactNode
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load demo mode preference from localStorage on mount
  useEffect(() => {
    const loadDemoModePreference = async () => {
      try {
        // Check if user has a saved preference
        const savedPreference = localStorage.getItem('demoModePreference')

        if (savedPreference !== null) {
          setIsDemoMode(savedPreference === 'true')
        } else {
          // If no preference saved, check if user exists in database
          try {
            const userResponse = await fetch('/api/v1/user')
            const userData = await userResponse.json()

            if (!userData || !userData.user) {
              // No user found, default to demo mode
              setIsDemoMode(true)
              localStorage.setItem('demoModePreference', 'true')
            } else {
              // User exists, check if they have a saved preference in database
              try {
                const demoModeResponse = await fetch('/api/v1/user/demo-mode')
                const demoModeData = await demoModeResponse.json()

                if (demoModeData.demoMode !== null) {
                  // Use database preference
                  setIsDemoMode(demoModeData.demoMode)
                  localStorage.setItem('demoModePreference', demoModeData.demoMode.toString())
                } else {
                  // No database preference, check environment default
                  const { isDemoMode: envDemoMode } = await import('../lib/demoData')
                  const defaultMode = envDemoMode()
                  setIsDemoMode(defaultMode)
                  localStorage.setItem('demoModePreference', defaultMode.toString())
                }
              } catch (dbError) {
                // If database check fails, fallback to environment check
                const { isDemoMode: envDemoMode } = await import('../lib/demoData')
                const defaultMode = envDemoMode()
                setIsDemoMode(defaultMode)
                localStorage.setItem('demoModePreference', defaultMode.toString())
              }
            }
          } catch (error) {
            // If API fails, fallback to environment check
            const { isDemoMode: envDemoMode } = await import('../lib/demoData')
            const defaultMode = envDemoMode()
            setIsDemoMode(defaultMode)
            localStorage.setItem('demoModePreference', defaultMode.toString())
          }
        }
      } catch (error) {
        console.error('Error loading demo mode preference:', error)
        setIsDemoMode(true) // Default to demo mode on error
      } finally {
        setIsLoading(false)
      }
    }

    loadDemoModePreference()
  }, [])

  const toggleDemoMode = async () => {
    try {
      const newDemoMode = !isDemoMode
      setIsDemoMode(newDemoMode)
      
      // Save preference to localStorage
      localStorage.setItem('demoModePreference', newDemoMode.toString())
      
      // Optionally save to server/database for persistence across devices
      try {
        await fetch('/api/v1/user/demo-mode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ demoMode: newDemoMode }),
        })
      } catch (serverError) {
        console.warn('Failed to save demo mode preference to server:', serverError)
        // Continue anyway - localStorage will work for this session
      }
      
      // Show success notification
      toast.success(
        newDemoMode
          ? '🎭 Switched to Demo Mode - Showing sample data for demonstration'
          : '🏦 Switched to Live Mode - Showing your real Plaid account data',
        { duration: 4000 }
      )

      // Refresh the page to apply the new mode
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error toggling demo mode:', error)
    }
  }

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, isLoading }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export const useDemoMode = () => {
  const context = useContext(DemoModeContext)
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider')
  }
  return context
}

// Helper function to check demo mode from anywhere
export const getDemoModeFromStorage = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const savedPreference = localStorage.getItem('demoModePreference')
  if (savedPreference !== null) {
    return savedPreference === 'true'
  }
  
  // Fallback to environment check
  return false
}
