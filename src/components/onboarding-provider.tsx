'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { OnboardingWizard } from './onboarding-wizard'
import { useOnboarding } from '@/hooks/useOnboarding'

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { theme } = useTheme()
  const {
    showOnboarding,
    completeOnboarding,
    hideOnboarding,
    needsOnboarding,
    onboardingState,
    isDashboardRoute,
    isAuthenticated
  } = useOnboarding()

  const isDarkMode = theme === 'dark'

  const handleOnboardingComplete = (userData: any) => {
    console.log('Onboarding completed with data:', userData)
    completeOnboarding(userData)
  }

  return (
    <>
      {children}
      {/* Only render onboarding wizard on dashboard routes for authenticated users */}
      {isDashboardRoute && isAuthenticated && (
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={hideOnboarding}
          onComplete={handleOnboardingComplete}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  )
}
