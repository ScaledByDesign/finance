'use client'

import { useOnboarding } from '@/hooks/useOnboarding'
import { SparklesIcon, UserIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/outline'

interface OnboardingTriggerProps {
  variant?: 'banner' | 'card' | 'button'
  className?: string
}

export function OnboardingTrigger({ variant = 'banner', className = '' }: OnboardingTriggerProps) {
  const {
    onboardingState,
    showOnboardingModal,
    needsOnboarding,
    isNewUser,
    isDashboardRoute,
    isAuthenticated
  } = useOnboarding()

  // Don't show if not on dashboard route or not authenticated
  if (!isDashboardRoute || !isAuthenticated) return null

  // Don't show if onboarding is complete
  if (onboardingState.isComplete) return null

  // Don't show if user doesn't need onboarding
  if (!needsOnboarding && !isNewUser) return null

  // Additional check: Don't show if user has explicitly completed onboarding
  if (typeof window !== 'undefined') {
    const hasCompletedOnboarding = localStorage.getItem(`user_onboarded`) === 'true'
    if (hasCompletedOnboarding) return null
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Complete Your Setup</h3>
              <p className="text-sm opacity-90">
                {needsOnboarding 
                  ? 'Get personalized insights by completing your profile and connecting your bank account'
                  : 'Finish setting up your account to unlock all features'
                }
              </p>
            </div>
          </div>
          <button
            onClick={showOnboardingModal}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Continue Setup
          </button>
        </div>
        
        {/* Progress indicators */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            <span className={onboardingState.profileComplete ? 'opacity-100' : 'opacity-60'}>
              Profile {onboardingState.profileComplete ? '✓' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCardIcon className="w-4 h-4" />
            <span className={onboardingState.bankAccountConnected ? 'opacity-100' : 'opacity-60'}>
              Banking {onboardingState.bankAccountConnected ? '✓' : ''}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm ${className}`}>
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to Finance!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Complete your account setup to get personalized financial insights and connect your bank accounts securely.
            </p>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  onboardingState.profileComplete 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {onboardingState.profileComplete && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  Personal Information
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  onboardingState.bankAccountConnected 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {onboardingState.bankAccountConnected && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  Bank Account Connection
                </span>
              </div>
            </div>
            
            <button
              onClick={showOnboardingModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Button variant
  return (
    <button
      onClick={showOnboardingModal}
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${className}`}
    >
      <SparklesIcon className="w-4 h-4" />
      Complete Setup
    </button>
  )
}
