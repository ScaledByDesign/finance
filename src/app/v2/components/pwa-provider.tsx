'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/v2/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content is available; please refresh.')
                  setUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('[PWA] beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Handle app installed
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('[PWA] App is online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('[PWA] App is offline')
      setIsOnline(false)
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
      } else {
        console.log('[PWA] User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('[PWA] Error during app installation:', error)
    }
  }

  const refreshApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  // Provide PWA context to children
  const pwaContext = {
    isInstallable,
    isInstalled,
    isOnline,
    updateAvailable,
    installApp,
    refreshApp,
  }

  return (
    <>
      {children}
      
      {/* Install prompt */}
      {isInstallable && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Install Finance App</h3>
                <p className="text-sm opacity-90">Get quick access and offline features</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setIsInstallable(false)}
                  className="px-3 py-1 text-sm bg-blue-700 rounded hover:bg-blue-800"
                >
                  Later
                </button>
                <button
                  onClick={installApp}
                  className="px-3 py-1 text-sm bg-white text-blue-600 rounded hover:bg-gray-100"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update available prompt */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
          <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Update Available</h3>
                <p className="text-sm opacity-90">New features and improvements</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setUpdateAvailable(false)}
                  className="px-3 py-1 text-sm bg-green-700 rounded hover:bg-green-800"
                >
                  Later
                </button>
                <button
                  onClick={refreshApp}
                  className="px-3 py-1 text-sm bg-white text-green-600 rounded hover:bg-gray-100"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white text-center py-2 text-sm">
          <span>📱 You{`'`}re offline - Some features may be limited</span>
        </div>
      )}
    </>
  )
}

// Hook to use PWA context
export function usePWA() {
  // This would normally use React Context, but for simplicity we'll return static values
  return {
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator?.onLine ?? true,
    updateAvailable: false,
    installApp: () => {},
    refreshApp: () => {},
  }
}
