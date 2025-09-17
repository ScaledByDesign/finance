'use client'

import { SessionProvider } from 'next-auth/react'
import { Provider as ReduxProvider } from 'react-redux'
import store from '@/store'
import { ThemeProvider } from 'next-themes'
import { PWAProvider } from './pwa-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <PWAProvider>
            {children}
          </PWAProvider>
        </ThemeProvider>
      </ReduxProvider>
    </SessionProvider>
  )
}