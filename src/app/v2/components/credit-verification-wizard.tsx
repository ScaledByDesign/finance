'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XIcon,
  ShieldCheckIcon,
  UserIcon,
  IdentificationIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LockClosedIcon,
  DocumentTextIcon,
  FingerPrintIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  TrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/outline'

interface CreditVerificationWizardProps {
  isOpen: boolean
  onClose: () => void
  isDarkMode: boolean
  profileData?: {
    ssn?: string
    name?: string
    email?: string
    phone?: string
    dateOfBirth?: string
  }
}

export function CreditVerificationWizard({ isOpen, onClose, isDarkMode, profileData }: CreditVerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [creditReport, setCreditReport] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['scores']))
  const [verificationData, setVerificationData] = useState({
    // Personal Info
    ssn: profileData?.ssn || '',
    dateOfBirth: profileData?.dateOfBirth || '',

    // Identity Verification
    idType: 'drivers_license',
    idNumber: '',
    idState: '',

    // Knowledge-Based Authentication
    kbaAnswers: {} as Record<string, string>,

    // Bureau Selection
    selectedBureaus: ['experian', 'equifax', 'transunion'],

    // Consent
    consentGiven: false,
    signatureName: profileData?.name || ''
  })

  const totalSteps = 7

  const steps = [
    { id: 1, name: 'Personal', icon: UserIcon },
    { id: 2, name: 'Identity', icon: IdentificationIcon },
    { id: 3, name: 'Security', icon: ShieldCheckIcon },
    { id: 4, name: 'Bureaus', icon: CreditCardIcon },
    { id: 5, name: 'Consent', icon: DocumentTextIcon },
    { id: 6, name: 'Processing', icon: FingerPrintIcon },
    { id: 7, name: 'Complete', icon: CheckCircleIcon }
  ]

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

  const handleSubmit = async () => {
    setIsProcessing(true)
    setCurrentStep(6)

    // Simulate processing and fetching credit report
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)

      // Simulate credit report data
      setCreditReport({
        scores: {
          experian: 750,
          equifax: 745,
          transunion: 748
        },
        accounts: {
          total: 12,
          open: 8,
          closed: 4,
          onTime: 98.5
        },
        creditUtilization: 22,
        creditAge: 7.5,
        hardInquiries: 2,
        publicRecords: 0,
        collections: 0
      })

      setCurrentStep(7)
    }, 3000)
  }

  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/)
    if (!match) return value
    return !match[2] ? match[1] : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ''}`
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        // Personal Information
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              We need this information to verify your identity with the credit bureaus.
            </p>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Social Security Number *</label>
              <input
                type="text"
                placeholder="XXX-XX-XXXX"
                value={verificationData.ssn}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  ssn: formatSSN(e.target.value)
                })}
                maxLength={11}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Date of Birth *</label>
              <input
                type="date"
                value={verificationData.dateOfBirth}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  dateOfBirth: e.target.value
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start gap-2">
                <ExclamationCircleIcon className={`w-5 h-5 mt-0.5 ${
                  isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  Your SSN is encrypted and only used for credit bureau verification. We never store it in plain text.
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        // Identity Verification
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Identity Verification
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please provide a government-issued ID for additional verification.
            </p>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>ID Type *</label>
              <select
                value={verificationData.idType}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  idType: e.target.value
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="drivers_license">Driver{`'`}s License</option>
                <option value="state_id">State ID</option>
                <option value="passport">Passport</option>
                <option value="military_id">Military ID</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>ID Number *</label>
              <input
                type="text"
                placeholder="Enter ID number"
                value={verificationData.idNumber}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  idNumber: e.target.value
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {verificationData.idType === 'drivers_license' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Issuing State *</label>
                <select
                  value={verificationData.idState}
                  onChange={(e) => setVerificationData({
                    ...verificationData,
                    idState: e.target.value
                  })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select State</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                  <option value="FL">Florida</option>
                  {/* Add more states as needed */}
                </select>
              </div>
            )}
          </div>
        )

      case 3:
        // Knowledge-Based Authentication
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Security Questions
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Answer these questions based on your credit history to verify your identity.
            </p>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Which of these addresses have you lived at?</label>
                <div className="space-y-2">
                  {['123 Main St, Springfield', '456 Oak Ave, Portland', '789 Pine Rd, Seattle', 'None of the above'].map((address) => (
                    <label key={address} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="address"
                        value={address}
                        onChange={(e) => setVerificationData({
                          ...verificationData,
                          kbaAnswers: { ...verificationData.kbaAnswers, address: e.target.value }
                        })}
                        className="text-blue-600"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {address}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>What is your current auto loan payment?</label>
                <div className="space-y-2">
                  {['$0-200', '$201-400', '$401-600', 'I don\'t have an auto loan'].map((payment) => (
                    <label key={payment} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="payment"
                        value={payment}
                        onChange={(e) => setVerificationData({
                          ...verificationData,
                          kbaAnswers: { ...verificationData.kbaAnswers, payment: e.target.value }
                        })}
                        className="text-blue-600"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {payment}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        // Bureau Selection
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Credit Bureau Selection
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select which credit bureaus to pull your report from. We recommend all three for comprehensive monitoring.
            </p>

            <div className="space-y-3">
              {[
                { id: 'experian', name: 'Experian', description: 'FICO Score 8, Credit Report' },
                { id: 'equifax', name: 'Equifax', description: 'VantageScore 3.0, Credit Report' },
                { id: 'transunion', name: 'TransUnion', description: 'VantageScore 3.0, Credit Report' }
              ].map((bureau) => (
                <label
                  key={bureau.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    verificationData.selectedBureaus.includes(bureau.id)
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
                    checked={verificationData.selectedBureaus.includes(bureau.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVerificationData({
                          ...verificationData,
                          selectedBureaus: [...verificationData.selectedBureaus, bureau.id]
                        })
                      } else {
                        setVerificationData({
                          ...verificationData,
                          selectedBureaus: verificationData.selectedBureaus.filter(b => b !== bureau.id)
                        })
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {bureau.name}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {bureau.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className={`p-3 rounded-lg ${
              isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className={`w-5 h-5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                  All 3 bureaus selected for comprehensive coverage
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        // Consent & Terms
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Consent & Authorization
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please review and accept our terms to proceed with credit verification.
            </p>

            <div className={`h-48 p-4 overflow-y-auto rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
            }`}>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Credit Report Authorization
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                By clicking {`"`}I Agree{`"`} below, you authorize us to obtain your credit report from the selected credit bureaus.
                This is a soft inquiry and will not affect your credit score.
                <br /><br />
                We will use this information solely for the purpose of providing you with credit monitoring services and
                loan qualification assessment. Your information is protected with bank-level encryption and will never be
                sold or shared with third parties without your explicit consent.
                <br /><br />
                You have the right to dispute any inaccurate information found in your credit report directly with the
                credit bureaus. We will provide you with tools and guidance to help you through this process if needed.
              </p>
            </div>

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={verificationData.consentGiven}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  consentGiven: e.target.checked
                })}
                className="mt-1"
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                I have read and agree to the terms and conditions, including the credit report authorization
              </span>
            </label>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Digital Signature (Type your full name) *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={verificationData.signatureName}
                onChange={(e) => setVerificationData({
                  ...verificationData,
                  signatureName: e.target.value
                })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } font-serif text-lg`}
              />
            </div>
          </div>
        )

      case 6:
        // Processing
        return (
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/20 animate-pulse">
                <FingerPrintIcon className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Verifying Your Identity
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we securely verify your information with the credit bureaus...
            </p>

            <div className="space-y-3 max-w-xs mx-auto">
              {['Encrypting data', 'Connecting to bureaus', 'Retrieving reports', 'Analyzing credit'].map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${
                    index < 2
                      ? 'bg-green-500'
                      : index === 2
                        ? 'bg-blue-500 animate-pulse'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`}>
                    {index < 2 && (
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )

      case 7:
        // Success & Credit Report Analysis
        return creditReport ? (
          <div className="space-y-3">
            {/* Compact Success Header */}
            <div className="text-center pb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Credit Report Ready!
              </h3>
            </div>

            {/* Compact Credit Scores in Single Row */}
            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                {Object.entries(creditReport.scores).map(([bureau, score]) => {
                  const s = Number(score as any)
                  return (
                  <div key={bureau} className="text-center flex-1">
                    <p className={`text-[10px] uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>{bureau.slice(0, 3)}</p>
                    <p className={`text-2xl font-bold ${
                      s >= 740 ? 'text-green-500' : s >= 670 ? 'text-yellow-500' : 'text-red-500'
                    }`}>{s}</p>
                  </div>
                )})}
              </div>
              <div className="text-center mt-2">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Average Score: {Math.round((creditReport.scores.experian + creditReport.scores.equifax + creditReport.scores.transunion) / 3)} -
                  <span className="font-medium text-green-500"> Excellent</span>
                </p>
              </div>
            </div>

            {/* Key Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Credit Utilization */}
              <div className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Credit Utilization
                  </span>
                  <span className={`text-sm font-medium ${
                    creditReport.creditUtilization <= 30 ? 'text-green-500' : 'text-yellow-500'
                  }`}>{creditReport.creditUtilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      creditReport.creditUtilization <= 30 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(creditReport.creditUtilization, 100)}%` }}
                  />
                </div>
              </div>

              {/* Payment History */}
              <div className={`p-3 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    On-Time Payments
                  </span>
                  <span className={`text-sm font-medium text-green-500`}>
                    {creditReport.accounts.onTime}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${creditReport.accounts.onTime}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3`}>
              <div className={`p-3 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {creditReport.accounts.total}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Accounts
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {creditReport.creditAge}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Years of Credit
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-2xl font-bold ${
                  creditReport.hardInquiries > 2 ? 'text-yellow-500' : isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {creditReport.hardInquiries}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Hard Inquiries
                </p>
              </div>
              <div className={`p-3 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-2xl font-bold text-green-500`}>
                  {creditReport.collections}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Collections
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
            >
              View Full Credit Report
            </button>
          </div>
        ) : null

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Credit Verification
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400'
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-4 sm:mt-6 overflow-x-auto scrollbar-hide pb-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-[60px]">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs mt-1 hidden sm:block ${
                        isActive
                          ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        currentStep > step.id
                          ? 'bg-green-500'
                          : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 h-[calc(100vh-220px)] sm:h-auto sm:max-h-[60vh] overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || currentStep === 6}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                  currentStep === 1 || currentStep === 6
                    ? 'opacity-50 cursor-not-allowed'
                    : isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Previous
              </button>

              <span className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentStep}/{totalSteps}
              </span>

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              ) : currentStep === 5 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!verificationData.consentGiven || !verificationData.signatureName}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                    verificationData.consentGiven && verificationData.signatureName
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 cursor-not-allowed text-gray-200'
                  }`}
                >
                  <LockClosedIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  Verify Credit
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
