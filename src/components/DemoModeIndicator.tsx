'use client'

import { useDemoMode } from '@/contexts/DemoModeContext'

export const DemoModeIndicator = () => {
  const { isDemoMode, isLoading } = useDemoMode()

  if (isLoading) {
    return null
  }

  return (
    <div className={`fixed top-4 left-4 z-50 px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
      isDemoMode 
        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
        : 'bg-green-100 text-green-800 border border-green-200'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isDemoMode ? 'bg-blue-500' : 'bg-green-500'
        }`} />
        <span>{isDemoMode ? 'Demo Mode' : 'Live Mode'}</span>
      </div>
    </div>
  )
}
