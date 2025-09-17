'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { RootState } from '@/store'

interface OnboardingState {
  isComplete: boolean
  currentStep: number
  hasSeenWelcome: boolean
  profileComplete: boolean
  bankAccountConnected: boolean
  lastCompletedStep: number
}

export function useOnboarding() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = useSelector((state: RootState) => state.user.user)
  const { items } = useSelector((state: RootState) => state.user)

  // Check if we're on a dashboard route and user is authenticated
  const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/v2')
  const isAuthenticated = status === 'authenticated' && (session?.user || user)
  const shouldShowOnboarding = isDashboardRoute && isAuthenticated
  
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    isComplete: false,
    currentStep: 1,
    hasSeenWelcome: false,
    profileComplete: false,
    bankAccountConnected: false,
    lastCompletedStep: 0
  })

  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check onboarding status on mount and when user data changes
  useEffect(() => {
    const checkOnboardingStatus = () => {
      // Only proceed if we should show onboarding (dashboard route + authenticated)
      if (!shouldShowOnboarding || !user) return

      // Get onboarding state from localStorage
      const savedState = localStorage.getItem(`onboarding_${user.id}`)
      const userCompletedOnboarding = localStorage.getItem(`user_${user.id}_onboarded`) === 'true'

      let state: OnboardingState = {
        isComplete: false,
        currentStep: 1,
        hasSeenWelcome: false,
        profileComplete: false,
        bankAccountConnected: false,
        lastCompletedStep: 0
      }

      if (savedState) {
        try {
          state = { ...state, ...JSON.parse(savedState) }
        } catch (error) {
          console.error('Error parsing onboarding state:', error)
        }
      }

      // Check if profile is complete - more comprehensive check
      const profileComplete = !!(
        user.name &&
        user.email &&
        user.given_name &&
        user.family_name &&
        // Additional checks for a complete profile
        (user.phone || state.lastCompletedStep >= 2) // Phone or completed personal step
      )

      // Check if bank account is connected
      const bankAccountConnected = Array.isArray(items) && items.length > 0

      // Update state based on current user data
      state.profileComplete = profileComplete
      state.bankAccountConnected = bankAccountConnected

      // Determine if onboarding is complete - multiple conditions
      const isComplete = (
        userCompletedOnboarding || // User explicitly completed onboarding
        (profileComplete && state.lastCompletedStep >= 6) || // Completed all steps
        (profileComplete && bankAccountConnected && state.hasSeenWelcome) // Profile + bank + seen welcome
      )

      state.isComplete = isComplete

      setOnboardingState(state)

      // Only show onboarding if:
      // 1. Not complete AND
      // 2. User is new (hasn't explicitly completed onboarding) AND
      // 3. Profile is not complete AND
      // 4. We're on a dashboard route and authenticated
      const shouldTriggerOnboarding = (
        !isComplete &&
        !userCompletedOnboarding &&
        !profileComplete &&
        user.isNewUser !== false
      )

      if (shouldTriggerOnboarding) {
        setShowOnboarding(true)
      }
    }

    checkOnboardingStatus()
  }, [user, items, shouldShowOnboarding])

  const updateOnboardingState = (updates: Partial<OnboardingState>) => {
    const newState = { ...onboardingState, ...updates }
    setOnboardingState(newState)

    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newState))
    }
  }

  const completeOnboarding = (userData?: any) => {
    updateOnboardingState({
      isComplete: true,
      lastCompletedStep: 6,
      hasSeenWelcome: true,
      profileComplete: true
    })
    setShowOnboarding(false)

    // Mark user as completed onboarding permanently
    if (user?.id) {
      localStorage.setItem(`user_${user.id}_onboarded`, 'true')

      // Also store completion timestamp for analytics
      localStorage.setItem(`user_${user.id}_onboarded_at`, new Date().toISOString())

      // Store user data if provided
      if (userData) {
        localStorage.setItem(`user_${user.id}_onboarding_data`, JSON.stringify({
          completedAt: new Date().toISOString(),
          profileData: userData.profile,
          bankConnected: userData.bankAccountConnected,
          connectedAccounts: userData.connectedAccounts?.length || 0
        }))
      }
    }
  }

  const skipOnboarding = () => {
    updateOnboardingState({
      hasSeenWelcome: true,
      lastCompletedStep: 1
    })
    setShowOnboarding(false)
  }

  const restartOnboarding = () => {
    updateOnboardingState({
      isComplete: false,
      currentStep: 1,
      hasSeenWelcome: false,
      lastCompletedStep: 0
    })
    setShowOnboarding(true)
  }

  const hideOnboarding = () => {
    setShowOnboarding(false)
  }

  const showOnboardingModal = () => {
    setShowOnboarding(true)
  }

  const resetOnboarding = () => {
    if (user?.id) {
      localStorage.removeItem(`onboarding_${user.id}`)
      localStorage.removeItem(`user_${user.id}_onboarded`)
      localStorage.removeItem(`user_${user.id}_onboarded_at`)
      localStorage.removeItem(`user_${user.id}_onboarding_data`)

      // Reset state
      setOnboardingState({
        isComplete: false,
        currentStep: 1,
        hasSeenWelcome: false,
        profileComplete: false,
        bankAccountConnected: false,
        lastCompletedStep: 0
      })

      setShowOnboarding(true)
    }
  }

  return {
    onboardingState,
    showOnboarding,
    updateOnboardingState,
    completeOnboarding,
    skipOnboarding,
    restartOnboarding,
    resetOnboarding,
    hideOnboarding,
    showOnboardingModal,
    isNewUser: user?.isNewUser !== false,
    needsOnboarding: !onboardingState.isComplete && user?.isNewUser !== false && shouldShowOnboarding,
    isDashboardRoute,
    isAuthenticated
  }
}

// Helper function to check if user needs onboarding
export function checkNeedsOnboarding(user: any, items: any[], pathname?: string): boolean {
  if (!user) return false

  // Only show onboarding on dashboard routes
  const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/v2')
  if (!isDashboardRoute) return false

  // Check if user has explicitly completed onboarding
  const hasCompletedOnboarding = localStorage.getItem(`user_${user.id}_onboarded`) === 'true'
  if (hasCompletedOnboarding) return false

  // Check if profile is sufficiently complete
  const hasCompleteProfile = !!(
    user.name &&
    user.email &&
    user.given_name &&
    user.family_name &&
    user.phone // Additional requirement for complete profile
  )

  // Check if bank account is connected
  const hasBankAccount = Array.isArray(items) && items.length > 0

  // User needs onboarding if:
  // 1. They haven't explicitly completed it AND
  // 2. They don't have a complete profile OR they're marked as a new user
  return !hasCompletedOnboarding && (!hasCompleteProfile || user.isNewUser !== false)
}

// Helper function to mark user as having completed onboarding (for external use)
export function markOnboardingComplete(userId: string, userData?: any): void {
  localStorage.setItem(`user_${userId}_onboarded`, 'true')
  localStorage.setItem(`user_${userId}_onboarded_at`, new Date().toISOString())

  if (userData) {
    localStorage.setItem(`user_${userId}_onboarding_data`, JSON.stringify({
      completedAt: new Date().toISOString(),
      ...userData
    }))
  }
}
