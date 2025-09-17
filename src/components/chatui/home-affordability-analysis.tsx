'use client'

import { useState } from 'react'
import { formatCurrency } from '@/utils/currency'
import { ChevronRightIcon } from '@heroicons/react/outline'
import LoanRecommendationCard from './loan-recommendation-card'

interface HomeAffordabilityAnalysisProps {
  targetPrice?: number
  downPayment?: number
  showLoanOptions?: boolean
  monthlyIncome?: number
  monthlyExpenses?: number
  currentSavings?: number
  creditScore?: number
}

const HomeAffordabilityAnalysis = ({
  targetPrice = 750000,
  downPayment = 20,
  showLoanOptions = false,
  monthlyIncome = 29167, // Default from demo data
  monthlyExpenses = 8500,
  currentSavings = 185000,
  creditScore = 780
}: HomeAffordabilityAnalysisProps) => {
  const [selectedHomePrice, setSelectedHomePrice] = useState(targetPrice)
  const [selectedDownPayment, setSelectedDownPayment] = useState(downPayment)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  // Calculate affordability metrics
  const calculateAffordability = () => {
    // DTI (Debt-to-Income) calculation
    const currentMonthlyDebt = 1200 // Car payment + other debts
    const targetDTI = 0.28 // Front-end DTI ratio (28% is standard)
    const maxDTI = 0.36 // Back-end DTI ratio (36% is conservative)

    // Maximum monthly payment based on DTI
    const maxHousingPayment = monthlyIncome * targetDTI - currentMonthlyDebt

    // Mortgage calculation parameters
    const interestRate = creditScore >= 760 ? 0.065 : creditScore >= 700 ? 0.068 : 0.072 // Excellent credit gets best rates
    const loanTerm = 30 // years
    const propertyTaxRate = 0.0125 // 1.25% annually
    const homeInsuranceRate = 0.0035 // 0.35% annually
    const pmiRate = selectedDownPayment < 20 ? 0.005 : 0 // PMI if down payment < 20%

    // Calculate loan amount
    const downPaymentAmount = selectedHomePrice * (selectedDownPayment / 100)
    const loanAmount = selectedHomePrice - downPaymentAmount

    // Monthly mortgage payment (P&I)
    const monthlyRate = interestRate / 12
    const numberOfPayments = loanTerm * 12
    const monthlyPayment = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    // Additional monthly costs
    const propertyTax = (selectedHomePrice * propertyTaxRate) / 12
    const homeInsurance = (selectedHomePrice * homeInsuranceRate) / 12
    const pmi = (loanAmount * pmiRate) / 12
    const hoa = 350 // Estimated HOA fees

    // Total monthly payment
    const totalMonthlyPayment = monthlyPayment + propertyTax + homeInsurance + pmi + hoa

    // Closing costs (typically 2-5% of loan amount)
    const closingCosts = loanAmount * 0.03

    // Total cash needed at closing
    const totalCashNeeded = downPaymentAmount + closingCosts

    // Calculate maximum affordable home price
    const maxLoanPayment = maxHousingPayment - propertyTax - homeInsurance - hoa
    const maxLoanAmount = maxLoanPayment *
      ((Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)))
    const maxHomePrice = maxLoanAmount / (1 - selectedDownPayment / 100)

    return {
      monthlyPayment,
      propertyTax,
      homeInsurance,
      pmi,
      hoa,
      totalMonthlyPayment,
      downPaymentAmount,
      loanAmount,
      closingCosts,
      totalCashNeeded,
      maxHomePrice,
      maxHousingPayment,
      dtiRatio: (totalMonthlyPayment + currentMonthlyDebt) / monthlyIncome,
      interestRate,
      isAffordable: totalMonthlyPayment <= maxHousingPayment && totalCashNeeded <= currentSavings
    }
  }

  const affordability = calculateAffordability()

  // Loan recommendations data
  const loanRecommendations = [
    {
      bankName: "Wells Fargo",
      loanAmount: affordability.loanAmount,
      interestRate: 6.5,
      loanTerm: 360,
      monthlyPayment: affordability.monthlyPayment,
      benefits: ["No origination fees", "Rate lock for 60 days", "Digital application"],
      preApproved: true
    },
    {
      bankName: "Bank of America",
      loanAmount: affordability.loanAmount,
      interestRate: 6.45,
      loanTerm: 360,
      monthlyPayment: affordability.monthlyPayment - 50,
      benefits: ["Preferred rewards discount", "First-time buyer program", "Closing cost assistance"],
      preApproved: true
    },
    {
      bankName: "Chase",
      loanAmount: affordability.loanAmount,
      interestRate: 6.55,
      loanTerm: 360,
      monthlyPayment: affordability.monthlyPayment + 25,
      benefits: ["Relationship discount available", "Fast closing", "No PMI options"],
      preApproved: false
    }
  ]

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Home Affordability Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your financial profile, here's what you can afford
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maximum Affordable</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(affordability.maxHomePrice)}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Based on 28% DTI</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Home Price</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedHomePrice)}</p>
          <p className={`text-xs mt-1 ${affordability.isAffordable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {affordability.isAffordable ? `✓ Within budget` : `✗ Over budget`}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Payment</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(affordability.totalMonthlyPayment)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {((affordability.totalMonthlyPayment / monthlyIncome) * 100).toFixed(1)}% of income
          </p>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Adjust Parameters</h3>

        {/* Home Price Slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Home Price</label>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(selectedHomePrice)}</span>
          </div>
          <input
            type="range"
            min="300000"
            max="2000000"
            step="50000"
            value={selectedHomePrice}
            onChange={(e) => setSelectedHomePrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>$300K</span>
            <span>$2M</span>
          </div>
        </div>

        {/* Down Payment Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Down Payment</label>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{selectedDownPayment}% ({formatCurrency(affordability.downPaymentAmount)})</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={selectedDownPayment}
            onChange={(e) => setSelectedDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>5%</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div
          className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Payment Breakdown</h3>
          <ChevronRightIcon
            className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform ${showDetailedBreakdown ? 'rotate-90' : ''}`}
          />
        </div>

        {showDetailedBreakdown && (
          <div className="p-4">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">Principal & Interest</td>
                  <td className="py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(affordability.monthlyPayment)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">Property Tax</td>
                  <td className="py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(affordability.propertyTax)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">Home Insurance</td>
                  <td className="py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(affordability.homeInsurance)}</td>
                </tr>
                {affordability.pmi > 0 && (
                  <tr>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">PMI</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(affordability.pmi)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400">HOA Fees</td>
                  <td className="py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{formatCurrency(affordability.hoa)}</td>
                </tr>
                <tr className="font-bold bg-gray-50 dark:bg-gray-700">
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100">Total Monthly Payment</td>
                  <td className="py-3 text-sm text-gray-900 dark:text-gray-100 text-right">{formatCurrency(affordability.totalMonthlyPayment)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cash Needed Section */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Cash Needed at Closing</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">Down Payment ({selectedDownPayment}%)</span>
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(affordability.downPaymentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-300">Estimated Closing Costs</span>
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(affordability.closingCosts)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-300 dark:border-blue-600">
            <span className="text-base font-semibold text-blue-900 dark:text-blue-100">Total Cash Needed</span>
            <span className="text-base font-bold text-blue-900 dark:text-blue-100">{formatCurrency(affordability.totalCashNeeded)}</span>
          </div>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
          You have {formatCurrency(currentSavings)} available • {affordability.totalCashNeeded <= currentSavings ? '✓ Sufficient funds' : '✗ Need additional funds'}
        </p>
      </div>

      {/* Loan Options */}
      {showLoanOptions && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pre-Qualified Loan Options</h3>
          {loanRecommendations.map((loan, index) => (
            <LoanRecommendationCard
              key={index}
              {...loan}
            />
          ))}
        </div>
      )}

      {/* Bottom Line Summary */}
      <div className={`rounded-lg p-6 border ${affordability.isAffordable ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${affordability.isAffordable ? 'text-green-900 dark:text-green-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
          🎯 Bottom Line
        </h3>
        <p className={`text-sm ${affordability.isAffordable ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
          {affordability.isAffordable ?
            `The ${formatCurrency(selectedHomePrice)} home is comfortably within your budget, using only ${((affordability.totalMonthlyPayment / monthlyIncome) * 100).toFixed(1)}% of your monthly income. This leaves substantial room for savings and investments.` :
            `The ${formatCurrency(selectedHomePrice)} home would use ${((affordability.totalMonthlyPayment / monthlyIncome) * 100).toFixed(1)}% of your monthly income, exceeding the recommended 28% DTI ratio. Consider a lower price point around ${formatCurrency(affordability.maxHomePrice)}.`
          }
        </p>
      </div>
    </div>
  )
}

export default HomeAffordabilityAnalysis