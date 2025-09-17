'use client'

import { motion } from 'framer-motion'
import { CreditCardIcon, CashIcon, ChartBarIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const accountTypes = [
  { id: 'checking', name: 'Checking', icon: CashIcon, color: 'from-blue-500 to-cyan-500' },
  { id: 'savings', name: 'Savings', icon: CashIcon, color: 'from-green-500 to-emerald-500' },
  { id: 'credit', name: 'Credit Card', icon: CreditCardIcon, color: 'from-purple-500 to-pink-500' },
  { id: 'investment', name: 'Investment', icon: ChartBarIcon, color: 'from-orange-500 to-red-500' },
]

export function AccountCards({ detailed = false }: { detailed?: boolean }) {
  const { accounts } = useSelector((state: RootState) => state.user)

  // Use the centralized demo data instead of hardcoded mock data
  const displayAccounts = accounts?.length > 0 ? accounts : []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Accounts</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-blue-500 hover:text-blue-600"
        >
          <PlusCircleIcon className="w-6 h-6" />
        </motion.button>
      </div>

      <div className={`grid gap-4 ${detailed ? 'lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {displayAccounts.slice(0, detailed ? undefined : 4).map((account: any, index: number) => {
          const type = accountTypes.find(t => t.id === account.type) || accountTypes[0]
          const Icon = type.icon

          return (
            <motion.div
              key={account.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="floating-card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${type.color} bg-opacity-10`}>
                  <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  account.change >= 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {account.change >= 0 ? '+' : ''}{account.change}%
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {account.name}
                </p>
                <p className="text-2xl font-bold">
                  ${Math.abs(account.balance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>

              {detailed && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Available</span>
                    <span className="font-medium">
                      ${(Math.abs(account.balance) * 0.9).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Pending</span>
                    <span className="font-medium">
                      ${(Math.abs(account.balance) * 0.1).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {!detailed && displayAccounts.length > 4 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 text-center text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          View all {displayAccounts.length} accounts →
        </motion.button>
      )}
    </div>
  )
}