'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { getUserInfo } from '@/store/actions/useUser'
import { VoiceChat } from './components/voice-chat'
import { DashboardScreen } from './components/dashboard-screen'
import BusinessTransactionsScreen from './components/business-transactions-screen'
import MobileBusinessScreen from './components/mobile-business-screen'
import { InsightsScreen } from './components/insights-screen'
import { SettingsScreen } from './components/settings-screen'
import { AssetsView } from './components/assets-view'

type Screen = 'chat' | 'dashboard' | 'transactions' | 'settings' | 'insights' | 'assets'

interface V2ClientProps {
  chatId: string
}

export function V2Client({ chatId }: V2ClientProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat')
  const [isDarkMode, setIsDarkMode] = useState(false) // Light mode as default
  const [isMobile, setIsMobile] = useState(false)
  const dispatch = useDispatch()

  // Load user data on mount (including demo data if in demo mode)
  useEffect(() => {
    dispatch(getUserInfo({}) as any)
  }, [dispatch])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Tailwind's md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  const handleBack = () => {
    setCurrentScreen('chat')
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black' : 'bg-white'
    }`}>
      <AnimatePresence mode="wait">
        {currentScreen === 'chat' && (
          <VoiceChat
            key="chat"
            onNavigate={handleNavigate}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            key="dashboard"
            onBack={handleBack}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {currentScreen === 'transactions' && (
          isMobile ? (
            <MobileBusinessScreen
              key="mobile-transactions"
              onBack={handleBack}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
          ) : (
            <BusinessTransactionsScreen
              key="desktop-transactions"
              onBack={handleBack}
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
          )
        )}
        {currentScreen === 'insights' && (
          <InsightsScreen
            key="insights"
            onBack={handleBack}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            key="settings"
            onBack={handleBack}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleTheme}
          />
        )}
        {currentScreen === 'assets' && (
          <div className="relative">
            <AssetsView />
            <button
              onClick={handleBack}
              className={`fixed top-4 left-4 z-50 p-2 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              } shadow-lg transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}