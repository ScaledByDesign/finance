'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

export const DemoDataDebug = () => {
  const [demoStatus, setDemoStatus] = useState<any>(null)
  const { accounts, items } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    const checkDemoStatus = async () => {
      try {
        const { isDemoMode, generateDemoData } = await import('../../lib/demoData')
        const isDemo = isDemoMode()
        const demoData = isDemo ? generateDemoData() : null
        
        setDemoStatus({
          isDemoMode: isDemo,
          demoAccountCount: demoData?.accounts?.length || 0,
          demoAccounts: demoData?.accounts?.map(acc => ({
            id: acc.account_id,
            name: acc.name,
            type: acc.type,
            subtype: acc.subtype
          })) || [],
          reduxAccountCount: accounts?.length || 0,
          reduxItemCount: items?.length || 0,
          reduxAccounts: accounts?.map((acc: any) => ({
            id: acc.account_id,
            name: acc.name,
            type: acc.type
          })) || [],
          environment: {
            forceDemo: process.env.NEXT_PUBLIC_FORCE_DEMO,
            demoMode: process.env.NEXT_PUBLIC_DEMO_MODE
          }
        })
      } catch (error) {
        console.error('Debug error:', error)
      }
    }

    checkDemoStatus()
  }, [accounts, items])

  if (!demoStatus) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Demo Data Debug</h3>
      <div className="space-y-1">
        <div>Demo Mode: {demoStatus.isDemoMode ? '✅' : '❌'}</div>
        <div>Demo Accounts: {demoStatus.demoAccountCount}</div>
        <div>Redux Accounts: {demoStatus.reduxAccountCount}</div>
        <div>Redux Items: {demoStatus.reduxItemCount}</div>
        <div className="mt-2">
          <div className="font-semibold">Demo Accounts:</div>
          {demoStatus.demoAccounts.map((acc: any, idx: number) => (
            <div key={idx} className="ml-2 text-xs">
              {acc.name} ({acc.subtype})
            </div>
          ))}
        </div>
        <div className="mt-2">
          <div className="font-semibold">Redux Accounts:</div>
          {demoStatus.reduxAccounts.map((acc: any, idx: number) => (
            <div key={idx} className="ml-2 text-xs">
              {acc.name} ({acc.type})
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs opacity-75">
          Force Demo: {demoStatus.environment.forceDemo || 'false'}
        </div>
      </div>
    </div>
  )
}
