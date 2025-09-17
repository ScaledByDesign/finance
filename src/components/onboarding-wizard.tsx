'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import { setPlaidState } from '@/store/actions/usePlaid'
import type { AnyAction } from 'redux'
import { updateUserInfo } from '@/store/actions/useUser'
import {
  XIcon,
  UserIcon,
  IdentificationIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CashIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  LocationMarkerIcon,
  PhoneIcon,
  MailIcon,
  LockClosedIcon,
  DocumentTextIcon
} from '@heroicons/react/outline'

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (userData: any) => void
  isDarkMode?: boolean
}

interface UserProfile {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  
  // Address Information
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Financial Information
  employmentStatus: string
  employer: string
  annualIncome: string
  monthlyExpenses: string
  
  // Goals and Preferences
  primaryGoals: string[]
  riskTolerance: string
  investmentExperience: string
  
  // Privacy and Notifications
  marketingConsent: boolean
  dataProcessingConsent: boolean
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export function OnboardingWizard({ isOpen, onClose, onComplete, isDarkMode = false }: OnboardingWizardProps) {
  const dispatch = useDispatch()
  const { linkToken } = useSelector((state: RootState) => state.plaid)
  const user = useSelector((state: RootState) => state.user.user)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bankAccountConnected, setBankAccountConnected] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([])
  
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    employmentStatus: '',
    employer: '',
    annualIncome: '',
    monthlyExpenses: '',
    primaryGoals: [],
    riskTolerance: '',
    investmentExperience: '',
    marketingConsent: false,
    dataProcessingConsent: false,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  })

  const totalSteps = 6

  const steps = [
    { id: 1, name: 'Welcome', icon: SparklesIcon },
    { id: 2, name: 'Personal', icon: UserIcon },
    { id: 3, name: 'Address', icon: LocationMarkerIcon },
    { id: 4, name: 'Financial', icon: CurrencyDollarIcon },
    { id: 5, name: 'Banking', icon: CashIcon },
    { id: 6, name: 'Complete', icon: CheckCircleIcon }
  ]

  // Pre-populate form with existing user data
  useEffect(() => {
    if (user && isOpen) {
      const updatedProfile = {
        ...profile,
        firstName: user.given_name || profile.firstName,
        lastName: user.family_name || profile.lastName,
        email: user.email || profile.email,
        phone: user.phone || profile.phone,
        dateOfBirth: user.date_of_birth || profile.dateOfBirth,
        // Address fields
        street: user.address?.street || profile.street,
        city: user.address?.city || profile.city,
        state: user.address?.state || profile.state,
        zipCode: user.address?.zip_code || profile.zipCode,
        country: user.address?.country || profile.country,
        // Financial fields
        employmentStatus: user.employment_status || profile.employmentStatus,
        employer: user.employer || profile.employer,
        annualIncome: user.annual_income || profile.annualIncome,
        monthlyExpenses: user.monthly_expenses || profile.monthlyExpenses,
        // Goals and preferences
        primaryGoals: user.primary_goals || profile.primaryGoals,
        riskTolerance: user.risk_tolerance || profile.riskTolerance,
        investmentExperience: user.investment_experience || profile.investmentExperience,
        // Consent preferences
        marketingConsent: user.marketing_consent ?? profile.marketingConsent,
        dataProcessingConsent: user.data_processing_consent ?? profile.dataProcessingConsent,
        notificationPreferences: {
          email: user.notification_preferences?.email ?? profile.notificationPreferences.email,
          sms: user.notification_preferences?.sms ?? profile.notificationPreferences.sms,
          push: user.notification_preferences?.push ?? profile.notificationPreferences.push
        }
      }

      setProfile(updatedProfile)

      // Determine the appropriate starting step based on existing data
      let startStep = 1

      // If basic personal info exists, skip to address step
      if (user.given_name && user.family_name && user.email) {
        startStep = 3
      }

      // If address info exists, skip to financial step
      if (user.address?.street && user.address?.city) {
        startStep = 4
      }

      // If financial info exists, skip to banking step
      if (user.employment_status && user.annual_income) {
        startStep = 5
      }

      // If everything is complete, go to final step
      if (user.given_name && user.email && user.address?.street && user.employment_status) {
        startStep = 6
      }

      setCurrentStep(startStep)
    }
  }, [user, isOpen])

  // Initialize Plaid Link Token
  useEffect(() => {
    const initPlaidToken = async () => {
      try {
        const response = await fetch('/api/v1/plaid/create_link_token')
        const data = await response.json()
        if (data.link_token) {
          dispatch(setPlaidState({ linkToken: data.link_token, linkSuccess: true }) as unknown as AnyAction)
        }
      } catch (error) {
        console.error('Error creating Plaid link token:', error)
      }
    }

    if (isOpen && !linkToken) {
      initPlaidToken()
    }
  }, [isOpen, linkToken, dispatch])

  // Plaid Link Configuration
  const onPlaidSuccess = useCallback(async (public_token: string, metadata: any) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/v1/plaid/set_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_token,
          metadata,
          type: 0
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBankAccountConnected(true)
        setConnectedAccounts(metadata.accounts || [])
        console.log('Bank account connected successfully:', data)
      }
    } catch (error) {
      console.error('Error connecting bank account:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const plaidConfig: PlaidLinkOptions = {
    token: linkToken?.[0]?.link_token || '',
    onSuccess: onPlaidSuccess,
    onExit: (err, metadata) => {
      console.log('Plaid Link exit:', err, metadata)
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event:', eventName, metadata)
    }
  }

  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink(plaidConfig)

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsProcessing(true)
    
    try {
      // Update user profile
      await dispatch(updateUserInfo({
        name: `${profile.firstName} ${profile.lastName}`,
        given_name: profile.firstName,
        family_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        // Add other profile fields as needed
      } as any) as unknown as AnyAction)

      // Call completion callback
      onComplete({
        profile,
        bankAccountConnected,
        connectedAccounts
      })
      
      onClose()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  // Helper function to check if a field was pre-populated from user data
  const isFieldPrePopulated = (field: keyof UserProfile): boolean => {
    if (!user) return false

    const fieldMappings: Record<string, string> = {
      firstName: 'given_name',
      lastName: 'family_name',
      email: 'email',
      phone: 'phone',
      dateOfBirth: 'date_of_birth',
      street: 'address.street',
      city: 'address.city',
      state: 'address.state',
      zipCode: 'address.zip_code',
      country: 'address.country',
      employmentStatus: 'employment_status',
      employer: 'employer',
      annualIncome: 'annual_income',
      monthlyExpenses: 'monthly_expenses'
    }

    const userField = fieldMappings[field]
    if (!userField) return false

    // Handle nested fields like address.street
    if (userField.includes('.')) {
      const [parent, child] = userField.split('.')
      return !!(user[parent] && user[parent][child])
    }

    return !!user[userField]
  }

  // Helper function to get input field styling with pre-populated indicator
  const getInputClassName = (field: keyof UserProfile, baseClassName: string): string => {
    const isPrePopulated = isFieldPrePopulated(field)
    const prePopulatedStyle = isPrePopulated
      ? isDarkMode
        ? 'border-green-600 bg-green-900/20'
        : 'border-green-500 bg-green-50'
      : ''

    return `${baseClassName} ${prePopulatedStyle}`
  }

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }))
  }

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (!match) return value
    return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return true
      case 2: return profile.firstName && profile.lastName && profile.email && profile.dateOfBirth
      case 3: return profile.street && profile.city && profile.state && profile.zipCode
      case 4: return profile.employmentStatus && profile.annualIncome
      case 5: return bankAccountConnected || currentStep === 5 // Allow skipping bank connection
      case 6: return profile.dataProcessingConsent
      default: return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <SparklesIcon className={`w-10 h-10 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome to Finance
              </h3>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Let&apos;s set up your personalized financial dashboard in just a few steps.
              </p>

              {/* Show existing data summary if user has some profile data */}
              {user && (user.given_name || user.email || user.address?.street) && (
                <div className={`mt-4 p-3 rounded-lg ${
                  isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                      We found some of your information
                    </span>
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                    {user.given_name && user.family_name && 'Name, '}
                    {user.email && 'Email, '}
                    {user.phone && 'Phone, '}
                    {user.address?.street && 'Address, '}
                    {user.employment_status && 'Employment'}
                    {/* Remove trailing comma */}
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    We&apos;ll pre-fill these fields to save you time!
                  </p>
                </div>
              )}
            </div>
            <div className={`grid grid-cols-2 gap-4 max-w-md mx-auto text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" />
                Bank-level security
              </div>
              <div className="flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" />
                Data encryption
              </div>
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" />
                GDPR compliant
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                No hidden fees
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Personal Information
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tell us about yourself to personalize your experience
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  First Name * {isFieldPrePopulated('firstName') && (
                    <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      (from profile)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => updateProfile('firstName', e.target.value)}
                  className={getInputClassName('firstName', `w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`)}
                  placeholder="John"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Last Name * {isFieldPrePopulated('lastName') && (
                    <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      (from profile)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => updateProfile('lastName', e.target.value)}
                  className={getInputClassName('lastName', `w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address * {isFieldPrePopulated('email') && (
                  <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    (from profile)
                  </span>
                )}
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                className={getInputClassName('email', `w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`)}
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile('phone', formatPhone(e.target.value))}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Address Information
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We need your address for account verification and security
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Street Address *
              </label>
              <input
                type="text"
                value={profile.street}
                onChange={(e) => updateProfile('street', e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  City *
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => updateProfile('city', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="New York"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  State *
                </label>
                <select
                  value={profile.state}
                  onChange={(e) => updateProfile('state', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select State</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  {/* Add more states as needed */}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={profile.zipCode}
                  onChange={(e) => updateProfile('zipCode', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="12345"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Country
                </label>
                <select
                  value={profile.country}
                  onChange={(e) => updateProfile('country', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Financial Information
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Help us understand your financial situation to provide better insights
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Employment Status *
              </label>
              <select
                value={profile.employmentStatus}
                onChange={(e) => updateProfile('employmentStatus', e.target.value)}
                className={`w-full p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Select Employment Status</option>
                <option value="employed">Employed Full-time</option>
                <option value="part-time">Employed Part-time</option>
                <option value="self-employed">Self-employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </div>

            {profile.employmentStatus && profile.employmentStatus !== 'unemployed' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Employer/Company
                </label>
                <input
                  type="text"
                  value={profile.employer}
                  onChange={(e) => updateProfile('employer', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Company Name"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Annual Income *
                </label>
                <select
                  value={profile.annualIncome}
                  onChange={(e) => updateProfile('annualIncome', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select Income Range</option>
                  <option value="under-25k">Under $25,000</option>
                  <option value="25k-50k">$25,000 - $50,000</option>
                  <option value="50k-75k">$50,000 - $75,000</option>
                  <option value="75k-100k">$75,000 - $100,000</option>
                  <option value="100k-150k">$100,000 - $150,000</option>
                  <option value="150k-plus">$150,000+</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Monthly Expenses
                </label>
                <select
                  value={profile.monthlyExpenses}
                  onChange={(e) => updateProfile('monthlyExpenses', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select Expense Range</option>
                  <option value="under-1k">Under $1,000</option>
                  <option value="1k-2k">$1,000 - $2,000</option>
                  <option value="2k-3k">$2,000 - $3,000</option>
                  <option value="3k-5k">$3,000 - $5,000</option>
                  <option value="5k-plus">$5,000+</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Primary Financial Goals (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Save for emergency fund',
                  'Pay off debt',
                  'Buy a home',
                  'Retirement planning',
                  'Investment growth',
                  'Education funding'
                ].map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      profile.primaryGoals.includes(goal)
                        ? isDarkMode
                          ? 'bg-blue-900/30 border-blue-500'
                          : 'bg-blue-50 border-blue-300'
                        : isDarkMode
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile.primaryGoals.includes(goal)}
                      onChange={() => toggleGoal(goal)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      profile.primaryGoals.includes(goal)
                        ? 'bg-blue-600 border-blue-600'
                        : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      {profile.primaryGoals.includes(goal) && (
                        <CheckCircleIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {goal}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Connect Your Bank Account
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Securely connect your bank account to get personalized insights
              </p>
            </div>

            {!bankAccountConnected ? (
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <CashIcon className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>

                <div className="space-y-2">
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Bank-Level Security
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    We use 256-bit encryption and never store your banking credentials
                  </p>
                </div>

                <button
                  onClick={() => openPlaidLink()}
                  disabled={!plaidReady || isProcessing}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plaidReady && !isProcessing
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? 'Connecting...' : 'Connect Bank Account'}
                </button>

                <button
                  onClick={handleNext}
                  className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
                >
                  Skip for now
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <CheckCircleIcon className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>

                <div>
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Bank Account Connected!
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {connectedAccounts.length} account(s) connected successfully
                  </p>
                </div>

                <div className="space-y-2">
                  {connectedAccounts.map((account, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {account.name}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {account.subtype}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 6:
        return (
          <div className="text-center space-y-6">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircleIcon className={`w-10 h-10 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>

            <div>
              <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Almost Done!
              </h3>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Review your preferences and complete setup
              </p>
            </div>

            <div className="space-y-4">
              <label className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={profile.dataProcessingConsent}
                  onChange={(e) => updateProfile('dataProcessingConsent', e.target.checked)}
                  className="mt-1"
                />
                <div className="text-left">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Data Processing Consent *
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    I consent to the processing of my personal data for providing financial services
                  </div>
                </div>
              </label>

              <label className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <input
                  type="checkbox"
                  checked={profile.marketingConsent}
                  onChange={(e) => updateProfile('marketingConsent', e.target.checked)}
                />
                <div className="text-left">
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Marketing Communications
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receive tips, insights, and product updates (optional)
                  </div>
                </div>
              </label>
            </div>
          </div>
        )

      default:
        return <div>Step content not implemented</div>
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl shadow-xl ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <SparklesIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Account Setup
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between p-6 overflow-x-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-[80px]">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 text-center ${
                        isActive
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-3 ${
                        currentStep > step.id
                          ? 'bg-green-500'
                          : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between p-6 border-t ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Previous
              </button>

              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentStep} of {totalSteps}
              </span>

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                    isStepValid()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={!isStepValid() || isProcessing}
                  className={`flex items-center gap-2 px-6 py-2 text-sm rounded-lg transition-colors ${
                    isStepValid() && !isProcessing
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? 'Setting up...' : 'Complete Setup'}
                  <CheckCircleIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
