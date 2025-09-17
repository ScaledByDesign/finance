'use client'

import { useDemoMode } from '@/contexts/DemoModeContext'
import { useState } from 'react'

export const DemoModeDemo = () => {
  const { isDemoMode, toggleDemoMode, isLoading } = useDemoMode()
  const [showDemo, setShowDemo] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  const createUserAccount = async () => {
    setIsCreatingUser(true)
    try {
      const response = await fetch('/api/v1/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('User account created! You can now use Live Mode with Plaid.')
        window.location.reload()
      } else {
        alert('Failed to create user account. Please try again.')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user account. Please try again.')
    } finally {
      setIsCreatingUser(false)
    }
  }

  if (isLoading) {
    return null
  }

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          Demo Mode Controls
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Demo Mode Controls</h3>
        <button
          onClick={() => setShowDemo(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Current Mode:</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            isDemoMode 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {isDemoMode ? 'Demo Mode' : 'Live Mode'}
          </span>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {isDemoMode 
            ? '🎭 Showing sample data for demonstration purposes'
            : '🏦 Showing real account data from Plaid connections'
          }
        </div>
        
        <div className="space-y-2">
          <button
            onClick={toggleDemoMode}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
              isDemoMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Switch to {isDemoMode ? 'Live Mode' : 'Demo Mode'}
          </button>

          <button
            onClick={createUserAccount}
            disabled={isCreatingUser}
            className="w-full px-3 py-2 rounded text-sm font-medium bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingUser ? 'Creating...' : 'Create User Account'}
          </button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
          <strong>Demo Mode:</strong> Perfect for presentations and testing<br/>
          <strong>Live Mode:</strong> Your real financial data
        </div>
      </div>
    </div>
  )
}
