'use client'

import { motion } from 'framer-motion'
import {
  LightBulbIcon,
  TrendingUpIcon,
  ExclamationIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/outline'
import { useEffect, useState } from 'react'

interface Insight {
  id: string
  type: 'tip' | 'warning' | 'success' | 'trend'
  title: string
  description: string
  impact?: string
  action?: string
  priority: 'low' | 'medium' | 'high'
}

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI-generated insights
    const timer = setTimeout(() => {
      setInsights([
        {
          id: '1',
          type: 'warning',
          title: 'Unusual Spending Pattern Detected',
          description: 'Your entertainment spending is 45% higher than your 3-month average',
          impact: 'Could save $234/month',
          action: 'Review subscriptions',
          priority: 'high'
        },
        {
          id: '2',
          type: 'success',
          title: 'Savings Goal On Track',
          description: 'You\'re ahead of schedule for your vacation fund by 2 weeks',
          impact: '+$500 saved',
          action: 'Keep it up!',
          priority: 'low'
        },
        {
          id: '3',
          type: 'tip',
          title: 'Investment Opportunity',
          description: 'Based on your cash flow, you could invest an additional $1,000/month',
          impact: 'Potential 8% annual return',
          action: 'Explore options',
          priority: 'medium'
        },
        {
          id: '4',
          type: 'trend',
          title: 'Grocery Costs Rising',
          description: 'Your grocery spending has increased 12% over the last 3 months',
          impact: '-$150/month',
          action: 'Compare prices',
          priority: 'medium'
        }
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'tip': return LightBulbIcon
      case 'warning': return ExclamationIcon
      case 'success': return CheckCircleIcon
      case 'trend': return TrendingUpIcon
    }
  }

  const getColor = (type: Insight['type']) => {
    switch (type) {
      case 'tip': return 'from-blue-500 to-cyan-500'
      case 'warning': return 'from-yellow-500 to-orange-500'
      case 'success': return 'from-green-500 to-emerald-500'
      case 'trend': return 'from-purple-500 to-pink-500'
    }
  }

  const getPriorityColor = (priority: Insight['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
    }
  }

  return (
    <div className="floating-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">AI Insights</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          Refresh
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = getIcon(insight.type)
            const gradient = getColor(insight.type)

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r p-[1px] from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 hover:from-blue-400 hover:to-purple-400 transition-all duration-300"
              >
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
                      <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm">{insight.title}</h3>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`} />
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {insight.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {insight.impact && (
                            <div className="flex items-center gap-1">
                              {insight.impact.startsWith('+') ? (
                                <ArrowUpIcon className="w-3 h-3 text-green-500" />
                              ) : (
                                <ArrowDownIcon className="w-3 h-3 text-red-500" />
                              )}
                              <span className="text-xs font-medium">
                                {insight.impact}
                              </span>
                            </div>
                          )}
                        </div>

                        {insight.action && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`text-xs font-medium bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                          >
                            {insight.action} →
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="w-4 h-4 text-purple-500" />
          <p className="text-sm font-medium">AI Analysis Summary</p>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Based on your spending patterns, you could save up to <span className="font-bold text-green-500">$384/month</span> by optimizing subscriptions and reducing discretionary spending.
        </p>
      </motion.div>
    </div>
  )
}