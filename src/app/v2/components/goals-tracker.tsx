'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  FlagIcon,
  HomeIcon,
  GlobeIcon,
  AcademicCapIcon,
  CashIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/outline'

interface Goal {
  id: string
  name: string
  target: number
  current: number
  deadline: string
  icon: any
  color: string
  category: string
}

export function GoalsTracker() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)

  useEffect(() => {
    // Mock goals data
    setGoals([
      {
        id: '1',
        name: 'Emergency Fund',
        target: 10000,
        current: 7234,
        deadline: '2024-06-30',
        icon: CashIcon,
        color: 'from-green-500 to-emerald-500',
        category: 'savings'
      },
      {
        id: '2',
        name: 'Dream Vacation',
        target: 5000,
        current: 2100,
        deadline: '2024-12-31',
        icon: GlobeIcon,
        color: 'from-blue-500 to-cyan-500',
        category: 'travel'
      },
      {
        id: '3',
        name: 'Home Down Payment',
        target: 50000,
        current: 15000,
        deadline: '2025-12-31',
        icon: HomeIcon,
        color: 'from-purple-500 to-pink-500',
        category: 'property'
      },
      {
        id: '4',
        name: 'Kids Education',
        target: 30000,
        current: 8500,
        deadline: '2028-09-01',
        icon: AcademicCapIcon,
        color: 'from-orange-500 to-red-500',
        category: 'education'
      }
    ])
  }, [])

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [mounted])

  const calculateMonthsLeft = (deadline: string) => {
    // Return a placeholder during SSR to avoid hydration mismatch
    if (!mounted) return 0

    const now = new Date()
    const deadlineDate = new Date(deadline)
    const months = (deadlineDate.getFullYear() - now.getFullYear()) * 12 +
                  (deadlineDate.getMonth() - now.getMonth())
    return Math.max(months, 0)
  }

  const getAISuggestion = (goal: Goal) => {
    const progress = calculateProgress(goal.current, goal.target)
    const monthsLeft = calculateMonthsLeft(goal.deadline)
    const monthlyRequired = monthsLeft > 0 ? (goal.target - goal.current) / monthsLeft : 0

    if (progress >= 100) return 'Goal achieved! 🎉'
    if (progress >= 75) return `Almost there! Save $${monthlyRequired.toFixed(0)}/month to finish on time`
    if (progress >= 50) return `Great progress! Maintain $${monthlyRequired.toFixed(0)}/month pace`
    return `Need to save $${monthlyRequired.toFixed(0)}/month to reach goal`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="floating-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FlagIcon className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold">Financial Goals</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Goal
          </motion.button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">4</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active Goals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">$33,034</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">62%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Average Progress</p>
          </div>
        </div>

        {/* AI Recommendation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
            <p className="text-xs font-medium">AI Recommendation</p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Focus on your Emergency Fund - you{`'`}re 72% complete! Allocate an extra $200/month to finish 3 months early.
          </p>
        </motion.div>
      </div>

      {/* Goals Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon
          const progress = calculateProgress(goal.current, goal.target)
          const monthsLeft = calculateMonthsLeft(goal.deadline)
          const aiSuggestion = getAISuggestion(goal)

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="floating-card p-5"
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-r ${goal.color} bg-opacity-10`}>
                    <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {monthsLeft} months left
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold">{progress.toFixed(0)}%</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${goal.color} rounded-full`}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="font-medium">
                    ${goal.current.toLocaleString()}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ${goal.target.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <SparklesIcon className="w-3 h-3 inline mr-1 text-purple-500" />
                  {aiSuggestion}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add Goal Modal (placeholder) */}
      {showAddGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="floating-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Goal</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Goal creation form would go here...
          </p>
          <button
            onClick={() => setShowAddGoal(false)}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm"
          >
            Cancel
          </button>
        </motion.div>
      )}
    </div>
  )
}