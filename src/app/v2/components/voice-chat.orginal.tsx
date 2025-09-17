// @ts-nocheck
/* eslint-disable */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SimpleMarkdown } from './simple-markdown'
import { LoanApplicationModal } from './loan-application-modal'
import { useVoiceChat } from '../hooks/useVoiceChat'
import { useAdvancedSpeech } from '../hooks/useAdvancedSpeech'
import { useRealtimeVoice } from '../hooks/useRealtimeVoice'
import {
  MicrophoneIcon,
  SpeakerphoneIcon,
  ChartBarIcon,
  CreditCardIcon,
  CogIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  ExclamationIcon,
  LightBulbIcon,
  TrendingUpIcon,
  SparklesIcon,
  StopIcon,
  PauseIcon,
  PlayIcon,
  ExternalLinkIcon,
  WifiIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  AdjustmentsIcon,
  LightningBoltIcon
} from '@heroicons/react/outline'

interface VoiceChatProps {
  onNavigate: (screen: string) => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

interface VoiceChatSettings {
  realtimeMode: boolean
  advancedProcessing: boolean
  autoSpeak: boolean
  voiceActivityDetection: boolean
  noiseReduction: boolean
}

export function VoiceChat({ onNavigate, isDarkMode, onToggleTheme }: VoiceChatProps) {
  // Advanced voice chat hooks
  const voiceChat = useVoiceChat()
  const advancedSpeech = useAdvancedSpeech()
  const realtimeVoice = useRealtimeVoice()

  // Local state for UI and settings
  const [settings, setSettings] = useState<VoiceChatSettings>({
    realtimeMode: false,
    advancedProcessing: true,
    autoSpeak: true,
    voiceActivityDetection: true,
    noiseReduction: true,
  })

  const [showSettings, setShowSettings] = useState(false)
  const [loanModalOpen, setLoanModalOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<{
    bankName: string
    loanAmount: number
    interestRate: number
    loanTerm: number
  } | null>(null)

  // Determine which voice system to use
  const isRealtimeMode = settings.realtimeMode && realtimeVoice.state.isConnected
  const isAdvancedMode = settings.advancedProcessing && advancedSpeech.state.isRecording

  // Combined state from all voice systems
  const combinedVoiceState = {
    isListening: isRealtimeMode
      ? realtimeVoice.state.isTransmitting
      : isAdvancedMode
        ? advancedSpeech.state.isRecording
        : voiceChat.state.isListening,
    isSpeaking: voiceChat.state.isSpeaking,
    isPaused: voiceChat.state.isPaused,
    isProcessing: voiceChat.state.isProcessing,
    currentTranscript: voiceChat.state.currentTranscript,
    error: voiceChat.state.error || advancedSpeech.state.error || realtimeVoice.state.error,
    audioLevel: isAdvancedMode ? advancedSpeech.state.audioLevel : 0,
    connectionQuality: isRealtimeMode ? realtimeVoice.state.connectionQuality : null,
    latency: isRealtimeMode ? realtimeVoice.state.latency : 0,
  }

  // Smart recommendations based on account data
  const recommendations = [
    {
      id: 1,
      type: 'alert',
      icon: ExclamationIcon,
      color: isDarkMode ? 'text-red-400' : 'text-red-600',
      title: 'High Spending Alert',
      message: 'Your groceries spending is 25% above average this month. Consider setting a budget limit.',
      priority: 'high'
    },
    {
      id: 2,
      type: 'advice',
      icon: LightBulbIcon,
      color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
      title: 'Investment Opportunity',
      message: 'You have $2,000 in checking. Consider moving $500 to your investment account for better returns.',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'insight',
      icon: TrendingUpIcon,
      color: isDarkMode ? 'text-green-400' : 'text-green-600',
      title: 'Savings Progress',
      message: 'Great job! You\'re ahead of your monthly savings goal by $300.',
      priority: 'low'
    }
  ]

  // Initialize voice systems based on settings
  useEffect(() => {
    if (settings.realtimeMode) {
      realtimeVoice.actions.connect()
    }

    if (settings.advancedProcessing) {
      // Advanced speech processing will be initialized when needed
    }

    // Apply voice settings
    if (settings.noiseReduction !== voiceChat.voiceSettings.rate) {
      voiceChat.actions.updateVoiceSettings({
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8,
      })
    }

    return () => {
      if (settings.realtimeMode) {
        realtimeVoice.actions.disconnect()
      }
      if (settings.advancedProcessing) {
        advancedSpeech.actions.stopRecording()
      }
    }
  }, [settings, realtimeVoice.actions, advancedSpeech.actions, voiceChat.actions, voiceChat.voiceSettings.rate])

  // Handle navigation requests from voice commands
  useEffect(() => {
    const lastMessage = voiceChat.messages[voiceChat.messages.length - 1]
    if (lastMessage?.role === 'assistant') {
      const content = lastMessage.content.toLowerCase()

      if (content.includes('dashboard') || content.includes('overview')) {
        setTimeout(() => onNavigate('dashboard'), 2000)
      } else if (content.includes('transaction') || content.includes('spending')) {
        setTimeout(() => onNavigate('transactions'), 2000)
      } else if (content.includes('insights') || content.includes('recommendations')) {
        setTimeout(() => onNavigate('insights'), 2000)
      } else if (content.includes('settings')) {
        setTimeout(() => onNavigate('settings'), 2000)
      }
    }
  }, [voiceChat.messages, onNavigate])

  // Voice control functions using the new hooks
  const startListening = useCallback(() => {
    if (settings.realtimeMode) {
      realtimeVoice.actions.startTransmission()
    } else if (settings.advancedProcessing) {
      advancedSpeech.actions.startRecording()
    } else {
      voiceChat.actions.startListening()
    }
  }, [settings, realtimeVoice.actions, advancedSpeech.actions, voiceChat.actions])

  const stopListening = useCallback(() => {
    if (settings.realtimeMode) {
      realtimeVoice.actions.stopTransmission()
    } else if (settings.advancedProcessing) {
      advancedSpeech.actions.stopRecording()
    } else {
      voiceChat.actions.stopListening()
    }
  }, [settings, realtimeVoice.actions, advancedSpeech.actions, voiceChat.actions])

  const speakText = useCallback((text: string) => {
    if (settings.autoSpeak) {
      voiceChat.actions.speak(text)
    }
  }, [settings.autoSpeak, voiceChat.actions])

  const stopSpeaking = useCallback(() => {
    voiceChat.actions.stopSpeaking()
  }, [voiceChat.actions])

  const pauseSpeaking = useCallback(() => {
    voiceChat.actions.pauseSpeaking()
  }, [voiceChat.actions])

  // Settings management
  const updateSettings = useCallback((newSettings: Partial<VoiceChatSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const toggleRealtimeMode = useCallback(() => {
    updateSettings({ realtimeMode: !settings.realtimeMode })
  }, [settings.realtimeMode, updateSettings])

  const toggleAdvancedProcessing = useCallback(() => {
    updateSettings({ advancedProcessing: !settings.advancedProcessing })
  }, [settings.advancedProcessing, updateSettings])

  const toggleAutoSpeak = useCallback(() => {
    updateSettings({ autoSpeak: !settings.autoSpeak })
  }, [settings.autoSpeak, updateSettings])

  const toggleVAD = useCallback(() => {
    updateSettings({ voiceActivityDetection: !settings.voiceActivityDetection })

    if (settings.advancedProcessing) {
      advancedSpeech.actions.updateVADSettings({
        enabled: !settings.voiceActivityDetection
      })
    }
  }, [settings.voiceActivityDetection, settings.advancedProcessing, updateSettings, advancedSpeech.actions])

  const toggleNoiseReduction = useCallback(() => {
    updateSettings({ noiseReduction: !settings.noiseReduction })

    if (settings.advancedProcessing) {
      advancedSpeech.actions.applyAudioEnhancements({
        noiseReduction: !settings.noiseReduction
      })
    }
  }, [settings.noiseReduction, settings.advancedProcessing, updateSettings, advancedSpeech.actions])

  // Handle manual text input
  const handleTextInput = useCallback((text: string) => {
    if (!text.trim()) return
    voiceChat.actions.sendMessage(text)
  }, [voiceChat.actions])

  // Handle loan application
  const handleLoanApplication = useCallback((loanDetails: any) => {
    setSelectedLoan(loanDetails)
    setLoanModalOpen(true)
  }, [])

  // Parse loan recommendations from AI responses
  const parseLoanRecommendations = useCallback((content: string) => {
    const loanRegex = /\*\*(.*?)\*\*[\s\S]*?Loan Amount: \$([0-9,]+)[\s\S]*?Interest Rate: ([0-9.]+)%[\s\S]*?Term: ([0-9]+) years/g
    const loans = []
    let match

    while ((match = loanRegex.exec(content)) !== null) {
      loans.push({
        bankName: match[1],
        loanAmount: parseInt(match[2].replace(/,/g, '')),
        interestRate: parseFloat(match[3]),
        loanTerm: parseInt(match[4])
      })
    }

    return loans
  }, [])

  const openLoanApplication = (bankName: string, rate: string) => {
    const rateNumber = parseFloat(rate.replace('%', ''))
    setSelectedLoan({
      bankName,
      loanAmount: 750000, // From the home affordability analysis
      interestRate: rateNumber,
      loanTerm: 360 // 30 years in months
    })
    setLoanModalOpen(true)
  }

  const calculateHomeAffordability = () => {
    // User's financial profile - High earner
    const monthlyIncome = 29167 // $350K annual income
    const monthlyExpenses = 8500 // Higher lifestyle expenses
    const currentSavings = 185000 // Higher savings balance
    const creditScore = 780 // Excellent credit score

    // DTI (Debt-to-Income) calculation
    const currentMonthlyDebt = 1200 // Car payment + other debts
    const targetDTI = 0.28 // Front-end DTI ratio (28% is standard)
    const maxDTI = 0.36 // Back-end DTI ratio (36% is conservative)

    // Maximum monthly payment based on DTI
    const maxHousingPayment = monthlyIncome * targetDTI - currentMonthlyDebt

    // Mortgage calculation parameters
    const interestRate = 0.068 // 6.8% current market rate
    const monthlyRate = interestRate / 12
    const loanTerm = 30 * 12 // 30-year mortgage

    // Calculate maximum loan amount using payment formula
    const maxLoanAmount = maxHousingPayment * ((1 - Math.pow(1 + monthlyRate, -loanTerm)) / monthlyRate)

    // Add down payment (assuming 20% to avoid PMI)
    const downPayment = currentSavings * 0.8 // Use 80% of savings for down payment
    const maxHomePrice = maxLoanAmount + downPayment

    // Calculate monthly payment for $750K home
    const targetHomePrice = 750000
    const targetDownPayment = targetHomePrice * 0.2 // 20% down
    const targetLoanAmount = targetHomePrice - targetDownPayment
    const targetMonthlyPayment = targetLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1)

    // Add property tax, insurance, HOA
    const propertyTax = (targetHomePrice * 0.012) / 12 // 1.2% annually
    const homeInsurance = 150 // Monthly estimate
    const hoa = 100 // Monthly estimate
    const totalMonthlyPayment = targetMonthlyPayment + propertyTax + homeInsurance + hoa

    // Calculate affordability
    const newDTI = (totalMonthlyPayment + currentMonthlyDebt) / monthlyIncome
    const disposableIncomeAfter = monthlyIncome - totalMonthlyPayment - monthlyExpenses

    return {
      maxHomePrice: Math.round(maxHomePrice),
      targetHomePrice,
      targetDownPayment,
      targetMonthlyPayment: Math.round(targetMonthlyPayment),
      totalMonthlyPayment: Math.round(totalMonthlyPayment),
      propertyTax: Math.round(propertyTax),
      homeInsurance,
      hoa,
      newDTI: (newDTI * 100).toFixed(1),
      disposableIncomeAfter: Math.round(disposableIncomeAfter),
      canAfford: newDTI <= maxDTI,
      interestRate: (interestRate * 100).toFixed(1)
    }
  }

  const getBankRecommendations = (creditScore: number, income: number) => {
    // Premium bank recommendations for high-income earners
    const banks = [
      {
        name: "JP Morgan Private Bank",
        rate: "6.45%",
        benefits: "Premium relationship pricing, dedicated mortgage advisor, jumbo loan specialist",
        requirements: "Minimum 740 credit score, relationship banking benefits",
        specialOffer: "0.375% rate discount for Private Bank clients, waived origination fees"
      },
      {
        name: "First Republic Bank",
        rate: "6.50%",
        benefits: "Portfolio lending options, interest-only payment options available, white-glove service",
        requirements: "Minimum 700 credit score, strong financial profile required",
        specialOffer: "Complimentary financial planning consultation, expedited underwriting"
      },
      {
        name: "Bank of America Private Bank",
        rate: "6.55%",
        benefits: "Wealth management integration, up to $4 million loan amounts, custom terms",
        requirements: "Preferred Rewards Diamond tier eligible, comprehensive wealth solutions",
        specialOffer: "Up to $10,000 in closing cost credits, preferred pricing on jumbo mortgages"
      }
    ]

    return banks
  }

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    // Home affordability check
    if (lowerInput.includes('home') || lowerInput.includes('house') || lowerInput.includes('afford') || lowerInput.includes('mortgage')) {
      const affordability = calculateHomeAffordability()
      const banks = getBankRecommendations(780, 29167)

      if (lowerInput.includes('can i afford')) {
        return `# 🏠 HOME AFFORDABILITY ANALYSIS

## ✅ **VERDICT: YES, YOU CAN EASILY AFFORD A $750,000 HOME**

---

## 📊 **EXECUTIVE SUMMARY**
\`\`\`
Annual Income:        $350,000
Monthly Income:       $29,167
Target Home Price:    $750,000
Affordability Status: ✅ APPROVED (Well within budget)
Max Affordable:       ~$1,500,000
\`\`\`

---

## 💵 **PURCHASE BREAKDOWN**

| **Item** | **Amount** | **Notes** |
|----------|------------|-----------|
| Home Price | $750,000 | Target property |
| Down Payment (20%) | $${affordability.targetDownPayment.toLocaleString()} | Avoids PMI |
| Loan Amount | $${(affordability.targetHomePrice - affordability.targetDownPayment).toLocaleString()} | 30-year fixed |
| Closing Costs | ~$15,000 | 2-3% of loan |
| **Cash Needed** | **~$${(affordability.targetDownPayment + 15000).toLocaleString()}** | **You have: $185,000 ✅** |

---

## 🏦 **MONTHLY PAYMENT ANALYSIS**

| **Cost Component** | **Amount** | **% of Income** |
|-------------------|------------|-----------------|
| Principal & Interest | $${affordability.targetMonthlyPayment.toLocaleString()} | ${((affordability.targetMonthlyPayment / 29167) * 100).toFixed(1)}% |
| Property Tax | $${affordability.propertyTax} | ${((affordability.propertyTax / 29167) * 100).toFixed(1)}% |
| Home Insurance | $${affordability.homeInsurance} | ${((affordability.homeInsurance / 29167) * 100).toFixed(1)}% |
| HOA Fees | $${affordability.hoa} | ${((affordability.hoa / 29167) * 100).toFixed(1)}% |
| **TOTAL PAYMENT** | **$${affordability.totalMonthlyPayment.toLocaleString()}** | **${((affordability.totalMonthlyPayment / 29167) * 100).toFixed(1)}%** |

---

## 📈 **FINANCIAL HEALTH METRICS**

| **Metric** | **Your Score** | **Recommended** | **Status** |
|-----------|---------------|-----------------|------------|
| DTI Ratio | ${affordability.newDTI}% | <36% | 🟢 Excellent |
| Housing/Income | ${((affordability.totalMonthlyPayment / 29167) * 100).toFixed(1)}% | <28% | 🟢 Excellent |
| Emergency Fund | $140,000 | 6 months expenses | 🟢 Strong |
| Credit Score | 780 | >740 | 🟢 Premium |
| Savings After Purchase | ~$20,000 | >$10,000 | 🟢 Comfortable |

---

## 💰 **POST-PURCHASE BUDGET**

\`\`\`
Monthly Income:         $29,167
- Housing Costs:        -$${affordability.totalMonthlyPayment.toLocaleString()}
- Other Expenses:       -$8,500
= Disposable Income:    $${affordability.disposableIncomeAfter.toLocaleString()}/month
\`\`\`

**Annual Savings Potential: $${(affordability.disposableIncomeAfter * 12).toLocaleString()}** 💪

---

## 🏆 **PREMIUM LENDER RECOMMENDATIONS**

### **🥇 TIER 1: PRIVATE BANKING**
*Best for relationship benefits and premium service*

**${banks[0].name}**
- **Rate:** ${banks[0].rate} APR
- **Benefits:** ${banks[0].benefits}
- **Special Offer:** ${banks[0].specialOffer}
- **Why Choose:** Best for existing JP Morgan clients, lowest rate available

### **🥈 TIER 2: BOUTIQUE LENDING**
*Best for flexible terms and personalized service*

**${banks[1].name}**
- **Rate:** ${banks[1].rate} APR
- **Benefits:** ${banks[1].benefits}
- **Special Offer:** ${banks[1].specialOffer}
- **Why Choose:** Most flexible underwriting, interest-only options

### **🥉 TIER 3: WEALTH MANAGEMENT**
*Best for integrated financial services*

**${banks[2].name}**
- **Rate:** ${banks[2].rate} APR
- **Benefits:** ${banks[2].benefits}
- **Special Offer:** ${banks[2].specialOffer}
- **Why Choose:** Highest closing cost credit, full wealth management

---

## 💡 **STRATEGIC RECOMMENDATIONS**

### **Immediate Actions:**
1. **Get Pre-Approved** with all 3 lenders to negotiate best rate
2. **Consider 15-Year Loan** - You can afford higher payments for massive interest savings
3. **Explore ARM Options** - 7/1 or 10/1 ARMs offer lower initial rates

### **Tax Optimization:**
- Mortgage interest deduction saves ~$${Math.round(((affordability.targetHomePrice - affordability.targetDownPayment) * 0.068 * 0.32) / 12)} monthly
- Property tax deduction provides additional savings
- Consider setting up an LLC for rental property opportunities

### **Alternative Strategy:**
With your income, consider:
- **$1.2M Home** - Still only 25% DTI, better long-term appreciation
- **Investment Property** - Use extra capacity for rental income
- **Cash Purchase** - Negotiate 5-10% discount with cash offer

---

**🎯 BOTTOM LINE:** The $750K home is extremely affordable for you - using only ${((affordability.totalMonthlyPayment / 29167) * 100).toFixed(1)}% of your income vs. the 28% guideline. This leaves substantial room for investments, lifestyle, and wealth building.`
      }

      return "I can help you determine if you can afford a home. Based on your current income and expenses, I'll calculate your home buying power. Would you like me to analyze if you can afford a specific home price?"
    }

    // Check for navigation requests
    if (lowerInput.includes('dashboard') || lowerInput.includes('overview') || lowerInput.includes('reports')) {
      setTimeout(() => onNavigate('dashboard'), 2000)
      return "I'll show you the dashboard overview with your financial reports."
    }

    if (lowerInput.includes('transaction') || lowerInput.includes('spending')) {
      setTimeout(() => onNavigate('transactions'), 2000)
      return "Let me pull up your recent transactions and spending analysis."
    }

    if (lowerInput.includes('insights') || lowerInput.includes('recommendations') || lowerInput.includes('advice') || lowerInput.includes('alerts')) {
      setTimeout(() => onNavigate('insights'), 2000)
      return "I'll show you your personalized AI insights and recommendations. You can swipe right to accept or left to dismiss each suggestion."
    }

    if (lowerInput.includes('settings') || lowerInput.includes('preference')) {
      setTimeout(() => onNavigate('settings'), 2000)
      return "I'll open your settings and preferences."
    }

    // Financial queries
    if (lowerInput.includes('balance') || lowerInput.includes('money')) {
      return "Your current total balance is $185,000. Your checking account has $45,000 and savings has $140,000. You also have $450,000 in investment accounts. Would you like to see a detailed breakdown?"
    }

    if (lowerInput.includes('spending') || lowerInput.includes('expense')) {
      return "Your monthly expenses are $8,500. Your top categories are housing at $3,200, dining & entertainment at $1,800, and transportation at $1,200. Should I show you the full spending breakdown?"
    }

    if (lowerInput.includes('investment') || lowerInput.includes('invest')) {
      return "Your investment portfolio is worth $450,000, up 18.5% this year. Well-diversified across stocks (60%), bonds (25%), and alternatives (15%). Would you like to review your portfolio allocation?"
    }

    if (lowerInput.includes('budget') || lowerInput.includes('save')) {
      return "Based on your income of $29,167/month, you're currently saving $12,000 monthly (41% savings rate) - exceptional! You're maxing out 401(k), backdoor Roth IRA, and investing $8,000 monthly in taxable accounts. Want strategies for tax optimization?"
    }

    return "I can help you with financial insights, budgeting advice, spending analysis, investment guidance, and home affordability calculations. You can also ask me to show specific reports or navigate to different sections. What would you like to explore?"
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-black' : 'bg-white'
    }`}>
      {/* Header with navigation */}
      <div className="absolute top-4 left-4 flex gap-2">
        {/* Voice Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 border rounded-lg transition-colors ${
            showSettings
              ? 'bg-blue-600 border-blue-500 text-white'
              : isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="Voice Settings"
        >
          <AdjustmentsIcon className={`w-5 h-5 ${
            showSettings ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`} />
        </button>

        {/* App Settings button */}
        <button
          onClick={() => onNavigate('settings')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="App Settings"
        >
          <CogIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {/* Theme Toggle - Hidden for now */}
        {/* <button
          onClick={onToggleTheme}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button> */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="Dashboard"
        >
          <ChartBarIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
        <button
          onClick={() => onNavigate('transactions')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="Transactions"
        >
          <CreditCardIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
        <button
          onClick={() => onNavigate('insights')}
          className={`p-2 border rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
              : 'bg-gray-100 border-gray-300 hover:border-blue-500'
          }`}
          title="AI Insights"
        >
          <SparklesIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Advanced Voice Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-20 left-4 right-4 max-w-md mx-auto p-4 rounded-lg border shadow-lg z-10 ${
              isDarkMode
                ? 'bg-gray-900/95 border-gray-800 backdrop-blur-sm'
                : 'bg-white/95 border-gray-200 backdrop-blur-sm'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Voice Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <XIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>

              {/* Realtime Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LightningBoltIcon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Real-time Mode
                  </span>
                </div>
                <button
                  onClick={toggleRealtimeMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.realtimeMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.realtimeMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Advanced Processing Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Advanced Processing
                  </span>
                </div>
                <button
                  onClick={toggleAdvancedProcessing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.advancedProcessing ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.advancedProcessing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Speak Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VolumeUpIcon className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Auto Speak Responses
                  </span>
                </div>
                <button
                  onClick={toggleAutoSpeak}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoSpeak ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoSpeak ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Activity Detection Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MicrophoneIcon className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Voice Activity Detection
                  </span>
                </div>
                <button
                  onClick={toggleVAD}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.voiceActivityDetection ? 'bg-yellow-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.voiceActivityDetection ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Noise Reduction Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VolumeOffIcon className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Noise Reduction
                  </span>
                </div>
                <button
                  onClick={toggleNoiseReduction}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.noiseReduction ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.noiseReduction ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Connection Status */}
              {isRealtimeMode && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Connection Status:
                    </span>
                    <span className={`font-medium ${
                      realtimeVoice.state.isConnected ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {realtimeVoice.state.serverStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat interface */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">

        {/* Animated circle */}
        <div className="relative mb-8">
          <motion.div
            className="relative"
            animate={{
              scale: combinedVoiceState.isListening ? [1, 1.1, 1] : combinedVoiceState.isSpeaking ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: combinedVoiceState.isListening ? 1.5 : combinedVoiceState.isSpeaking ? 0.8 : 0,
              repeat: combinedVoiceState.isListening || combinedVoiceState.isSpeaking ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {/* Outer ring */}
            <motion.div
              className="w-32 h-32 rounded-full border-2 border-blue-500/30"
              animate={{
                rotate: combinedVoiceState.isListening || combinedVoiceState.isSpeaking ? 360 : 0,
                borderColor: combinedVoiceState.isListening ? ["#3b82f6", "#8b5cf6", "#3b82f6"] :
                            combinedVoiceState.isSpeaking ? ["#10b981", "#3b82f6", "#10b981"] : "#3b82f6"
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                borderColor: { duration: 2, repeat: Infinity }
              }}
            />

            {/* Inner circle */}
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center cursor-pointer"
              onClick={combinedVoiceState.isListening ? stopListening : startListening}
              whileTap={{ scale: 0.95 }}
              animate={{
                background: combinedVoiceState.isListening ? ["linear-gradient(45deg, #3b82f6, #8b5cf6)", "linear-gradient(225deg, #8b5cf6, #3b82f6)"] :
                           combinedVoiceState.isSpeaking ? ["linear-gradient(45deg, #10b981, #3b82f6)", "linear-gradient(225deg, #3b82f6, #10b981)"] :
                           "linear-gradient(45deg, #3b82f6, #8b5cf6)"
              }}
              transition={{
                background: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {combinedVoiceState.isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <MicrophoneIcon className="w-12 h-12 text-white" />
                </motion.div>
              ) : combinedVoiceState.isSpeaking ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <SpeakerphoneIcon className="w-12 h-12 text-white" />
                </motion.div>
              ) : (
                <MicrophoneIcon className="w-12 h-12 text-white" />
              )}
            </motion.div>

            {/* Loading indicator */}
            {combinedVoiceState.isProcessing && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.div>
        </div>

        {/* Voice Control Buttons */}
        {(combinedVoiceState.isSpeaking || combinedVoiceState.isPaused) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex gap-3 mb-6"
          >
            <button
              onClick={stopSpeaking}
              className={`p-3 rounded-full transition-all ${
                isDarkMode
                  ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30'
                  : 'bg-red-50 hover:bg-red-100 border border-red-200'
              }`}
              title="Stop speaking"
            >
              <StopIcon className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </button>
            <button
              onClick={pauseSpeaking}
              className={`p-3 rounded-full transition-all ${
                isDarkMode
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30'
                  : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
              }`}
              title={combinedVoiceState.isPaused ? "Resume speaking" : "Pause speaking"}
            >
              {combinedVoiceState.isPaused ? (
                <PlayIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              ) : (
                <PauseIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              )}
            </button>
          </motion.div>
        )}

        {/* Advanced Voice Status */}
        <div className="text-center mb-6">
          <AnimatePresence mode="wait">
            {combinedVoiceState.isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <p className={`text-lg font-medium ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {isRealtimeMode ? 'Real-time Voice Active' :
                   isAdvancedMode ? 'Advanced Processing' : 'Listening...'}
                </p>

                {/* Audio Level Indicator */}
                {isAdvancedMode && (
                  <div className="flex items-center justify-center gap-2">
                    <VolumeUpIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(combinedVoiceState.audioLevel, 100)}%` }}
                        animate={{ width: `${Math.min(combinedVoiceState.audioLevel, 100)}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                {/* Connection Quality for Realtime */}
                {isRealtimeMode && combinedVoiceState.connectionQuality && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <WifiIcon className={`w-4 h-4 ${
                      combinedVoiceState.connectionQuality === 'excellent' ? 'text-green-500' :
                      combinedVoiceState.connectionQuality === 'good' ? 'text-blue-500' :
                      combinedVoiceState.connectionQuality === 'fair' ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {combinedVoiceState.connectionQuality} ({combinedVoiceState.latency}ms)
                    </span>
                  </div>
                )}

                {combinedVoiceState.currentTranscript && (
                  <span className={`block text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    &ldquo;{combinedVoiceState.currentTranscript}&rdquo;
                  </span>
                )}
              </motion.div>
            ) : combinedVoiceState.isSpeaking ? (
              <motion.p
                key="speaking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-lg font-medium ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}
              >
                {combinedVoiceState.isPaused ? 'Paused' : 'Speaking...'}
              </motion.p>
            ) : combinedVoiceState.isProcessing ? (
              <motion.p
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-lg font-medium ${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`}
              >
                Processing...
              </motion.p>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tap to speak or ask about your finances
                </p>

                {/* Voice Mode Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  {settings.realtimeMode && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full">
                      Real-time
                    </span>
                  )}
                  {settings.advancedProcessing && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full">
                      Advanced
                    </span>
                  )}
                  {settings.voiceActivityDetection && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
                      VAD
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {combinedVoiceState.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-500 text-sm">{combinedVoiceState.error}</p>
            </motion.div>
          )}
        </div>

        {/* Recent messages */}
        <div className="w-full max-h-[600px] overflow-y-auto space-y-4 px-4 mb-8">
          {voiceChat.messages.slice(-3).map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-4xl px-6 py-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-900/90 text-gray-100 border border-gray-800'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                {message.content.includes('#') || message.content.includes('|') || message.content.includes('```') ? (
                  <div className="markdown-content">
                    <SimpleMarkdown
                      content={message.content}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                {/* Bank Application Buttons */}
                {message.hasBankApplications && (
                  <div className="mt-4 space-y-2">
                    <div className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Apply for Pre-Approval:
                    </div>
                    <button
                      onClick={() => openLoanApplication('JP Morgan Private Bank', '6.25%')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        JP Morgan Private Bank - 6.25% APR
                      </span>
                      <ExternalLinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openLoanApplication('Wells Fargo Private Mortgage', '6.45%')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Wells Fargo Private Mortgage - 6.45% APR
                      </span>
                      <ExternalLinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openLoanApplication('Bank of America Private Bank', '6.55%')}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                          : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Bank of America Private Bank - 6.55% APR
                      </span>
                      <ExternalLinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {message.isVoice && (
                  <div className="flex items-center gap-1 mt-2 opacity-70">
                    <MicrophoneIcon className="w-3 h-3" />
                    <span className="text-xs">Voice</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recommendations and Advice Section */}
        <div className="w-full max-w-md space-y-3">
          <h3 className={`text-sm font-semibold text-center ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Smart Insights
          </h3>
          {recommendations.slice(0, 2).map((rec, index) => {
            const Icon = rec.icon
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-800'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full ${
                    isDarkMode ? 'bg-gray-800/20' : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-4 h-4 ${rec.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xs font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {rec.title}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {rec.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Loan Application Modal */}
      {selectedLoan && (
        <LoanApplicationModal
          isOpen={loanModalOpen}
          onClose={() => {
            setLoanModalOpen(false)
            setSelectedLoan(null)
          }}
          bankName={selectedLoan.bankName}
          loanAmount={selectedLoan.loanAmount}
          interestRate={selectedLoan.interestRate}
          loanTerm={selectedLoan.loanTerm}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}
