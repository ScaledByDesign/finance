'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Asset } from './assets-view'
import {
  XIcon,
  HomeIcon,
  TruckIcon,
  CashIcon,
  PhotographIcon,
  SparklesIcon,
  CalendarIcon,
  LocationMarkerIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline'

interface AddAssetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (asset: Omit<Asset, 'id'>) => void
}

const assetTypes = [
  { id: 'home', name: 'Real Estate', icon: HomeIcon, emoji: null },
  { id: 'vehicle', name: 'Vehicle', icon: TruckIcon, emoji: null },
  { id: 'boat', name: 'Boat', icon: null, emoji: '🛥️' },
  { id: 'jewelry', name: 'Jewelry', icon: null, emoji: '💎' },
  { id: 'art', name: 'Art', icon: PhotographIcon, emoji: null },
  { id: 'collectible', name: 'Collectible', icon: null, emoji: '🏆' },
  { id: 'other', name: 'Other', icon: CashIcon, emoji: null }
]

export function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Omit<Asset, 'id'>>>({
    type: 'home',
    name: '',
    description: '',
    purchasePrice: 0,
    currentValue: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    location: ''
  })

  const [showFinancing, setShowFinancing] = useState(false)
  const [showInsurance, setShowInsurance] = useState(false)

  const handleSubmit = () => {
    if (!formData.name || !formData.purchasePrice || !formData.currentValue) {
      return
    }

    const newAsset: Omit<Asset, 'id'> = {
      type: formData.type as Asset['type'],
      name: formData.name,
      description: formData.description,
      purchasePrice: formData.purchasePrice,
      currentValue: formData.currentValue,
      purchaseDate: formData.purchaseDate!,
      location: formData.location,
      financing: showFinancing && formData.financing ? formData.financing : undefined,
      insurance: showInsurance && formData.insurance ? formData.insurance : undefined,
      details: formData.details
    }

    onAdd(newAsset)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      description: '',
      purchasePrice: 0,
      currentValue: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      location: ''
    })
    setShowFinancing(false)
    setShowInsurance(false)
    setStep(1)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Asset</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Asset Type & Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Asset Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {assetTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setFormData({ ...formData, type: type.id as Asset['type'] })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.type === type.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {type.icon ? (
                            <type.icon className="h-5 w-5 mx-auto mb-1 text-gray-700" />
                          ) : (
                            <span className="text-xl block mb-1">{type.emoji}</span>
                          )}
                          <span className="text-xs text-gray-700">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Primary Residence, Tesla Model S"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., 4 bed, 3 bath single family home"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Location (Optional)
                    </label>
                    <div className="relative">
                      <LocationMarkerIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Value & Dates */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Purchase Price
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.purchasePrice || ''}
                        onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Current Value
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.currentValue || ''}
                        onChange={e => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {formData.purchasePrice && formData.currentValue && (
                      <p className={`text-xs mt-1 ${
                        formData.currentValue >= formData.purchasePrice ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formData.currentValue >= formData.purchasePrice ? '↑' : '↓'}
                        {' '}${Math.abs(formData.currentValue - formData.purchasePrice).toLocaleString()}
                        {' '}({((formData.currentValue - formData.purchasePrice) / formData.purchasePrice * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Purchase Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Financing & Insurance (Optional) */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Financing Toggle */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Add Financing Details
                      </label>
                      <button
                        onClick={() => setShowFinancing(!showFinancing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showFinancing ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showFinancing ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {showFinancing && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Lender Name"
                          onChange={e => setFormData({
                            ...formData,
                            financing: { ...formData.financing!, lender: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Loan Amount"
                            onChange={e => setFormData({
                              ...formData,
                              financing: { ...formData.financing!, loanAmount: parseFloat(e.target.value) || 0 }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Interest Rate %"
                            onChange={e => setFormData({
                              ...formData,
                              financing: { ...formData.financing!, interestRate: parseFloat(e.target.value) || 0 }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Monthly Payment"
                            onChange={e => setFormData({
                              ...formData,
                              financing: { ...formData.financing!, monthlyPayment: parseFloat(e.target.value) || 0 }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Remaining Balance"
                            onChange={e => setFormData({
                              ...formData,
                              financing: { ...formData.financing!, remainingBalance: parseFloat(e.target.value) || 0 }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Insurance Toggle */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Add Insurance Details
                      </label>
                      <button
                        onClick={() => setShowInsurance(!showInsurance)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showInsurance ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showInsurance ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {showInsurance && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Insurance Provider"
                          onChange={e => setFormData({
                            ...formData,
                            insurance: { ...formData.insurance!, provider: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            placeholder="Annual Premium"
                            onChange={e => setFormData({
                              ...formData,
                              insurance: { ...formData.insurance!, annualPremium: parseFloat(e.target.value) || 0 }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Coverage Amount"
                            onChange={e => setFormData({
                              ...formData,
                              insurance: { ...formData.insurance!, coverage: parseFloat(e.target.value) || 0 }
                            })}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 && !formData.name}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.purchasePrice || !formData.currentValue}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    Add Asset
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}