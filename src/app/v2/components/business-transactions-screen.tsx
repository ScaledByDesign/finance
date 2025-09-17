'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CashIcon,
  ChartBarIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  PlusIcon,
  CalendarIcon,
  BriefcaseIcon,
  UsersIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  RefreshIcon
} from '@heroicons/react/outline'
import { useTransactions, type Transaction } from '../hooks/useTransactions'
import { formatCurrency } from '@/utils/currency'

interface BusinessTransactionsScreenProps {
  onBack?: () => void
  isDarkMode?: boolean
  onToggleTheme?: () => void
}

const BusinessTransactionsScreen: React.FC<BusinessTransactionsScreenProps> = ({
  onBack = () => window.history.back(),
  isDarkMode = false,
  onToggleTheme = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('30d')

  // Use the custom hook to fetch transactions
  const {
    transactions: rawTransactions,
    totalCount,
    loading,
    error,
    filter,
    updateFilter,
    refresh
  } = useTransactions({
    pageSize: 100,
    selectedPaymentChannel: 'all'
  })

  // Calculate metrics
  const metrics = useMemo(() => {
    const income = rawTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expenses = rawTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const netIncome = income - expenses
    const avgTransaction = rawTransactions.length > 0
      ? (income + expenses) / rawTransactions.length
      : 0

    return { income, expenses, netIncome, avgTransaction }
  }, [rawTransactions])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter((t) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!t.name?.toLowerCase().includes(searchLower) &&
            !t.merchant_name?.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      if (selectedFilter !== 'all') {
        const isIncome = t.amount < 0
        if (selectedFilter === 'income' && !isIncome) return false
        if (selectedFilter === 'expense' && isIncome) return false
      }
      return true
    })
  }, [rawTransactions, searchTerm, selectedFilter])

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    const groups: { [key: string]: Transaction[] } = {}
    sorted.forEach((transaction) => {
      const date = new Date(transaction.date)
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(transaction)
    })

    return groups
  }, [filteredTransactions])

  // Remove local formatCurrency function - using centralized one

  const getCategoryIcon = (category: string[]) => {
    const mainCategory = category?.[0]?.toLowerCase() || ''

    if (mainCategory.includes('payroll')) return UsersIcon
    if (mainCategory.includes('software')) return CreditCardIcon
    if (mainCategory.includes('marketing')) return TrendingUpIcon
    if (mainCategory.includes('travel')) return ShoppingBagIcon
    if (mainCategory.includes('office')) return BriefcaseIcon
    return CashIcon
  }

  const stats = [
    {
      title: 'Total Income',
      value: formatCurrency(metrics.income),
      change: '+12.5%',
      trend: 'up' as const,
      icon: ArrowDownIcon,
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(metrics.expenses),
      change: '-3.2%',
      trend: 'down' as const,
      icon: ArrowUpIcon,
    },
    {
      title: 'Net Income',
      value: formatCurrency(metrics.netIncome),
      change: metrics.netIncome > 0 ? '+8.4%' : '-5.1%',
      trend: metrics.netIncome > 0 ? 'up' as const : 'down' as const,
      icon: CashIcon,
    },
    {
      title: 'Avg Transaction',
      value: formatCurrency(metrics.avgTransaction),
      change: '+2.1%',
      trend: 'up' as const,
      icon: ChartBarIcon,
    },
  ]

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
              }`}>Business Transactions</h1>
              <p className={`mt-1 text-sm sm:text-base ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Manage your business finances</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-sm sm:text-base w-full sm:w-64 ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-800 text-white placeholder-gray-400'
                    : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Filter */}
            <button className={`p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <FilterIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Download */}
            <button className={`p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}>
              <DownloadIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Refresh Button */}
            <button
              onClick={refresh}
              disabled={loading}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:border-blue-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                loading ? 'animate-spin' : ''
              } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Add Transaction */}
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base">
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </div>
      </header>

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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Transactions List - 2 columns */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl ${
              isDarkMode
                ? 'bg-gray-900/50 border border-gray-800'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            {/* Filter Tabs & Time Range */}
            <div className={`p-4 sm:p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2">
                  {['all', 'income', 'expense'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all capitalize ${
                        selectedFilter === filter
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-800/50 text-gray-400 hover:text-white'
                            : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Time Range Selector */}
                <div className={`flex rounded-lg p-1 ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  {['7d', '30d', '90d', '1y'].map((range) => (
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
            </div>

            {/* Transactions */}
            <div className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <div key={date}>
                  <div className={`px-4 sm:px-6 py-2 sm:py-3 ${
                    isDarkMode ? 'bg-gray-900/30' : 'bg-gray-50'
                  }`}>
                    <p className={`text-xs sm:text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>{date}</p>
                  </div>
                  {transactions.map((transaction, index) => {
                    const isIncome = transaction.amount < 0
                    const Icon = getCategoryIcon(transaction.category)

                    return (
                      <motion.div
                        key={`${date}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-4 sm:px-6 py-3 sm:py-4 hover:bg-opacity-50 transition-all cursor-pointer ${
                          isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`p-2 sm:p-2.5 rounded-lg ${
                              isIncome
                                ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                                : isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                            }`}>
                              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                isIncome
                                  ? isDarkMode ? 'text-green-500' : 'text-green-600'
                                  : isDarkMode ? 'text-red-500' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className={`text-sm sm:text-base font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{transaction.merchant_name || transaction.name}</p>
                              <p className={`text-xs sm:text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>{transaction.category?.[0] || 'Uncategorized'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm sm:text-base font-semibold ${
                              isIncome
                                ? isDarkMode ? 'text-green-500' : 'text-green-600'
                                : isDarkMode ? 'text-red-500' : 'text-red-600'
                            }`}>
                              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            {transaction.pending && (
                              <span className={`text-xs ${
                                isDarkMode ? 'text-amber-400' : 'text-amber-600'
                              }`}>Pending</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {Object.keys(groupedTransactions).length === 0 && (
              <div className="p-8 sm:p-12 text-center">
                <DocumentTextIcon className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-base sm:text-lg font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>No transactions found</p>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>Try adjusting your filters or search term</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl p-4 sm:p-6 ${
              isDarkMode
                ? 'bg-gray-900/50 border border-gray-800'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <h3 className={`text-base sm:text-lg font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Quick Actions</h3>
            <div className="space-y-2">
              <button className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                isDarkMode
                  ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Generate Report</span>
                  <ChartBarIcon className="w-4 h-4" />
                </div>
              </button>
              <button className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                isDarkMode
                  ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Export Data</span>
                  <DownloadIcon className="w-4 h-4" />
                </div>
              </button>
              <button className={`w-full px-4 py-2.5 rounded-lg text-left transition-all ${
                isDarkMode
                  ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Schedule Payment</span>
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </button>
            </div>
          </motion.div>

          {/* Category Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl p-4 sm:p-6 ${
              isDarkMode
                ? 'bg-gray-900/50 border border-gray-800'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <h3 className={`text-base sm:text-lg font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Categories</h3>
            <div className="space-y-3">
              {['Payroll', 'Software', 'Marketing', 'Office'].map((category) => {
                const spent = rawTransactions
                  .filter((t: Transaction) =>
                    t.category?.some(c => c.toLowerCase().includes(category.toLowerCase()))
                  )
                  .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0)

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{category}</span>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{formatCurrency(spent)}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min((spent / 5000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                  Software expenses increased by <span className={`font-medium ${
                    isDarkMode ? 'text-amber-400' : 'text-amber-600'
                  }`}>18%</span> this month. Consider reviewing subscriptions.
                </p>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-900/50' : 'bg-white'
              }`}>
                <p className={`text-xs sm:text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payroll efficiency improved. Processing cost down <span className={`font-medium ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>8%</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default BusinessTransactionsScreen