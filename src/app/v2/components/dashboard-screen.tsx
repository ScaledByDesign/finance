'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  CashIcon,
  ChartBarIcon,
  PlusIcon,
  BellIcon,
  CogIcon,
  SearchIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  RefreshIcon
} from '@heroicons/react/outline'
import { OverviewChart } from './charts/overview-chart'
import { RecentTransactions } from './cards/recent-transactions'
import { useTransactions } from '../hooks/useTransactions'
import { OnboardingTrigger } from '@/components/onboarding-trigger'

interface DashboardScreenProps {
  onBack: () => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

export function DashboardScreen({ onBack, isDarkMode, onToggleTheme }: DashboardScreenProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch real transaction data
  const {
    transactions,
    loading,
    error,
    refresh
  } = useTransactions({
    pageSize: 100,
    filterDate: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      endDate: new Date().toISOString()
    }
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Calculate real stats from transactions
  const calculateStats = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Calculate totals
    const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0)

    // Current month transactions
    const currentMonthTransactions = transactions.filter(t =>
      new Date(t.date) >= startOfMonth
    )
    const monthlyIncome = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpense = Math.abs(currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0))

    // Last month for comparison
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date >= lastMonth && date <= lastMonthEnd
    })
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const lastMonthExpense = Math.abs(lastMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0))

    // Calculate changes
    const incomeChange = lastMonthIncome > 0
      ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1)
      : '0.0'
    const expenseChange = lastMonthExpense > 0
      ? ((monthlyExpense - lastMonthExpense) / lastMonthExpense * 100).toFixed(1)
      : '0.0'

    // Investment transactions (categories like 'TRANSFER_IN_INVESTMENT')
    const investmentTransactions = transactions.filter(t =>
      t.category?.includes('INVESTMENT') ||
      t.personal_finance_category?.primary === 'INVESTMENT'
    )
    const investments = investmentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return [
      {
        title: 'Total Balance',
        value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: totalBalance > 0 ? '+12.5%' : '-3.2%',
        trend: totalBalance > 0 ? 'up' : 'down',
        icon: CashIcon,
      },
      {
        title: 'Monthly Income',
        value: `$${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${parseFloat(incomeChange) >= 0 ? '+' : ''}${incomeChange}%`,
        trend: parseFloat(incomeChange) >= 0 ? 'up' : 'down',
        icon: ArrowUpIcon,
      },
      {
        title: 'Monthly Expense',
        value: `$${monthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${parseFloat(expenseChange) >= 0 ? '+' : ''}${expenseChange}%`,
        trend: parseFloat(expenseChange) <= 0 ? 'up' : 'down',
        icon: ArrowDownIcon,
      },
      {
        title: 'Investments',
        value: `$${investments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+23.8%',
        trend: 'up',
        icon: ChartBarIcon,
      },
    ]
  }

  const stats = loading ? [
    {
      title: 'Total Balance',
      value: 'Loading...',
      change: '...',
      trend: 'up',
      icon: CashIcon,
    },
    {
      title: 'Monthly Income',
      value: 'Loading...',
      change: '...',
      trend: 'up',
      icon: ArrowUpIcon,
    },
    {
      title: 'Monthly Expense',
      value: 'Loading...',
      change: '...',
      trend: 'down',
      icon: ArrowDownIcon,
    },
    {
      title: 'Investments',
      value: 'Loading...',
      change: '...',
      trend: 'up',
      icon: ChartBarIcon,
    },
  ] : calculateStats()

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen p-3 sm:p-4 lg:p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:border-blue-500'
              }`}
            >
              <ArrowLeftIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Dashboard</h1>
              <p className={`mt-1 text-sm sm:text-base ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Your financial overview</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle - Hidden for now */}
            {/* <button
              onClick={onToggleTheme}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:border-blue-500'
              }`}
            >
              {isDarkMode ? (
                <SunIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              )}
            </button> */}

            {/* Search - Hidden on mobile, shown on tablet+ */}
            <div className="relative hidden sm:block">
              <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base w-32 sm:w-auto ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-800 text-white placeholder-gray-400'
                    : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Mobile Search Button */}
            <button className={`p-2 border rounded-lg transition-colors sm:hidden ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <SearchIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Pay Bills */}
            <button className={`p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <CreditCardIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Invest */}
            <button className={`p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <ChartBarIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:border-blue-500'
              }`}
            >
              <RefreshIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              } ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <button className={`p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <BellIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Settings - Hidden for now */}
            {/* <button className={`p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <CogIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button> */}

            {/* Add Transaction */}
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base">
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add</span>
              <span className="hidden lg:inline">Transaction</span>
            </button>
          </div>
        </div>
      </header>

      {/* Onboarding Banner */}
      <div className="mb-6">
        <OnboardingTrigger variant="banner" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl p-4 sm:p-6 transition-all ${
              isDarkMode
                ? 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className={`p-1.5 sm:p-2 rounded-lg ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'
              }`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isDarkMode ? 'text-blue-500' : 'text-blue-600'
                }`} />
              </div>
              <span className={`text-xs sm:text-sm font-medium ${
                stat.trend === 'up'
                  ? isDarkMode ? 'text-green-500' : 'text-green-600'
                  : isDarkMode ? 'text-red-500' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className={`text-xs sm:text-sm mb-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{stat.title}</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart Section - 2 columns */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Overview Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 sm:p-6 ${
              isDarkMode
                ? 'bg-gray-900/50 border border-gray-800'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div>
                <h2 className={`text-lg sm:text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Financial Overview</h2>
                <p className={`text-xs sm:text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Your spending and income trends</p>
              </div>

              {/* Time Range Selector */}
              <div className={`flex rounded-lg p-1 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                {['24h', '7d', '30d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <OverviewChart
              isDarkMode={isDarkMode}
              transactions={transactions}
              timeRange={timeRange}
            />
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent Transactions */}
          <RecentTransactions
            isDarkMode={isDarkMode}
            transactions={transactions.slice(0, 5)}
            loading={loading}
          />

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-4 sm:p-6 ${
              isDarkMode
                ? 'bg-gray-900/30 border border-blue-500/30'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>✨</div>
              <h3 className={`text-base sm:text-lg font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>AI Insights</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className={`p-2.5 sm:p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-white'
              }`}>
                <p className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Your spending has decreased by <span className={`font-medium ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>15%</span> compared to last month. Great job!
                </p>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-white'
              }`}>
                <p className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Consider investing <span className={`font-medium ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>$500</span> more this month to reach your savings goal.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Back to Chat Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onBack}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </motion.button>
    </motion.div>
  )
}