'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SpendingChart } from './charts/spending-chart'
import { CategoryBreakdown } from './charts/category-breakdown'
import { AccountCards } from './cards/account-cards'
import { RecentTransactions } from './cards/recent-transactions'
import { InsightsPanel } from './insights-panel'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

export function Dashboard() {
  const [activeView, setActiveView] = useState('overview')
  const { user } = useSelector((state: RootState) => state.user)

  const views = [
    { id: 'overview', label: 'Overview' },
    { id: 'spending', label: 'Spending' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'insights', label: 'AI Insights' },
  ]

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {views.map((view) => (
          <motion.button
            key={view.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView(view.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeView === view.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {view.label}
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="grid gap-6"
      >
        {activeView === 'overview' && (
          <>
            {/* Spending Chart */}
            <SpendingChart />

            {/* Account Cards */}
            <AccountCards />

            {/* Category Breakdown & Recent Transactions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <CategoryBreakdown />
              <RecentTransactions />
            </div>
          </>
        )}

        {activeView === 'spending' && (
          <>
            <SpendingChart detailed />
            <CategoryBreakdown detailed />
          </>
        )}

        {activeView === 'accounts' && (
          <>
            <AccountCards detailed />
            <RecentTransactions detailed />
          </>
        )}

        {activeView === 'insights' && (
          <InsightsPanel />
        )}
      </motion.div>
    </div>
  )
}