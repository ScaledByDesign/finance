'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  ExclamationIcon,
  LightBulbIcon,
  TrendingUpIcon,
  CheckIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/outline'

interface InsightsScreenProps {
  onBack: () => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

interface Recommendation {
  id: number
  type: 'alert' | 'advice' | 'insight'
  icon: any
  color: string
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  actionText?: string
  details: string
}

interface ActivityLogEntry {
  id: number
  action: 'approved' | 'dismissed' | 'executed'
  recommendation: Recommendation
  timestamp: Date
}

type ViewMode = 'recommendations' | 'activity' | 'confirmation'

export function InsightsScreen({ onBack, isDarkMode, onToggleTheme }: InsightsScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissedItems, setDismissedItems] = useState<number[]>([])
  const [approvedItems, setApprovedItems] = useState<number[]>([])
  const [executedItems, setExecutedItems] = useState<number[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('recommendations')
  const [dragX, setDragX] = useState(0)
  const [rowDragX, setRowDragX] = useState<{ [key: number]: number }>({})
  const constraintsRef = useRef(null)

  const allRecommendations: Recommendation[] = [
    {
      id: 1,
      type: 'alert',
      icon: ExclamationIcon,
      color: 'text-red-400',
      title: 'High Spending Alert',
      message: 'Your groceries spending is 25% above average this month.',
      priority: 'high',
      actionText: 'Set Budget Limit',
      details: 'You\'ve spent $1,050 on groceries this month compared to your usual $840. Consider setting a weekly budget of $210 to stay on track.'
    },
    {
      id: 2,
      type: 'advice',
      icon: LightBulbIcon,
      color: 'text-yellow-400',
      title: 'Investment Opportunity',
      message: 'You have $2,000 in checking. Consider moving $500 to investments.',
      priority: 'medium',
      actionText: 'Transfer to Investment',
      details: 'Moving $500 to your investment account could earn you approximately $35-50 annually based on market averages, while keeping $1,500 for daily expenses.'
    },
    {
      id: 3,
      type: 'insight',
      icon: TrendingUpIcon,
      color: 'text-green-400',
      title: 'Savings Progress',
      message: 'Great job! You\'re ahead of your monthly savings goal by $300.',
      priority: 'low',
      actionText: 'Boost Savings Rate',
      details: 'You\'re saving $2,000/month vs your $1,700 goal. Consider increasing your target to $2,200 to build wealth faster.'
    },
    {
      id: 4,
      type: 'alert',
      icon: ExclamationIcon,
      color: 'text-orange-400',
      title: 'Subscription Review',
      message: 'You have 8 active subscriptions totaling $127/month.',
      priority: 'medium',
      actionText: 'Review Subscriptions',
      details: 'Netflix, Spotify, Adobe, GitHub Pro, Disney+, Apple iCloud, Dropbox, and Medium. Consider canceling unused services.'
    },
    {
      id: 5,
      type: 'advice',
      icon: LightBulbIcon,
      color: 'text-blue-400',
      title: 'Credit Score Boost',
      message: 'Pay down credit card to improve utilization ratio.',
      priority: 'medium',
      actionText: 'Make Extra Payment',
      details: 'Your credit utilization is at 35%. Paying down $800 would bring it to 20%, potentially improving your credit score by 10-20 points.'
    }
  ]

  const activeRecommendations = allRecommendations.filter(
    rec => !dismissedItems.includes(rec.id) && !executedItems.includes(rec.id) && !approvedItems.includes(rec.id)
  )

  const currentRecommendation = activeRecommendations[currentIndex]

  const addToActivityLog = (action: 'approved' | 'dismissed' | 'executed', recommendation: Recommendation) => {
    const logEntry: ActivityLogEntry = {
      id: Date.now(),
      action,
      recommendation,
      timestamp: new Date()
    }
    setActivityLog(prev => [logEntry, ...prev])
  }

  const handleDismiss = () => {
    if (currentRecommendation) {
      setDismissedItems(prev => [...prev, currentRecommendation.id])
      addToActivityLog('dismissed', currentRecommendation)
      if (currentIndex >= activeRecommendations.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1))
      }
    }
  }

  const handleApprove = () => {
    if (currentRecommendation) {
      setApprovedItems(prev => [...prev, currentRecommendation.id])
      addToActivityLog('approved', currentRecommendation)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
      if (currentIndex >= activeRecommendations.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1))
      }
    }
  }

  const handleExecuteFromConfirmation = (recommendationId: number) => {
    const recommendation = allRecommendations.find(r => r.id === recommendationId)
    if (recommendation) {
      setExecutedItems(prev => [...prev, recommendationId])
      setApprovedItems(prev => prev.filter(id => id !== recommendationId))
      addToActivityLog('executed', recommendation)
    }
  }

  const handleRemoveFromApproved = (recommendationId: number) => {
    setApprovedItems(prev => prev.filter(id => id !== recommendationId))
  }

  const handleExecuteAll = () => {
    approvedItems.forEach(id => {
      const recommendation = allRecommendations.find(r => r.id === id)
      if (recommendation) {
        setExecutedItems(prev => [...prev, id])
        addToActivityLog('executed', recommendation)
      }
    })
    setApprovedItems([])
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setViewMode('activity')
    }, 2000)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 150) {
      handleApprove()
    } else if (info.offset.x < -150) {
      handleDismiss()
    }
  }

  const handleRowDragEnd = (recommendationId: number, event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleExecuteFromConfirmation(recommendationId)
    } else if (info.offset.x < -100) {
      handleRemoveFromApproved(recommendationId)
    }
  }

  const nextRecommendation = () => {
    if (currentIndex < activeRecommendations.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevRecommendation = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Auto-switch to confirmation when all recommendations are reviewed and there are approved items
  useEffect(() => {
    if (activeRecommendations.length === 0 && approvedItems.length > 0 && viewMode === 'recommendations') {
      setViewMode('confirmation')
    }
  }, [activeRecommendations.length, approvedItems.length, viewMode])

  if (activeRecommendations.length === 0 && approvedItems.length === 0 && viewMode === 'recommendations') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className={`min-h-screen p-4 transition-colors duration-300 ${
          isDarkMode ? 'bg-black' : 'bg-white'
        }`}
      >
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
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
                }`}>AI Insights</h1>
                <p className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Personalized recommendations</p>
              </div>
            </div>

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
                <SunIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button> */}
          </div>
        </header>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/20 flex items-center justify-center">
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>All caught up!</h3>
          <p className={`text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>You{`'`}ve reviewed all your AI insights and recommendations.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen p-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5" />
              <span>Recommendation executed!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
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
              }`}>AI Insights</h1>
              <p className={`mt-1 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {viewMode === 'recommendations' && `${activeRecommendations.length} recommendations`}
                {viewMode === 'activity' && `${activityLog.length} activities`}
                {viewMode === 'confirmation' && `${approvedItems.length} approved items`}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className={`hidden p-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                : 'bg-gray-100 border-gray-300 hover:border-blue-500'
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* View Mode Navigation */}
        <div className="flex bg-gray-800/50 rounded-lg p-1 mt-4">
          {[
            { key: 'recommendations', label: 'Recommendations', icon: LightBulbIcon },
            { key: 'activity', label: 'Activity', icon: ClockIcon },
            { key: 'confirmation', label: 'Confirmation', icon: DocumentTextIcon },
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key as ViewMode)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === mode.key
                  ? 'bg-blue-600 text-white'
                  : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* View Content */}
      {viewMode === 'recommendations' && activeRecommendations.length > 0 && (
        <>
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentIndex + 1} of {activeRecommendations.length}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Swipe left to dismiss • Swipe right to approve
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / activeRecommendations.length) * 100}%` }}
              />
            </div>
          </div>

      {/* Main Card Container */}
      <div className="flex justify-center mb-8 relative" ref={constraintsRef}>
        {/* Background indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          <motion.div
            animate={{
              opacity: dragX < -50 ? Math.min(1, Math.abs(dragX) / 150) : 0,
              scale: dragX < -50 ? 1 : 0.8
            }}
            className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center"
          >
            <XIcon className="w-12 h-12 text-red-500" />
          </motion.div>
          <motion.div
            animate={{
              opacity: dragX > 50 ? Math.min(1, dragX / 150) : 0,
              scale: dragX > 50 ? 1 : 0.8
            }}
            className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center"
          >
            <CheckIcon className="w-12 h-12 text-green-500" />
          </motion.div>
        </div>

        <motion.div
          key={currentRecommendation?.id}
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          onDrag={(e, info) => setDragX(info.offset.x)}
          onDragEnd={(e, info) => {
            handleDragEnd(e, info)
            setDragX(0)
          }}
          whileDrag={{ scale: 1.05, rotate: dragX * 0.05 }}
          animate={{ x: 0 }}
          className={`relative z-10 w-full max-w-md p-6 rounded-2xl border cursor-grab active:cursor-grabbing transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          {currentRecommendation && (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full ${
                  currentRecommendation.priority === 'high' ? 'bg-red-600/20' :
                  currentRecommendation.priority === 'medium' ? 'bg-yellow-600/20' :
                  'bg-green-600/20'
                }`}>
                  <currentRecommendation.icon className={`w-6 h-6 ${currentRecommendation.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {currentRecommendation.title}
                  </h3>
                  <p className={`text-sm mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {currentRecommendation.message}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {currentRecommendation.details}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDismiss}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <XIcon className="w-4 h-4" />
                  <span>Dismiss</span>
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{currentRecommendation.actionText}</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={prevRecommendation}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full transition-colors ${
            currentIndex === 0
              ? isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={nextRecommendation}
          disabled={currentIndex >= activeRecommendations.length - 1}
          className={`p-3 rounded-full transition-colors ${
            currentIndex >= activeRecommendations.length - 1
              ? isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
              : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'
            }`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {approvedItems.length}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Approved
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'
            }`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {dismissedItems.length}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Dismissed
              </div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'
            }`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {activeRecommendations.length}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Remaining
              </div>
            </div>
          </div>
        </>
      )}

      {/* Activity Log View */}
      {viewMode === 'activity' && (
        <div className="space-y-4">
          {activityLog.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                <ClockIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                No activity yet
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Your recommendation activity will appear here
              </p>
            </div>
          ) : (
            activityLog.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    entry.action === 'approved' ? 'bg-green-600/20' :
                    entry.action === 'executed' ? 'bg-blue-600/20' :
                    'bg-red-600/20'
                  }`}>
                    {entry.action === 'approved' && <CheckIcon className="w-4 h-4 text-green-500" />}
                    {entry.action === 'executed' && <PlayIcon className="w-4 h-4 text-blue-500" />}
                    {entry.action === 'dismissed' && <XIcon className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {entry.recommendation.title}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {entry.action === 'approved' && 'Added to approval queue'}
                      {entry.action === 'executed' && 'Successfully executed'}
                      {entry.action === 'dismissed' && 'Dismissed'}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {entry.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Table View */}
      {viewMode === 'confirmation' && (
        <div className="space-y-6">
          {approvedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                <DocumentTextIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                No approved items
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Approved recommendations will appear here for final execution
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Ready to Execute ({approvedItems.length})
                </h3>
                <button
                  onClick={handleExecuteAll}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  Execute All
                </button>
              </div>

              <div className="space-y-3">
                {approvedItems.map((itemId) => {
                  const recommendation = allRecommendations.find(r => r.id === itemId)
                  if (!recommendation) return null

                  return (
                    <div key={itemId} className="relative">
                      {/* Background indicators */}
                      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                        <motion.div
                          animate={{
                            opacity: (rowDragX[itemId] || 0) < -50 ? Math.min(1, Math.abs(rowDragX[itemId] || 0) / 100) : 0,
                          }}
                          className="absolute left-0 inset-y-0 bg-red-600/20 rounded-lg flex items-center justify-start pl-4"
                          style={{ width: Math.min(150, Math.abs(rowDragX[itemId] || 0)) }}
                        >
                          <XIcon className="w-6 h-6 text-red-500" />
                        </motion.div>
                        <motion.div
                          animate={{
                            opacity: (rowDragX[itemId] || 0) > 50 ? Math.min(1, (rowDragX[itemId] || 0) / 100) : 0,
                          }}
                          className="absolute right-0 inset-y-0 bg-green-600/20 rounded-lg flex items-center justify-end pr-4"
                          style={{ width: Math.min(150, rowDragX[itemId] || 0) }}
                        >
                          <PlayIcon className="w-6 h-6 text-green-500" />
                        </motion.div>
                      </div>

                      <motion.div
                        drag="x"
                        dragConstraints={{ left: -200, right: 200 }}
                        dragElastic={0.1}
                        onDrag={(e, info) => setRowDragX(prev => ({ ...prev, [itemId]: info.offset.x }))}
                        onDragEnd={(event, info) => {
                          handleRowDragEnd(itemId, event, info)
                          setRowDragX(prev => ({ ...prev, [itemId]: 0 }))
                        }}
                        whileDrag={{ scale: 1.02 }}
                        animate={{ x: 0 }}
                        className={`relative z-10 p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${
                          isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          recommendation.priority === 'high' ? 'bg-red-600/20' :
                          recommendation.priority === 'medium' ? 'bg-yellow-600/20' :
                          'bg-green-600/20'
                        }`}>
                          <recommendation.icon className={`w-4 h-4 ${recommendation.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {recommendation.title}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {recommendation.message}
                          </p>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Swipe left to remove • Swipe right to execute
                          </p>
                        </div>
                      </div>
                    </motion.div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}