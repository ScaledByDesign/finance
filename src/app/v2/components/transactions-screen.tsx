'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  ArrowLeftIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  ShoppingBagIcon,
  HomeIcon,
  FilmIcon,
  ShoppingCartIcon,
  TruckIcon,
  CreditCardIcon,
  RefreshIcon
} from '@heroicons/react/outline'
import { RootState, AppDispatch } from '@/store'
import { allTransactionSync } from '@/store/actions/useTransaction'
import { getPaymentTransaction } from '@/store/actions/useTransaction'
import { formatCurrency } from '@/utils/currency'

interface TransactionsScreenProps {
  onBack: () => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

interface Transaction {
  id: number
  name: string
  category: string
  amount: number
  date: string
  time: string
  icon: any
  color: string
  description?: string
}

interface PlaidTransaction {
  id: number
  name: string
  amount: number
  date: string
  category: string[]
  merchant_name?: string
  payment_channel: string
  personal_finance_category?: {
    primary: string
    detailed: string
  }
  account_id: string
}

export function TransactionsScreen({ onBack, isDarkMode, onToggleTheme }: TransactionsScreenProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [localTransactionData, setLocalTransactionData] = useState<{size: number, data: any[]}>({size: 0, data: []})

  // Get transaction data from Redux store (fallback)
  const { data: plaidTransactions = [], isTransactionsLoaded } = useSelector((state: RootState) => state.plaid)
  const transactionData = useSelector((state: RootState) => state.transactions)

  // Debug logging
  console.log('Transaction Screen Debug:', {
    plaidTransactions,
    isTransactionsLoaded,
    transactionData,
    localTransactionData,
    plaidLength: plaidTransactions?.length || 0,
    transactionDataLength: transactionData?.data?.length || 0,
    localTransactionDataLength: localTransactionData?.data?.length || 0
  })

  const loadTransactions = useCallback(async () => {
    console.log('loadTransactions called')
    setIsLoading(true)
    try {
      // Try multiple approaches to get transaction data

      // Approach 1: Try the sync endpoint first
      console.log('1. Trying allTransactionSync...')
      await dispatch(allTransactionSync())

      // Approach 2: Try the payment transaction endpoint
      const defaultFilter = {
        currentPage: 1,
        pageSize: 100,
        filterDate: {},
        merchantName: "",
        priceRange: { minPrice: "", maxPrice: "" },
        selectedAccounts: [],
        selectedCategories: [],
        selectedPaymentChannel: "all",
        selectedFinCategories: []
      }
      console.log('2. Dispatching getPaymentTransaction with filter:', defaultFilter)
      const result = await dispatch(getPaymentTransaction(defaultFilter, false))
      console.log('getPaymentTransaction result:', result)

      // Approach 3: Direct API call as fallback
      console.log('3. Trying direct API call...')
      try {
        const response = await fetch('/api/v1/transaction/getData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filter: defaultFilter }),
        })
        const data = await response.json()
        console.log('Direct API call result:', data)

        // Save to local state
        if (data && data.size !== undefined) {
          setLocalTransactionData(data)
          console.log('Saved transaction data to local state:', data.size, 'transactions')
        }
      } catch (apiError) {
        console.error('Direct API call failed:', apiError)
      }

    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  // Load transactions on component mount
  useEffect(() => {
    console.log('useEffect triggered - loading transactions')
    // Always try to load transactions on mount
    loadTransactions()
  }, [loadTransactions])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Sync all transactions from Plaid
      await dispatch(allTransactionSync())
      // Reload transaction data
      await loadTransactions()
    } catch (error) {
      console.error('Failed to refresh transactions:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Helper function to get category icon and color
  const getCategoryIconAndColor = (category: string[], personalFinanceCategory?: { primary: string }) => {
    const primaryCategory = personalFinanceCategory?.primary || category?.[0] || 'other'

    const categoryMappings: Record<string, { icon: any; color: string }> = {
      'Food and Drink': { icon: ShoppingCartIcon, color: 'text-green-500' },
      'FOOD_AND_DRINK': { icon: ShoppingCartIcon, color: 'text-green-500' },
      'groceries': { icon: ShoppingCartIcon, color: 'text-green-500' },
      'restaurants': { icon: ShoppingCartIcon, color: 'text-green-500' },

      'Transportation': { icon: TruckIcon, color: 'text-yellow-500' },
      'TRANSPORTATION': { icon: TruckIcon, color: 'text-yellow-500' },
      'transport': { icon: TruckIcon, color: 'text-yellow-500' },

      'Shops': { icon: ShoppingBagIcon, color: 'text-orange-500' },
      'GENERAL_MERCHANDISE': { icon: ShoppingBagIcon, color: 'text-orange-500' },
      'shopping': { icon: ShoppingBagIcon, color: 'text-orange-500' },

      'Recreation': { icon: FilmIcon, color: 'text-purple-500' },
      'ENTERTAINMENT': { icon: FilmIcon, color: 'text-purple-500' },
      'entertainment': { icon: FilmIcon, color: 'text-purple-500' },

      'Transfer': { icon: CreditCardIcon, color: 'text-blue-500' },
      'TRANSFER_IN': { icon: CreditCardIcon, color: 'text-blue-500' },
      'TRANSFER_OUT': { icon: CreditCardIcon, color: 'text-blue-500' },
      'income': { icon: CreditCardIcon, color: 'text-blue-500' },

      'Service': { icon: HomeIcon, color: 'text-red-500' },
      'HOME_IMPROVEMENT': { icon: HomeIcon, color: 'text-red-500' },
      'housing': { icon: HomeIcon, color: 'text-red-500' },
      'rent': { icon: HomeIcon, color: 'text-red-500' }
    }

    return categoryMappings[primaryCategory] || categoryMappings[category?.[0]] || { icon: CreditCardIcon, color: 'text-gray-500' }
  }

  // Transform Plaid transactions to v2 interface
  const transformPlaidToV2Transaction = (plaidTx: any): Transaction => {
    const { icon, color } = getCategoryIconAndColor(plaidTx.category, plaidTx.personal_finance_category)
    const date = new Date(plaidTx.date)
    const isToday = date.toDateString() === new Date().toDateString()
    const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString()

    let dateDisplay: string
    if (isToday) dateDisplay = 'Today'
    else if (isYesterday) dateDisplay = 'Yesterday'
    else dateDisplay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return {
      id: plaidTx.id,
      name: plaidTx.merchant_name || plaidTx.name,
      category: plaidTx.personal_finance_category?.primary || plaidTx.category?.[0] || 'other',
      amount: plaidTx.amount,
      date: dateDisplay,
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      icon,
      color,
      description: plaidTx.category?.join(', ') || 'Transaction'
    }
  }

  // Get transactions from store data
  const getTransactions = (): Transaction[] => {
    // Priority: localTransactionData > Redux transactionData > Redux plaidTransactions
    const rawTransactions = localTransactionData?.data?.length > 0
      ? localTransactionData.data
      : transactionData?.data?.length > 0
        ? transactionData.data
        : plaidTransactions

    console.log('getTransactions raw data:', {
      rawTransactions,
      hasLocalTransactionData: localTransactionData?.data?.length > 0,
      hasTransactionData: transactionData?.data?.length > 0,
      hasPlaidTransactions: plaidTransactions?.length > 0,
      localTransactionCount: localTransactionData?.data?.length || 0
    })

    if (!rawTransactions || rawTransactions.length === 0) {
      // Return demo transactions for debugging if no real data
      console.log('No real transactions, returning demo data')
      return [
        {
          id: 1,
          name: 'Sample Transaction',
          category: 'demo',
          amount: -25.50,
          date: 'Today',
          time: '2:30 PM',
          icon: CreditCardIcon,
          color: 'text-blue-500',
          description: 'Demo transaction for testing'
        }
      ]
    }

    const transformedTransactions = rawTransactions.map(transformPlaidToV2Transaction)
    console.log('Transformed transactions:', transformedTransactions)
    return transformedTransactions
  }

  const transactions = getTransactions()

  // Dynamic categories based on actual transaction data
  const getDynamicCategories = () => {
    const uniqueCategories = new Set<string>()
    transactions.forEach(tx => {
      if (tx.category && tx.category !== 'other') {
        uniqueCategories.add(tx.category)
      }
    })
    return ['all', ...Array.from(uniqueCategories).sort()]
  }

  const categories = getDynamicCategories()

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.category === filter
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen p-3 sm:p-4 lg:p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-black' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <header className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-white border-gray-300 hover:border-blue-500 shadow-sm'
              }`}
            >
              <ArrowLeftIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Transactions</h1>
              <p className={`mt-0.5 text-xs sm:text-base ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {isLoading ? 'Loading...' : `${transactions.length} transactions`}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className={`p-2 border rounded-lg transition-colors ${
              refreshing || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-white border-gray-300 hover:border-blue-500 shadow-sm'
            }`}
            title="Refresh transactions"
          >
            <RefreshIcon className={`w-5 h-5 ${
              refreshing ? 'animate-spin' : ''
            } ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 ${
              isDarkMode
                ? 'bg-green-600/20 border border-green-500/30'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <p className={`text-sm mb-1 ${
              isDarkMode ? 'text-green-400' : 'text-green-700'
            }`}>Total Income</p>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              +{formatCurrency(totalIncome)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl p-4 ${
              isDarkMode
                ? 'bg-red-600/20 border border-red-500/30'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p className={`text-sm mb-1 ${
              isDarkMode ? 'text-red-400' : 'text-red-700'
            }`}>Total Expenses</p>
            <p className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <DownloadIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === category
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-900/50 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Transactions List */}
      <div className="space-y-3 pb-16">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 animate-pulse ${
                  isDarkMode
                    ? 'bg-gray-900/50 border border-gray-800'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex-1">
                    <div className={`h-4 rounded mb-2 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                    }`} style={{ width: `${60 + Math.random() * 30}%` }}></div>
                    <div className={`h-3 rounded ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                    }`} style={{ width: `${40 + Math.random() * 20}%` }}></div>
                  </div>
                  <div className={`h-6 w-20 rounded ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.map((transaction, index) => {
          const Icon = transaction.icon
          const isIncome = transaction.amount > 0

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl p-3 sm:p-4 transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                  : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-3 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800/50 group-hover:bg-gray-800'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${transaction.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-semibold text-base sm:text-lg truncate ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {transaction.name}
                      </p>
                      <p className={`hidden sm:block text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {transaction.description}
                      </p>
                      <p className={`text-xs mt-0.5 sm:mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {transaction.date} • {transaction.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg sm:text-xl ${
                        isIncome
                          ? isDarkMode ? 'text-green-500' : 'text-green-600'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className={`text-xs sm:text-sm capitalize ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {!isLoading && filteredTransactions.length === 0 && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <SearchIcon className={`w-8 h-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>No transactions found</h3>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}

      {/* No transactions at all */}
      {!isLoading && transactions.length === 1 && transactions[0].name === 'Sample Transaction' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <CreditCardIcon className={`w-8 h-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Ready to sync transactions</h3>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your accounts are connected. Click below to sync your transaction history.
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
          >
            <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing Transactions...' : 'Sync Transactions from Plaid'}
          </button>
        </motion.div>
      )}

      {/* Back to Chat Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onBack}
        className="fixed bottom-4 right-4 p-3 sm:bottom-6 sm:right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>
    </motion.div>
  )
}
