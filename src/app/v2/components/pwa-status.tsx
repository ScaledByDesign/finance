'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/outline'

interface PWAStatus {
  isInstalled: boolean
  isOnline: boolean
  hasServiceWorker: boolean
  isStandalone: boolean
  canInstall: boolean
}

export function PWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    hasServiceWorker: false,
    isStandalone: false,
    canInstall: false,
  })
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const checkPWAStatus = () => {
      const newStatus: PWAStatus = {
        isInstalled: window.matchMedia('(display-mode: standalone)').matches,
        isOnline: navigator.onLine,
        hasServiceWorker: 'serviceWorker' in navigator,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        canInstall: false, // Will be updated by beforeinstallprompt event
      }

      setStatus(newStatus)
    }

    const handleBeforeInstallPrompt = () => {
      setStatus(prev => ({ ...prev, canInstall: true }))
    }

    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }))
    }

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
    }

    // Initial check
    checkPWAStatus()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? (
      <CheckCircleIcon className="w-4 h-4 text-green-500" />
    ) : (
      <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />
    )
  }

  if (!showStatus) {
    return (
      <button
        onClick={() => setShowStatus(true)}
        className="fixed bottom-4 left-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show PWA Status"
      >
        <InformationCircleIcon className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">PWA Status</h3>
        <button
          onClick={() => setShowStatus(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {getStatusIcon(status.isOnline)}
          <span className={status.isOnline ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}>
            {status.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(status.hasServiceWorker)}
          <span className={status.hasServiceWorker ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}>
            Service Worker {status.hasServiceWorker ? 'Active' : 'Not Available'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(status.isStandalone)}
          <span className={status.isStandalone ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-400'}>
            {status.isStandalone ? 'Running as App' : 'Running in Browser'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(status.isInstalled)}
          <span className={status.isInstalled ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-400'}>
            {status.isInstalled ? 'App Installed' : 'Not Installed'}
          </span>
        </div>
        
        {status.canInstall && (
          <div className="flex items-center gap-2">
            <InformationCircleIcon className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700 dark:text-blue-400">
              Ready to Install
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Display Mode: {status.isStandalone ? 'Standalone' : 'Browser'}</div>
          <div>Connection: {status.isOnline ? 'Online' : 'Offline'}</div>
        </div>
      </div>
    </div>
  )
}
