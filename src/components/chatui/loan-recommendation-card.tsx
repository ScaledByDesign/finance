'use client'

import { useState } from 'react'
import { formatCurrency } from '@/utils/currency'
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { LoanApplicationModal } from '@/app/v2/components/loan-application-modal'

interface LoanRecommendationCardProps {
  bankName: string
  loanAmount: number
  interestRate: number
  loanTerm: number // in months
  monthlyPayment: number
  benefits: string[]
  preApproved?: boolean
}

const LoanRecommendationCard = ({
  bankName,
  loanAmount,
  interestRate,
  loanTerm,
  monthlyPayment,
  benefits,
  preApproved = false
}: LoanRecommendationCardProps) => {
  const [showModal, setShowModal] = useState(false)

  const handleApplyClick = () => {
    setShowModal(true)
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{bankName}</h4>
            {preApproved && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mt-1">
                Pre-Approved
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{interestRate}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">APR</p>
          </div>
        </div>

        {/* Loan Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Loan Amount</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(loanAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Payment</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(monthlyPayment)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Loan Term</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{loanTerm / 12} years</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Interest</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency((monthlyPayment * loanTerm) - loanAmount)}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Benefits:</p>
          <ul className="space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                <CheckIcon className="h-3 w-3 text-green-500 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyClick}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white rounded-lg py-3 px-4 flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <span className="font-medium">Apply Now</span>
          <ChevronRightIcon className="h-4 w-4 ml-2" />
        </button>

        {/* Quick Actions */}
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Calculate Different Amount
          </button>
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Compare Rates
          </button>
        </div>
      </div>

      {/* Loan Application Modal */}
      <LoanApplicationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        bankName={bankName}
        loanAmount={loanAmount}
        interestRate={interestRate}
        loanTerm={loanTerm}
        isDarkMode={false} // Using light theme as default
      />
    </>
  )
}

export default LoanRecommendationCard
