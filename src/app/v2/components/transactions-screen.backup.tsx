'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
  CreditCardIcon
} from '@heroicons/react/outline'

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

export function TransactionsScreen({ onBack, isDarkMode, onToggleTheme }: TransactionsScreenProps) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const transactions: Transaction[] = [
    {
      id: 1,
      name: 'Whole Foods Market',
      category: 'groceries',
      amount: -124.56,
      date: 'Today',
      time: '2:30 PM',
      icon: ShoppingCartIcon,
      color: 'text-green-500',
      description: 'Weekly grocery shopping'
    },
    {
      id: 2,
      name: 'Netflix Subscription',
      category: 'entertainment',
      amount: -15.99,
      date: 'Yesterday',
      time: '12:00 AM',
      icon: FilmIcon,
      color: 'text-purple-500',
      description: 'Monthly subscription'
    },
    {
      id: 3,
      name: 'Salary Deposit',
      category: 'income',
      amount: 3500.00,
      date: 'Jan 13',
      time: '9:00 AM',
      icon: CreditCardIcon,
      color: 'text-blue-500',
      description: 'Bi-weekly salary'
    },
    {
      id: 4,
      name: 'Uber Ride',
      category: 'transport',
      amount: -23.45,
      date: 'Jan 13',
      time: '7:45 PM',
      icon: TruckIcon,
      color: 'text-yellow-500',
      description: 'Trip to downtown'
    },
    {
      id: 5,
      name: 'Amazon Purchase',
      category: 'shopping',
      amount: -87.32,
      date: 'Jan 12',
      time: '3:20 PM',
      icon: ShoppingBagIcon,
      color: 'text-orange-500',
      description: 'Electronics and books'
    },
    {
      id: 6,
      name: 'Rent Payment',
      category: 'housing',
      amount: -1200.00,
      date: 'Jan 10',
      time: '10:00 AM',
      icon: HomeIcon,
      color: 'text-red-500',
      description: 'Monthly rent'
    },
    {
      id: 7,
      name: 'Freelance Project',
      category: 'income',
      amount: 850.00,
      date: 'Jan 8',
      time: '2:15 PM',
      icon: CreditCardIcon,
      color: 'text-blue-500',
      description: 'Web design project'
    },
    {
      id: 8,
      name: 'Gas Station',
      category: 'transport',
      amount: -45.20,
      date: 'Jan 7',
      time: '8:30 AM',
      icon: TruckIcon,
      color: 'text-yellow-500',
      description: 'Fuel refill'
    }
  ]

  const categories = ['all', 'income', 'groceries', 'entertainment', 'transport', 'shopping', 'housing']

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
      <header className="mb-6 sm:mb-8">
        <div className="flex items-center gap-4 mb-4">
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
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Transactions</h1>
            <p className={`mt-1 text-sm sm:text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Your transaction history</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
              +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
      <div className="space-y-3">
        {filteredTransactions.map((transaction, index) => {
          const Icon = transaction.icon
          const isIncome = transaction.amount > 0

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl p-4 transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
                  : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800/50 group-hover:bg-gray-800'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon className={`w-6 h-6 ${transaction.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-semibold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {transaction.name}
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {transaction.description}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {transaction.date} • {transaction.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xl ${
                        isIncome
                          ? isDarkMode ? 'text-green-500' : 'text-green-600'
                          : isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      <p className={`text-sm capitalize ${
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
      {filteredTransactions.length === 0 && (
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