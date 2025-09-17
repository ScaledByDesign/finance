'use client'

import { motion } from 'framer-motion'
import { TrendingUpIcon, TrendingDownIcon, CashIcon, CreditCardIcon } from '@heroicons/react/outline'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useEffect, useState } from 'react'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function QuickStats() {
  const { kpis } = useSelector((state: RootState) => state.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const stats = [
    {
      title: 'Total Balance',
      value: kpis?.[0]?.metric || 0,
      change: kpis?.[0] ? ((kpis[0].metric - kpis[0].metricPrev) / kpis[0].metricPrev * 100).toFixed(1) : '0',
      icon: CashIcon,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Monthly Spending',
      value: kpis?.[1]?.metric || 0,
      change: kpis?.[1] ? ((kpis[1].metric - kpis[1].metricPrev) / kpis[1].metricPrev * 100).toFixed(1) : '0',
      icon: CreditCardIcon,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Daily Average',
      value: kpis?.[2]?.metric || 0,
      change: kpis?.[2] ? ((kpis[2].metric - kpis[2].metricPrev) / kpis[2].metricPrev * 100).toFixed(1) : '0',
      icon: TrendingUpIcon,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Accounts',
      value: kpis?.[3]?.metric || 0,
      change: '0',
      icon: CashIcon,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
      isCount: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="floating-card p-4 lg:p-6 relative overflow-hidden group cursor-pointer"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

          {/* Icon */}
          <div className={`${stat.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
            <stat.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </div>

          {/* Stats */}
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            <p className="text-2xl lg:text-3xl font-bold">
              {stat.isCount ? stat.value : formatCurrency(stat.value)}
            </p>
            {stat.change && stat.change !== '0' && (
              <div className="flex items-center gap-1">
                {parseFloat(stat.change) > 0 ? (
                  <TrendingUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${parseFloat(stat.change) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(parseFloat(stat.change))}%
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}