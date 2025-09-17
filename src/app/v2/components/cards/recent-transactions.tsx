'use client'

import { motion } from 'framer-motion'
import {
  ShoppingBagIcon,
  HomeIcon,
  FilmIcon,
  ShoppingCartIcon,
  TruckIcon,
  CreditCardIcon,
  CashIcon,
  OfficeBuildingIcon,
  GiftIcon
} from '@heroicons/react/outline'
import { Transaction } from '../../hooks/useTransactions'

// Icon mapping for different categories
const getCategoryIcon = (category: string[] | undefined, personalCategory?: any) => {
  const primaryCategory = personalCategory?.primary || category?.[0] || ''

  switch (primaryCategory.toUpperCase()) {
    case 'FOOD_AND_DRINK':
    case 'GROCERIES':
      return ShoppingCartIcon
    case 'ENTERTAINMENT':
      return FilmIcon
    case 'TRANSPORTATION':
    case 'TRAVEL':
      return TruckIcon
    case 'SHOPS':
    case 'SHOPPING':
      return ShoppingBagIcon
    case 'SERVICE':
    case 'BANK_FEES':
      return CreditCardIcon
    case 'TRANSFER':
    case 'DEPOSIT':
      return CashIcon
    case 'BILLS':
    case 'RENT':
      return OfficeBuildingIcon
    default:
      return GiftIcon
  }
}

const getCategoryColor = (category: string[] | undefined, personalCategory?: any) => {
  const primaryCategory = personalCategory?.primary || category?.[0] || ''

  switch (primaryCategory.toUpperCase()) {
    case 'FOOD_AND_DRINK':
    case 'GROCERIES':
      return 'text-green-500'
    case 'ENTERTAINMENT':
      return 'text-purple-500'
    case 'TRANSPORTATION':
    case 'TRAVEL':
      return 'text-yellow-500'
    case 'SHOPS':
    case 'SHOPPING':
      return 'text-orange-500'
    case 'TRANSFER':
    case 'DEPOSIT':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}

const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === now.toDateString()) {
    return 'Today'
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Default demo transactions for when no data is available
const demoTransactions = [
  {
    id: 1,
    name: 'Whole Foods Market',
    category: 'groceries',
    amount: -124.56,
    date: 'Today',
    time: '2:30 PM',
    icon: ShoppingCartIcon,
    color: 'text-green-500',
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
  },
]

interface RecentTransactionsProps {
  isDarkMode?: boolean
  transactions?: Transaction[]
  loading?: boolean
  detailed?: boolean
}

export function RecentTransactions({ isDarkMode = true, transactions: propsTransactions, loading = false }: RecentTransactionsProps) {
  // Use props transactions if available, otherwise use demo data
  const displayTransactions = propsTransactions && propsTransactions.length > 0
    ? propsTransactions.map((t, idx) => ({
        id: t.id || idx,
        name: t.merchant_name || t.name,
        category: t.category,
        personalCategory: t.personal_finance_category,
        amount: t.amount,
        date: formatDate(t.date),
        time: formatTime(t.date),
        icon: getCategoryIcon(t.category, t.personal_finance_category),
        color: getCategoryColor(t.category, t.personal_finance_category),
      }))
    : demoTransactions
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`rounded-xl p-4 sm:p-6 ${
        isDarkMode
          ? 'bg-gray-900/50 border border-gray-800'
          : 'bg-white border border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className={`text-base sm:text-lg font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Recent Transactions</h3>
        <button className="text-xs sm:text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {loading ? (
          <div className={`text-center py-4 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading transactions...
          </div>
        ) : displayTransactions.map((transaction, index) => {
          const Icon = transaction.icon
          const isIncome = transaction.amount > 0

          return (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all cursor-pointer group ${
                isDarkMode
                  ? 'hover:bg-gray-800/50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-800/50 group-hover:bg-gray-800'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${transaction.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium text-xs sm:text-sm truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {transaction.name}
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {transaction.date} • {transaction.time}
                    </p>
                  </div>
                  <p className={`font-semibold text-xs sm:text-sm whitespace-nowrap ${
                    isIncome
                      ? isDarkMode ? 'text-green-500' : 'text-green-600'
                      : isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
