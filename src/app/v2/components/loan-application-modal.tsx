'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { formatCurrency } from '@/utils/currency'
import {
  XIcon,
  CheckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationIcon
} from '@heroicons/react/outline'

interface LoanApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  bankName: string
  loanAmount: number
  interestRate: number
  loanTerm: number // in months
  isDarkMode: boolean
}

type ApplicationStep = 'confirmation' | 'consent' | 'processing' | 'response' | 'deposit' | 'success'

interface LoanTerms {
  approved: boolean
  monthlyPayment: number
  totalInterest: number
  totalAmount: number
  firstPaymentDate: string
  lastPaymentDate: string
  apr: number
  loanId: string
  paymentSchedule: PaymentScheduleItem[]
}

interface PaymentScheduleItem {
  month: number
  date: string
  payment: number
  principal: number
  interest: number
  balance: number
}

export function LoanApplicationModal({
  isOpen,
  onClose,
  bankName,
  loanAmount,
  interestRate,
  loanTerm,
  isDarkMode
}: LoanApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('confirmation')
  const [consentChecked, setConsentChecked] = useState({
    creditCheck: false,
    terms: false,
    privacy: false,
    communication: false
  })
  const [loanTerms, setLoanTerms] = useState<LoanTerms | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [depositConfirmed, setDepositConfirmed] = useState(false)

  // Get Plaid-connected accounts from Redux state
  const { items } = useSelector((state: RootState) => state.user)

  // Debug: Log account filtering for troubleshooting
  console.log('Loan Modal - Redux items:', items?.length || 0, 'items found')

  // Transform Plaid accounts to the format needed for loan deposit selection
  // Filter for deposit accounts (checking, savings) only
  const depositAccounts = items?.flatMap((item: any) =>
    item.accounts?.filter((account: any) => {
      // Filter for deposit accounts (checking, savings) only
      const isDepository = account.type === 'depository'
      const isCheckingOrSavings = account.subtype === 'checking' || account.subtype === 'savings'
      return isDepository || isCheckingOrSavings
    }).map((account: any) => ({
      id: account.account_id || account.id,
      type: account.subtype === 'checking' ? 'Checking' :
            account.subtype === 'savings' ? 'Savings' :
            account.type === 'depository' ? 'Checking' : 'Account',
      name: account.name || account.official_name || 'Account',
      last4: account.mask || '****',
      balance: account.balances?.current || 0,
      institution_name: item.institution?.name || 'Bank'
    })) || []
  ) || []

  console.log('Loan Modal - Found', depositAccounts.length, 'deposit accounts')

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('confirmation')
      setConsentChecked({
        creditCheck: false,
        terms: false,
        privacy: false,
        communication: false
      })
      setLoanTerms(null)
      setSelectedAccount('')
      setDepositConfirmed(false)
    }
  }, [isOpen])

  const calculateLoanTerms = (): LoanTerms => {
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTerm

    // Calculate monthly payment using amortization formula
    const monthlyPayment = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const totalAmount = monthlyPayment * numberOfPayments
    const totalInterest = totalAmount - loanAmount

    // Generate payment schedule
    const paymentSchedule: PaymentScheduleItem[] = []
    let balance = loanAmount
    const today = new Date()

    for (let month = 1; month <= numberOfPayments; month++) {
      const paymentDate = new Date(today)
      paymentDate.setMonth(paymentDate.getMonth() + month)

      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      paymentSchedule.push({
        month,
        date: paymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      })
    }

    const firstPaymentDate = new Date(today)
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)

    const lastPaymentDate = new Date(today)
    lastPaymentDate.setMonth(lastPaymentDate.getMonth() + numberOfPayments)

    return {
      approved: true,
      monthlyPayment,
      totalInterest,
      totalAmount,
      firstPaymentDate: firstPaymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      lastPaymentDate: lastPaymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      apr: interestRate,
      loanId: `LN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      paymentSchedule
    }
  }

  const handleConfirm = () => {
    setCurrentStep('consent')
  }

  const handleConsentSubmit = () => {
    setCurrentStep('processing')
    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      const terms = calculateLoanTerms()
      setLoanTerms(terms)
      setIsProcessing(false)
      setCurrentStep('response')
    }, 3000)
  }

  const allConsentsChecked = Object.values(consentChecked).every(v => v)

  const fmtCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl shadow-xl ${
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Loan Application - {bankName}
                </h2>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentStep === 'confirmation' && 'Review your loan details'}
                  {currentStep === 'consent' && 'Consent and authorization'}
                  {currentStep === 'processing' && 'Processing your application'}
                  {currentStep === 'response' && (loanTerms?.approved ? 'Congratulations! Loan approved' : 'Application status')}
                  {currentStep === 'deposit' && 'Select deposit account'}
                  {currentStep === 'success' && 'Funds transfer confirmed'}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-180px)] sm:max-h-[calc(90vh-200px)]">
              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 sm:p-6 space-y-4 sm:space-y-6"
                >
                  <div className={`rounded-lg p-4 sm:p-6 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'
                  }`}>
                    <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Loan Details
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <CurrencyDollarIcon className="w-5 h-5" />
                          Loan Amount
                        </span>
                        <span className={`text-lg sm:text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {fmtCurrency(loanAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <DocumentTextIcon className="w-5 h-5" />
                          Interest Rate
                        </span>
                        <span className={`text-lg sm:text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {interestRate.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`flex items-center gap-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <CalendarIcon className="w-5 h-5" />
                          Loan Term
                        </span>
                        <span className={`text-lg sm:text-xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {loanTerm} months ({Math.floor(loanTerm / 12)} years)
                        </span>
                      </div>

                      <div className={`pt-3 mt-3 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-blue-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`flex items-center gap-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            <CreditCardIcon className="w-5 h-5" />
                            Estimated Monthly Payment
                          </span>
                          <span className={`text-xl sm:text-2xl font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            {fmtCurrency(
                              loanAmount * (interestRate / 100 / 12 * Math.pow(1 + interestRate / 100 / 12, loanTerm)) /
                              (Math.pow(1 + interestRate / 100 / 12, loanTerm) - 1)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    isDarkMode ? 'bg-yellow-900/20 border border-yellow-800/50' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex gap-3">
                      <ExclamationIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isDarkMode ? 'text-yellow-500' : 'text-yellow-600'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
                        }`}>
                          Important Information
                        </p>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          This is a preliminary offer based on the information provided. Final terms may vary based on credit verification and additional documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Consent Step */}
              {currentStep === 'consent' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 sm:p-6 space-y-3 sm:space-y-4"
                >
                  <div className={`rounded-lg p-4 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <ShieldCheckIcon className="w-5 h-5" />
                      Consent & Authorization
                    </h3>

                    <div className="space-y-3">
                      <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={consentChecked.creditCheck}
                          onChange={(e) => setConsentChecked({...consentChecked, creditCheck: e.target.checked})}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Credit Check Authorization
                          </p>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            I authorize {bankName} to obtain my credit report from credit bureaus to assess my creditworthiness for this loan application.
                          </p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={consentChecked.terms}
                          onChange={(e) => setConsentChecked({...consentChecked, terms: e.target.checked})}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Terms and Conditions
                          </p>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            I have read and agree to the loan terms and conditions, including interest rates, repayment schedule, and any applicable fees.
                          </p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={consentChecked.privacy}
                          onChange={(e) => setConsentChecked({...consentChecked, privacy: e.target.checked})}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Privacy Policy
                          </p>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            I acknowledge that my personal information will be processed in accordance with the bank{`'`}s privacy policy and data protection regulations.
                          </p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}>
                        <input
                          type="checkbox"
                          checked={consentChecked.communication}
                          onChange={(e) => setConsentChecked({...consentChecked, communication: e.target.checked})}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Electronic Communication
                          </p>
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            I consent to receive loan-related communications electronically, including approval notifications, payment reminders, and account statements.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Processing Step */}
              {currentStep === 'processing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 sm:p-12 flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <ClockIcon className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className={`mt-4 sm:mt-6 text-lg sm:text-xl font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Processing Your Application
                  </h3>
                  <p className={`mt-2 text-center ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Please wait while we review your application and verify your information...
                  </p>
                  <div className="mt-8 space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Verifying personal information
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="flex items-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Running credit check
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 }}
                      className="flex items-center gap-2"
                    >
                      <CheckIcon className="w-5 h-5 text-green-500" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Calculating loan terms
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Finalizing approval
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Response Step */}
              {currentStep === 'response' && loanTerms && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 sm:p-6"
                >
                  {/* Success Banner */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          Loan Approved!
                        </h3>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Congratulations! Your loan application has been approved with the following terms:
                        </p>
                        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Loan ID: <span className="font-mono font-semibold">{loanTerms.loanId}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Terms Summary */}
                  <div className={`rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Approved Loan Terms
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Monthly Payment
                        </p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {fmtCurrency(loanTerms.monthlyPayment)}
                        </p>
                      </div>

                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Interest
                        </p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {fmtCurrency(loanTerms.totalInterest)}
                        </p>
                      </div>

                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          First Payment Date
                        </p>
                        <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {loanTerms.firstPaymentDate}
                        </p>
                      </div>

                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last Payment Date
                        </p>
                        <p className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {loanTerms.lastPaymentDate}
                        </p>
                      </div>
                    </div>

                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-center">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Amount to be Paid
                        </p>
                        <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {fmtCurrency(loanTerms.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div className={`rounded-lg p-4 sm:p-6 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Payment Schedule (First 12 Months)
                    </h4>

                    <div className="overflow-x-auto">
                      <table className={`w-full text-xs sm:text-sm`}>
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <th className={`text-left py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Month
                            </th>
                            <th className={`text-left py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Date
                            </th>
                            <th className={`text-right py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Payment
                            </th>
                            <th className={`text-right py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Principal
                            </th>
                            <th className={`text-right py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Interest
                            </th>
                            <th className={`text-right py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loanTerms.paymentSchedule.slice(0, 12).map((payment) => (
                            <tr key={payment.month} className={`border-b ${
                              isDarkMode ? 'border-gray-800' : 'border-gray-100'
                            }`}>
                              <td className={`py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {payment.month}
                              </td>
                              <td className={`py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {payment.date}
                              </td>
                              <td className={`text-right py-2 px-2 sm:px-3 font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {formatCurrency(payment.payment)}
                              </td>
                              <td className={`text-right py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(payment.principal)}
                              </td>
                              <td className={`text-right py-2 px-2 sm:px-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatCurrency(payment.interest)}
                              </td>
                              <td className={`text-right py-2 px-2 sm:px-3 font-medium ${
                                isDarkMode ? 'text-blue-400' : 'text-blue-600'
                              }`}>
                                {formatCurrency(payment.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {loanTerms.paymentSchedule.length > 12 && (
                      <p className={`mt-4 text-sm text-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Showing first 12 months of {loanTerms.paymentSchedule.length} total payments
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Deposit Account Selection Step */}
              {currentStep === 'deposit' && loanTerms && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 sm:p-6"
                >
                  <div className={`rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      <CreditCardIcon className="w-5 h-5" />
                      Select Deposit Account
                    </h4>
                    <p className={`mb-4 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Choose the account where you{`'`}d like to receive your loan funds of {formatCurrency(loanAmount)}
                    </p>

                    {depositAccounts.length === 0 ? (
                      <div className={`p-4 rounded-lg border-2 border-dashed ${
                        isDarkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
                      }`}>
                        <p className={`text-center ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No deposit accounts found. Please connect a checking or savings account first.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <select
                          value={selectedAccount}
                          onChange={(e) => setSelectedAccount(e.target.value)}
                          className={`w-full p-4 rounded-lg border-2 transition-all ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <option value="">Select an account for deposit...</option>
                          {depositAccounts.map((account: any) => (
                            <option key={account.id} value={account.id}>
                              {account.name} - {account.institution_name} • {account.type} ••••{account.last4} ({formatCurrency(account.balance)})
                            </option>
                          ))}
                        </select>

                        {/* Selected Account Details */}
                        {selectedAccount && (
                          <div className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                          }`}>
                            {(() => {
                              const account = depositAccounts.find((a: any) => a.id === selectedAccount)
                              return account ? (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className={`font-medium ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {account.name}
                                    </p>
                                    <p className={`text-sm ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                      {account.institution_name} • {account.type} ••••{account.last4}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className={`text-xs ${
                                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                    }`}>
                                      Available Balance
                                    </p>
                                    <p className={`font-semibold ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {formatCurrency(account.balance)}
                                    </p>
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedAccount && (
                    <div className={`rounded-lg p-4 sm:p-6 mb-4 ${
                      isDarkMode ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <h4 className={`text-base font-semibold mb-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Deposit Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Loan Amount:
                          </span>
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(loanAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Deposit to:
                          </span>
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            ••••{depositAccounts.find((a: any) => a.id === selectedAccount)?.last4}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Expected Date:
                          </span>
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Within 1-2 business days
                          </span>
                        </div>
                      </div>

                      <div className={`mt-4 pt-4 border-t ${
                        isDarkMode ? 'border-blue-800/50' : 'border-blue-200'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={depositConfirmed}
                            onChange={(e) => setDepositConfirmed(e.target.checked)}
                            className="mt-1 w-4 h-4 text-blue-600 rounded"
                          />
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            I confirm that I want to deposit {formatCurrency(loanAmount)} to the selected account and understand that this action cannot be reversed.
                          </p>
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Final Success Step */}
              {currentStep === 'success' && loanTerms && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 sm:p-12 text-center"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                    <CheckIcon className="w-10 h-10 text-green-500" />
                  </div>

                  <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Transfer Initiated Successfully!
                  </h3>

                  <p className={`mb-8 text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your loan funds are being transferred to your selected account.
                  </p>

                  <div className={`rounded-lg p-6 mb-6 text-left ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Loan ID:
                        </span>
                        <span className={`font-mono font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {loanTerms.loanId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Amount:
                        </span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {fmtCurrency(loanAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Deposit Account:
                        </span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ••••{depositAccounts.find((a: any) => a.id === selectedAccount)?.last4}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Status:
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className={`text-sm font-semibold text-green-500`}>
                            Processing
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-lg p-4 text-sm ${
                    isDarkMode ? 'bg-blue-900/20 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      💡 You will receive an email confirmation once the funds are deposited. First payment is due on {loanTerms.firstPaymentDate}.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 sm:p-6 border-t ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center">
                {(currentStep === 'confirmation' || currentStep === 'consent' || currentStep === 'processing') && (
                  <div className="flex gap-2">
                    {['confirmation', 'consent', 'processing'].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          step === currentStep
                            ? 'bg-blue-500'
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {(currentStep === 'response' || currentStep === 'deposit' || currentStep === 'success') && (
                  <div className="flex gap-2">
                    {['response', 'deposit', 'success'].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          step === currentStep
                            ? 'bg-blue-500'
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-3 ml-auto">
                  {currentStep === 'confirmation' && (
                    <>
                      <button
                        onClick={onClose}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors"
                      >
                        Continue to Consent
                      </button>
                    </>
                  )}

                  {currentStep === 'consent' && (
                    <>
                      <button
                        onClick={() => setCurrentStep('confirmation')}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConsentSubmit}
                        disabled={!allConsentsChecked}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          allConsentsChecked
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : isDarkMode
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Submit Application
                      </button>
                    </>
                  )}

                  {currentStep === 'response' && (
                    <button
                      onClick={() => setCurrentStep('deposit')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Proceed to Deposit
                    </button>
                  )}

                  {currentStep === 'deposit' && (
                    <>
                      <button
                        onClick={() => setCurrentStep('response')}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep('success')}
                        disabled={!selectedAccount || !depositConfirmed || depositAccounts.length === 0}
                        className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                          selectedAccount && depositConfirmed && depositAccounts.length > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : isDarkMode
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Confirm & Deposit
                      </button>
                    </>
                  )}

                  {currentStep === 'success' && (
                    <button
                      onClick={onClose}
                      className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
