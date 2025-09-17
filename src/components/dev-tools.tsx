'use client'

import { useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { CogIcon, RefreshIcon, TrashIcon } from '@heroicons/react/outline'

export function DevTools() {
  const [isOpen, setIsOpen] = useState(false)
  const { onboardingState, resetOnboarding, showOnboardingModal } = useOnboarding()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Developer Tools"
      >
        <CogIcon className="w-5 h-5" />
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Developer Tools</h3>
          
          {/* Onboarding Status */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Onboarding Status</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Complete:</span>
                <span className={onboardingState.isComplete ? 'text-green-600' : 'text-red-600'}>
                  {onboardingState.isComplete ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Step:</span>
                <span>{onboardingState.currentStep}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Completed:</span>
                <span>{onboardingState.lastCompletedStep}</span>
              </div>
              <div className="flex justify-between">
                <span>Profile Complete:</span>
                <span className={onboardingState.profileComplete ? 'text-green-600' : 'text-red-600'}>
                  {onboardingState.profileComplete ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bank Connected:</span>
                <span className={onboardingState.bankAccountConnected ? 'text-green-600' : 'text-red-600'}>
                  {onboardingState.bankAccountConnected ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={showOnboardingModal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshIcon className="w-4 h-4" />
              Show Onboarding
            </button>
            
            <button
              onClick={resetOnboarding}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <TrashIcon className="w-4 h-4" />
              Reset Onboarding
            </button>
          </div>

          {/* Local Storage Info */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Local Storage</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Onboarded:</span>
                <span>{localStorage.getItem('user_onboarded') || 'false'}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed At:</span>
                <span className="truncate ml-2">
                  {localStorage.getItem('user_onboarded_at')?.slice(0, 10) || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
