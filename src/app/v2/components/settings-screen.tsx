'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditVerificationWizard } from './credit-verification-wizard'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { getUserInfo, updateUserInfo } from '@/store/actions/useUser'
import { User } from '@/lib/types'
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  RefreshIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  LinkIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  CogIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  XIcon
} from '@heroicons/react/outline'
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link'
import { VOICE_PRESETS, MODELS } from '@/lib/elevenlabs'

interface SettingsScreenProps {
  onBack: () => void
  isDarkMode: boolean
  onToggleTheme: () => void
}

interface BankAccount {
  id: string
  institution_name: string
  account_name: string
  account_type: string
  account_mask: string
  balance: number
  status: 'active' | 'error' | 'syncing'
  last_updated: string
}

export function SettingsScreen({ onBack, isDarkMode, onToggleTheme }: SettingsScreenProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user, items } = useSelector((state: RootState) => state.user)

  const [activeTab, setActiveTab] = useState<'accounts' | 'profile' | 'preferences' | 'notifications' | 'security'>('accounts')
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<BankAccount[]>([])

  // AI Voice settings (persisted to localStorage)
  const [voicePreset, setVoicePreset] = useState<keyof typeof VOICE_PRESETS>('calm_female_finance' as any)
  const [modelId, setModelId] = useState<string>(MODELS.turbo)
  const [voiceStability, setVoiceStability] = useState<number>(0.75)
  const [voiceSimilarity, setVoiceSimilarity] = useState<number>(0.65)
  const [voiceStyle, setVoiceStyle] = useState<number>(0.15)
  const [useSpeakerBoost, setUseSpeakerBoost] = useState<boolean>(true)
  const [voiceVolume, setVoiceVolume] = useState<number>(0.85)
  const [voiceAutoplay, setVoiceAutoplay] = useState<boolean>(true)
  const [voiceTestLoading, setVoiceTestLoading] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [showAdvancedVoice, setShowAdvancedVoice] = useState(false)

  // Update accounts when items change
  useEffect(() => {
    if (items && items.length > 0) {
      const mappedAccounts: BankAccount[] = items.flatMap((item: any) =>
        item.accounts?.map((account: any) => ({
          id: account.id,
          institution_name: item.institution?.name || 'Unknown Bank',
          account_name: account.name || 'Account',
          account_type: account.type || 'checking',
          account_mask: account.mask || '****',
          balance: account.balances?.current || 0,
          status: 'active' as const,
          last_updated: new Date().toISOString()
        })) || []
      )
      setAccounts(mappedAccounts)
    }
  }, [items])

  // Load AI voice settings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aiVoiceSettingsV2')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.voicePreset) setVoicePreset(s.voicePreset)
        if (s.modelId) setModelId(s.modelId)
        if (typeof s.voiceStability === 'number') setVoiceStability(s.voiceStability)
        if (typeof s.voiceSimilarity === 'number') setVoiceSimilarity(s.voiceSimilarity)
        if (typeof s.voiceStyle === 'number') setVoiceStyle(s.voiceStyle)
        if (typeof s.useSpeakerBoost === 'boolean') setUseSpeakerBoost(s.useSpeakerBoost)
        if (typeof s.voiceVolume === 'number') setVoiceVolume(s.voiceVolume)
        if (typeof s.voiceAutoplay === 'boolean') setVoiceAutoplay(s.voiceAutoplay)
      }
    } catch {}
  }, [])

  // Persist AI voice settings
  useEffect(() => {
    try {
      localStorage.setItem('aiVoiceSettingsV2', JSON.stringify({
        voicePreset,
        modelId,
        voiceStability,
        voiceSimilarity,
        voiceStyle,
        useSpeakerBoost,
        voiceVolume,
        voiceAutoplay,
      }))
    } catch {}
  }, [voicePreset, modelId, voiceStability, voiceSimilarity, voiceStyle, useSpeakerBoost, voiceVolume, voiceAutoplay])

  const handleTestVoice = async () => {
    try {
      setVoiceTestLoading(true)
      const res = await fetch('/api/v1/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'This is your financial assistant speaking with the current voice settings.',
          voice_preset: voicePreset,
          model_id: modelId,
          voice_settings: {
            stability: voiceStability,
            similarity_boost: voiceSimilarity,
            style: voiceStyle,
            use_speaker_boost: useSpeakerBoost,
          },
          stream: false,
        })
      })
      const data = await res.json()
      if (!res.ok || !data?.audio_base64) throw new Error(data?.error || 'Failed to generate audio')
      const audioData = Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))
      const audioBlob = new Blob([audioData], { type: data.audio_type || 'audio/mpeg' })
      const url = URL.createObjectURL(audioBlob)
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = url
        audioRef.current.volume = Math.max(0, Math.min(1, voiceVolume))
        await audioRef.current.play()
      }
    } catch (e) {
      console.error('Voice test failed:', e)
    } finally {
      setVoiceTestLoading(false)
    }
  }

  // State for formatted currency inputs
  const [monthlyPayment, setMonthlyPayment] = useState('$3,200')
  const [annualSalary, setAnnualSalary] = useState(user?.salary ? `$${user.salary.toLocaleString()}` : '$350,000')
  const [annualBonus, setAnnualBonus] = useState('$0')
  const [otherIncome, setOtherIncome] = useState('$0')
  const [cashSavings, setCashSavings] = useState('$185,000')
  const [investments, setInvestments] = useState('$450,000')
  const [retirement, setRetirement] = useState('$250,000')
  const [realEstate, setRealEstate] = useState('$0')
  const [creditCardDebt, setCreditCardDebt] = useState('$0')
  const [autoLoans, setAutoLoans] = useState('$0')
  const [studentLoans, setStudentLoans] = useState('$0')
  const [otherDebts, setOtherDebts] = useState('$0')

  // State for language selection
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false)

  // Profile data state
  const [profileFirstName, setProfileFirstName] = useState(user?.given_name || user?.name?.split(' ')[0] || '')
  const [profileLastName, setProfileLastName] = useState(user?.family_name || user?.name?.split(' ').slice(1).join(' ') || '')
  const [profileSSN, setProfileSSN] = useState('***-**-6789')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [profilePhone, setProfilePhone] = useState(user?.phone || '')
  const [profileDOB, setProfileDOB] = useState('1985-06-15')

  // State for credit verification wizard
  const [showVerificationWizard, setShowVerificationWizard] = useState(false)

  // State for credit monitoring banner
  const [showCreditMonitoring, setShowCreditMonitoring] = useState(true)

  // Load user data on mount
  useEffect(() => {
    dispatch(getUserInfo({}))
  }, [dispatch])

  // Update form states when user data changes
  useEffect(() => {
    if (user) {
      setProfileFirstName(user.given_name || user.name?.split(' ')[0] || '')
      setProfileLastName(user.family_name || user.name?.split(' ').slice(1).join(' ') || '')
      setProfileEmail(user.email || '')
      setProfilePhone(user.phone || '')
      if (user.salary) {
        setAnnualSalary(`$${user.salary.toLocaleString()}`)
      }
    }
  }, [user])

  // Handle profile save
  const handleSaveProfile = () => {
    const updatedUser: Partial<User> = {
      ...user,
      given_name: profileFirstName,
      family_name: profileLastName,
      name: `${profileFirstName} ${profileLastName}`,
      email: profileEmail,
      phone: profilePhone
    }
    dispatch(updateUserInfo(updatedUser as User))
  }

  // Handle profile reset
  const handleResetProfile = () => {
    if (user) {
      setProfileFirstName(user.given_name || user.name?.split(' ')[0] || '')
      setProfileLastName(user.family_name || user.name?.split(' ').slice(1).join(' ') || '')
      setProfileEmail(user.email || '')
      setProfilePhone(user.phone || '')
      if (user.salary) {
        setAnnualSalary(`$${user.salary.toLocaleString()}`)
      }
    }
  }

  const commonLanguages = ['English', 'Spanish', 'French', 'Chinese (Mandarin)', 'Arabic', 'Hindi']

  const allLanguages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese (Mandarin)',
    'Chinese (Cantonese)',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Portuguese',
    'Russian',
    'Italian',
    'Dutch',
    'Polish',
    'Turkish',
    'Vietnamese',
    'Thai',
    'Hebrew',
    'Swedish',
    'Bengali',
    'Urdu',
    'Indonesian',
    'Filipino',
    'Ukrainian'
  ]

  // Handle language selection
  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        // Don't allow deselecting if it's the only language selected
        if (prev.length === 1) return prev
        return prev.filter(l => l !== language)
      } else {
        return [...prev, language]
      }
    })
  }

  // Format number to currency string
  const formatToCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
    if (isNaN(numValue)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue)
  }

  // Handle currency input change
  const handleCurrencyChange = (value: string, setter: (val: string) => void) => {
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')

    // Format and set the value
    if (cleanValue === '') {
      setter('$0')
    } else {
      const numValue = parseFloat(cleanValue)
      if (!isNaN(numValue)) {
        setter(formatToCurrency(numValue))
      }
    }
  }

  // Calculate total income
  const calculateTotalIncome = () => {
    const salary = parseFloat(annualSalary.replace(/[^0-9.-]/g, '')) || 0
    const bonus = parseFloat(annualBonus.replace(/[^0-9.-]/g, '')) || 0
    const other = parseFloat(otherIncome.replace(/[^0-9.-]/g, '')) || 0
    return formatToCurrency(salary + bonus + other)
  }

  // Fetch link token for Plaid Link
  // Fetch existing accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/plaid/accounts', {
        method: 'GET',
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched accounts:', data)

        // Transform the API response to match our BankAccount interface
        const transformedAccounts = data.flatMap((item: any) =>
          item.accounts?.map((account: any) => ({
            id: account.id || account.account_id,
            institution_name: item.institution?.name || 'Unknown Institution',
            account_name: account.name || account.official_name || 'Account',
            account_type: account.subtype || account.type || 'unknown',
            account_mask: account.mask || '****',
            balance: account.balances?.current || 0,
            status: 'active' as const,
            last_updated: new Date().toISOString()
          })) || []
        )

        setAccounts(transformedAccounts)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      // Set some demo accounts as fallback
      setAccounts([
        {
          id: '1',
          institution_name: 'Bank of America',
          account_name: 'Checking Account',
          account_type: 'checking',
          account_mask: '****4567',
          balance: 45000,
          status: 'active',
          last_updated: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          institution_name: 'Bank of America',
          account_name: 'Savings Account',
          account_type: 'savings',
          account_mask: '****8901',
          balance: 140000,
          status: 'active',
          last_updated: '2024-01-15T10:30:00Z'
        },
        {
          id: '3',
          institution_name: 'Charles Schwab',
          account_name: 'Investment Account',
          account_type: 'investment',
          account_mask: '****2345',
          balance: 450000,
          status: 'active',
          last_updated: '2024-01-15T10:30:00Z'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/v1/plaid/create_link_token', {
          method: 'GET',
        })
        if (response.ok) {
          const data = await response.json()
          // The API returns an array of link tokens, use the first one
          if (data.link_token && Array.isArray(data.link_token) && data.link_token.length > 0) {
            setLinkToken(data.link_token[0].link_token)
          }
        }
      } catch (error) {
        console.error('Error creating link token:', error)
      }
    }
    createLinkToken()
  }, [])

  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    // Handle successful bank account connection
    console.log('Success:', public_token, metadata)

    try {
      // Exchange public token for access token
      const response = await fetch('/api/v1/plaid/set_access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_token,
          metadata,
          type: 0 // Type index for the product list
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Account linked successfully:', data)

        // Refresh the accounts list
        fetchAccounts()
      } else {
        console.error('Failed to exchange public token')
      }
    } catch (error) {
      console.error('Error exchanging public token:', error)
    }
  }, [fetchAccounts])

  const config: PlaidLinkOptions = {
    token: linkToken || '',
    onSuccess,
    onExit: (err, metadata) => {
      console.log('Exit:', err, metadata)
    },
    onEvent: (eventName, metadata) => {
      console.log('Event:', eventName, metadata)
    }
  }

  const { open, ready } = usePlaidLink(config)

  const handleAddAccount = () => {
    if (ready) {
      open()
    } else {
      // Fallback for demo purposes
      alert(`Plaid Link is not ready. In production, ensure you have valid Plaid credentials.`)
    }
  }

  const handleRemoveAccount = (accountId: string) => {
    setAccounts(accounts.filter(acc => acc.id !== accountId))
  }

  const handleRefreshAccount = async (accountId: string) => {
    setAccounts(accounts.map(acc =>
      acc.id === accountId ? { ...acc, status: 'syncing' } : acc
    ))

    // Refresh the account data from API
    try {
      await fetch('/api/v1/plaid/transactions/all', {
        method: 'GET',
      })

      // Refresh all accounts after syncing transactions
      await fetchAccounts()
    } catch (error) {
      console.error('Error refreshing account:', error)
      // Reset status on error
      setAccounts(prev => prev.map(acc =>
        acc.id === accountId
          ? { ...acc, status: 'active' }
          : acc
      ))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const tabs = [
    { id: 'accounts', label: 'Bank Accounts', icon: CreditCardIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Header */}
      <header className="mb-8">
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
            }`}>Settings</h1>
            <p className={`mt-1 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Manage your account and preferences</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={`flex gap-2 mb-6 overflow-x-auto pb-2 ${
        isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="max-w-4xl">
        <AnimatePresence mode="wait">
          {activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pb-24 md:pb-6"
            >
              {/* Header - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className={`text-base sm:text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Connected Bank Accounts</h2>
                <button
                  onClick={handleAddAccount}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Account</span>
                </button>
              </div>

              {/* Account List */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : accounts.length === 0 ? (
                <div className={`text-center py-12 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <p className="mb-4">No bank accounts connected yet</p>
                  <p className="text-sm">Click {`"`}Add Account{`"`} to connect your bank</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                  <motion.div
                    key={account.id}
                    layout
                    className={`p-3 sm:p-4 rounded-xl border transition-all ${
                      isDarkMode
                        ? 'bg-gray-900/50 border-gray-800'
                        : 'bg-white border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Mobile-First Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isDarkMode ? 'bg-gray-800' : 'bg-blue-50'
                        }`}>
                          <LinkIcon className={`w-4 h-4 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm sm:text-base truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {account.institution_name}
                          </h3>
                          <p className={`text-xs sm:text-sm truncate ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {account.account_name} (••••{account.account_mask})
                          </p>
                        </div>
                      </div>

                      {/* Status and Actions Row */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status Indicator */}
                        {account.status === 'active' && (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        )}
                        {account.status === 'error' && (
                          <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                        {account.status === 'syncing' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshIcon className="w-4 h-4 text-blue-500" />
                          </motion.div>
                        )}

                        {/* Action Buttons */}
                        <button
                          onClick={() => handleRefreshAccount(account.id)}
                          disabled={account.status === 'syncing'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-gray-800 hover:bg-gray-700'
                              : 'bg-gray-100 hover:bg-gray-200'
                          } ${account.status === 'syncing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Refresh"
                        >
                          <RefreshIcon className={`w-3.5 h-3.5 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                        </button>
                        <button
                          onClick={() => handleRemoveAccount(account.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-gray-800 hover:bg-red-900/30'
                              : 'bg-gray-100 hover:bg-red-50'
                          }`}
                          title="Remove"
                        >
                          <TrashIcon className={`w-3.5 h-3.5 ${
                            isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-600'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Compact Info Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>Balance</p>
                        <p className={`text-sm sm:text-base font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>Type</p>
                        <p className={`text-xs sm:text-sm capitalize ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {account.account_type}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>Updated</p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {new Date(account.last_updated).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              <div className={`mt-6 p-4 rounded-lg border ${
                isDarkMode
                  ? 'bg-blue-900/20 border-blue-500/30'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className={`w-5 h-5 mt-0.5 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <div>
                    <h3 className={`font-medium mb-1 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-900'
                    }`}>Bank-Level Security</h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-400/70' : 'text-blue-700'
                    }`}>
                      Your financial data is encrypted and secured using Plaid{`'`}s bank-level security.
                      We never store your login credentials.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 max-w-5xl pb-24 md:pb-6"
            >
              {/* Personal Information */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  <UserIcon className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>First Name *</label>
                    <input
                      type="text"
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Last Name *</label>
                    <input
                      type="text"
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Date of Birth *</label>
                    <input
                      type="date"
                      value={profileDOB}
                      onChange={(e) => setProfileDOB(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Social Security Number *</label>
                    <input
                      type="text"
                      placeholder="XXX-XX-XXXX"
                      value={profileSSN}
                      onChange={(e) => setProfileSSN(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Phone Number *</label>
                    <input
                      type="tel"
                      defaultValue="(555) 123-4567"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Email *</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Marital Status</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Number of Dependents</label>
                    <input
                      type="number"
                      defaultValue="0"
                      min="0"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Preferred Languages */}
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Preferred Languages *</label>
                  <div className={`rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    {/* Collapsed View - Shows selected languages or prompt */}
                    <button
                      onClick={() => setIsLanguageExpanded(!isLanguageExpanded)}
                      className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex-1">
                        {selectedLanguages.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedLanguages.map((lang) => (
                              <span
                                key={lang}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isDarkMode
                                    ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Click to select languages
                          </span>
                        )}
                      </div>
                      {isLanguageExpanded ? (
                        <ChevronUpIcon className={`w-5 h-5 ml-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      ) : (
                        <ChevronDownIcon className={`w-5 h-5 ml-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      )}
                    </button>

                    {/* Expanded View - Shows all language options */}
                    {isLanguageExpanded && (
                      <div className={`px-4 pb-4 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-300'
                      }`}>
                        {/* Common Languages Section */}
                        <div className="mt-4">
                          <p className={`text-xs font-medium mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>COMMON LANGUAGES</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {commonLanguages.map((language) => (
                              <label
                                key={language}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedLanguages.includes(language)}
                                  onChange={() => toggleLanguage(language)}
                                  className={`w-4 h-4 rounded border ${
                                    isDarkMode
                                      ? 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500'
                                      : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500'
                                  }`}
                                />
                                <span className={`text-sm ${
                                  selectedLanguages.includes(language)
                                    ? isDarkMode ? 'text-blue-300 font-medium' : 'text-blue-600 font-medium'
                                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {language}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* All Languages Section */}
                        <div className="mt-4">
                          <p className={`text-xs font-medium mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>ALL LANGUAGES</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {allLanguages
                              .filter(lang => !commonLanguages.includes(lang))
                              .map((language) => (
                                <label
                                  key={language}
                                  className="flex items-center space-x-2 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedLanguages.includes(language)}
                                    onChange={() => toggleLanguage(language)}
                                    className={`w-4 h-4 rounded border ${
                                      isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500'
                                        : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500'
                                    }`}
                                  />
                                  <span className={`text-sm ${
                                    selectedLanguages.includes(language)
                                      ? isDarkMode ? 'text-blue-300 font-medium' : 'text-blue-600 font-medium'
                                      : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {language}
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>

                        {/* Selected Count */}
                        {selectedLanguages.length > 0 && (
                          <div className={`mt-4 pt-3 border-t ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-300'
                          }`}>
                            <p className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Current Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Street Address *</label>
                    <input
                      type="text"
                      defaultValue="123 Main Street"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>City *</label>
                      <input
                        type="text"
                        defaultValue="San Francisco"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>State *</label>
                      <input
                        type="text"
                        defaultValue="CA"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>ZIP Code *</label>
                      <input
                        type="text"
                        defaultValue="94105"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Years at Address</label>
                      <input
                        type="number"
                        defaultValue="5"
                        min="0"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Housing Status</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <option>Own</option>
                      <option>Rent</option>
                      <option>Living with Family</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Monthly Rent/Mortgage Payment</label>
                    <input
                      type="text"
                      value={monthlyPayment}
                      onChange={(e) => handleCurrencyChange(e.target.value, setMonthlyPayment)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Credit Information */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Credit Information</h3>

                {/* Credit Monitoring Service */}
                {showCreditMonitoring && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500/30'
                      : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className={`w-6 h-6 mt-0.5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className={`font-semibold text-lg mb-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>Premium Credit Monitoring</h4>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Real-time credit monitoring from all three bureaus with AI-powered insights
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDarkMode
                                ? 'bg-green-900/50 text-green-300 border border-green-700'
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              Active
                            </span>
                            <button
                              onClick={() => setShowCreditMonitoring(false)}
                              className={`p-1 rounded-full hover:bg-gray-500/20 transition-colors ${
                                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                              }`}
                              title="Decline offer"
                            >
                              <XIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className={`w-4 h-4 ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`} />
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>3-Bureau Credit Reports</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className={`w-4 h-4 ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`} />
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Daily Score Updates</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className={`w-4 h-4 ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`} />
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Identity Theft Protection</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className={`w-4 h-4 ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`} />
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Credit Score Simulator</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className={`p-3 rounded-lg mb-4 ${
                          isDarkMode
                            ? 'bg-gray-800/50 border border-gray-700'
                            : 'bg-white border border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>Monthly Subscription</p>
                              <p className={`text-2xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>$24.99<span className={`text-sm font-normal ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>/month</span></p>
                            </div>
                            <div className={`text-right`}>
                              <p className={`text-xs line-through ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>$39.99</p>
                              <p className={`text-xs font-medium ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`}>Save 38%</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowVerificationWizard(true)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <LinkIcon className="w-5 h-5" />
                              <span>Connect & Verify Credit</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setShowCreditMonitoring(false)}
                            className={`w-full px-6 py-1.5 border rounded-lg font-medium transition-colors text-sm ${
                              isDarkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Decline
                          </button>
                        </div>

                        {/* Security Note */}
                        <div className={`mt-3 flex items-start gap-2`}>
                          <ShieldCheckIcon className={`w-4 h-4 mt-0.5 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <p className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Bank-level encryption. We partner with Experian, Equifax, and TransUnion to provide comprehensive credit monitoring. Your data is never sold or shared.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Credit Score (Estimated)</label>
                    <input
                      type="number"
                      defaultValue="750"
                      min="300"
                      max="850"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Have you filed for bankruptcy?</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <option>No</option>
                      <option>Yes, Chapter 7</option>
                      <option>Yes, Chapter 13</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Any foreclosures in the past 7 years?</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Any late payments in the past 2 years?</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <option>No</option>
                      <option>Yes, 1-2 times</option>
                      <option>Yes, 3+ times</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Employment Information */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Employment Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Employment Status *</label>
                      <select className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}>
                        <option>Full-Time Employee</option>
                        <option>Part-Time Employee</option>
                        <option>Self-Employed</option>
                        <option>Contractor/Freelancer</option>
                        <option>Retired</option>
                        <option>Unemployed</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Employer Name *</label>
                      <input
                        type="text"
                        defaultValue="Tech Solutions Inc."
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Job Title *</label>
                      <input
                        type="text"
                        defaultValue="Senior Software Engineer"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Years Employed</label>
                      <input
                        type="number"
                        defaultValue="7"
                        min="0"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Work Phone</label>
                      <input
                        type="tel"
                        defaultValue="(555) 987-6543"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>Industry</label>
                      <select className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}>
                        <option>Technology</option>
                        <option>Finance</option>
                        <option>Healthcare</option>
                        <option>Education</option>
                        <option>Retail</option>
                        <option>Manufacturing</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income Information */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Income Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Annual Salary (Base) *</label>
                    <input
                      type="text"
                      value={annualSalary}
                      onChange={(e) => handleCurrencyChange(e.target.value, setAnnualSalary)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Annual Bonus/Commission</label>
                    <input
                      type="text"
                      value={annualBonus}
                      onChange={(e) => handleCurrencyChange(e.target.value, setAnnualBonus)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Other Income</label>
                    <input
                      type="text"
                      value={otherIncome}
                      onChange={(e) => handleCurrencyChange(e.target.value, setOtherIncome)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Total Annual Income</label>
                    <input
                      type="text"
                      value={calculateTotalIncome()}
                      disabled
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-900 border-gray-800 text-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Assets & Liabilities */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Assets & Liabilities</h3>

                <div className="space-y-6">
                  {/* Assets */}
                  <div>
                    <h4 className={`text-md font-medium mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Assets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Cash & Savings</label>
                        <input
                          type="text"
                          value={cashSavings}
                          onChange={(e) => handleCurrencyChange(e.target.value, setCashSavings)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Investment Accounts</label>
                        <input
                          type="text"
                          value={investments}
                          onChange={(e) => handleCurrencyChange(e.target.value, setInvestments)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Retirement Accounts (401k/IRA)</label>
                        <input
                          type="text"
                          value={retirement}
                          onChange={(e) => handleCurrencyChange(e.target.value, setRetirement)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Real Estate Value</label>
                        <input
                          type="text"
                          value={realEstate}
                          onChange={(e) => handleCurrencyChange(e.target.value, setRealEstate)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div>
                    <h4 className={`text-md font-medium mb-3 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Liabilities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Credit Card Debt</label>
                        <input
                          type="text"
                          value={creditCardDebt}
                          onChange={(e) => handleCurrencyChange(e.target.value, setCreditCardDebt)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Auto Loans</label>
                        <input
                          type="text"
                          value={autoLoans}
                          onChange={(e) => handleCurrencyChange(e.target.value, setAutoLoans)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Student Loans</label>
                        <input
                          type="text"
                          value={studentLoans}
                          onChange={(e) => handleCurrencyChange(e.target.value, setStudentLoans)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Other Debts</label>
                        <input
                          type="text"
                          value={otherDebts}
                          onChange={(e) => handleCurrencyChange(e.target.value, setOtherDebts)}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Supporting Documents</h3>
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    isDarkMode
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <p className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Upload documents to support your loan application
                    </p>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      W-2s, Pay Stubs, Tax Returns, Bank Statements
                    </p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Choose Files
                    </button>
                  </div>

                  {/* Document List */}
                  <div className="space-y-2">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          W-2_2023.pdf
                        </span>
                      </div>
                      <button className={`text-sm ${
                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                      }`}>
                        Remove
                      </button>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          Pay_Stub_Dec_2023.pdf
                        </span>
                      </div>
                      <button className={`text-sm ${
                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                      }`}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <button className={`px-6 py-2 border rounded-lg transition-colors ${
                  isDarkMode
                    ? 'border-gray-700 text-gray-300 hover:border-gray-600'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-24 md:pb-6"
            >
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Notification Preferences</h3>
                <div className="space-y-3">
                  {['Transaction Alerts', 'Weekly Reports', 'Account Updates', 'Security Alerts'].map(item => (
                    <label key={item} className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item}
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-24 md:pb-6"
            >
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Security Settings</h3>
                <div className="space-y-4">
                  <button className={`w-full text-left p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                  } transition-colors flex items-center justify-between`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                      Change Password
                    </span>
                    <ChevronRightIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  <button className={`w-full text-left p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                  } transition-colors flex items-center justify-between`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                      Two-Factor Authentication
                    </span>
                    <ChevronRightIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-24 md:pb-6"
            >
              {/* AI Voice Settings (Simple) */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>AI Voice Settings</h3>
                <div className="space-y-4">
                  {/* Voice choice simplified as radio buttons */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Voice</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        { key: 'calm_female_finance', label: 'Calm Female' },
                        { key: 'professional_female', label: 'Professional Female' },
                        { key: 'professional_male', label: 'Professional Male' },
                      ].map(v => (
                        <label key={v.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <input
                            type="radio"
                            name="voice_preset"
                            checked={voicePreset === (v.key as any)}
                            onChange={() => setVoicePreset(v.key as any)}
                          />
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{v.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quality simplified as radio buttons */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quality</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[{ id: MODELS.turbo, label: 'Fast (Turbo)' }, { id: MODELS.monolingual, label: 'Premium (Mono V1)' }].map(m => (
                        <label key={m.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <input type="radio" name="voice_model" checked={modelId === m.id} onChange={() => setModelId(m.id)} />
                          <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Volume + Autoplay */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Volume: {voiceVolume.toFixed(2)}</label>
                    <input type="range" min="0" max="1" step="0.05" value={voiceVolume} onChange={(e)=>setVoiceVolume(parseFloat(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Autoplay Responses</label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={voiceAutoplay} onChange={(e)=>setVoiceAutoplay(e.target.checked)} />
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{voiceAutoplay ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  {/* Advanced settings toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedVoice(v => !v)}
                      className={`text-sm underline ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {showAdvancedVoice ? 'Hide advanced voice settings' : 'Show advanced voice settings'}
                    </button>
                  </div>

                  {showAdvancedVoice && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stability: {voiceStability.toFixed(2)}</label>
                        <input type="range" min="0" max="1" step="0.05" value={voiceStability} onChange={(e)=>setVoiceStability(parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Similarity: {voiceSimilarity.toFixed(2)}</label>
                        <input type="range" min="0" max="1" step="0.05" value={voiceSimilarity} onChange={(e)=>setVoiceSimilarity(parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Style: {voiceStyle.toFixed(2)}</label>
                        <input type="range" min="0" max="1" step="0.05" value={voiceStyle} onChange={(e)=>setVoiceStyle(parseFloat(e.target.value))} className="w-full" />
                      </div>
                      <div className="md:col-span-3 flex items-center justify-between">
                        <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Speaker Boost</label>
                        <input type="checkbox" checked={useSpeakerBoost} onChange={(e)=>setUseSpeakerBoost(e.target.checked)} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={handleTestVoice} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`} disabled={voiceTestLoading}>
                    {voiceTestLoading ? 'Testing…' : 'Play Sample'}
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Notification Preferences</h3>
                <div className="space-y-3">
                  {['Transaction Alerts', 'Weekly Reports', 'Account Updates', 'Security Alerts'].map(item => (
                    <label key={item} className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Security</h3>
                <div className="space-y-4">
                  <button className={`w-full text-left p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-500'} transition-colors flex items-center justify-between`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>Change Password</span>
                    <ChevronRightIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                  <button className={`w-full text-left p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-500'} transition-colors flex items-center justify-between`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>Two-Factor Authentication</span>
                    <ChevronRightIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>

              {/* App Preferences */}
              <div className={`p-6 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>App Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
                    <select className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Mobile Actions Button */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className={`flex gap-3 p-4 rounded-xl backdrop-blur-md border ${
          isDarkMode
            ? 'bg-gray-900/90 border-gray-700'
            : 'bg-white/90 border-gray-200'
        } shadow-lg`}>
          <button
            onClick={handleResetProfile}
            className={`flex-1 px-4 py-3 border rounded-lg transition-colors ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <RefreshIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Reset</span>
            </div>
          </button>
          <button
            onClick={handleSaveProfile}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Update</span>
            </div>
          </button>
        </div>
      </div>

      {/* Credit Verification Wizard */}
      <CreditVerificationWizard
        isOpen={showVerificationWizard}
        onClose={() => setShowVerificationWizard(false)}
        isDarkMode={isDarkMode}
        profileData={{
          ssn: profileSSN,
          name: `${profileFirstName} ${profileLastName}`,
          email: profileEmail,
          phone: profilePhone,
          dateOfBirth: profileDOB
        }}
      />
    </motion.div>
  )
}
