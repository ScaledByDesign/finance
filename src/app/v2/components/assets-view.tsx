'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/utils/currency'
import {
  HomeIcon,
  TruckIcon,
  SparklesIcon,
  CashIcon,
  PlusIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  PhotographIcon,
  LocationMarkerIcon,
  CalendarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  XIcon
} from '@heroicons/react/outline'
import { AssetCard } from './asset-card'
import { AddAssetModal } from './add-asset-modal'
import { useRouter } from 'next/navigation'

export interface Asset {
  id: string
  type: 'home' | 'vehicle' | 'boat' | 'jewelry' | 'art' | 'collectible' | 'other'
  name: string
  description?: string
  purchasePrice: number
  currentValue: number
  purchaseDate: string
  location?: string
  images?: string[]
  financing?: {
    loanAmount: number
    monthlyPayment: number
    remainingBalance: number
    lender: string
    interestRate: number
  }
  insurance?: {
    provider: string
    annualPremium: number
    coverage: number
  }
  details?: Record<string, any>
}

// Demo data for assets
const demoAssets: Asset[] = [
  {
    id: '1',
    type: 'home',
    name: 'Primary Residence',
    description: '4 bed, 3 bath single family home',
    purchasePrice: 750000,
    currentValue: 825000,
    purchaseDate: '2021-06-15',
    location: 'San Francisco, CA',
    financing: {
      loanAmount: 600000,
      monthlyPayment: 3800,
      remainingBalance: 540000,
      lender: 'Wells Fargo',
      interestRate: 3.5
    },
    insurance: {
      provider: 'State Farm',
      annualPremium: 2400,
      coverage: 850000
    },
    details: {
      sqft: 2800,
      lotSize: 6000,
      yearBuilt: 2015,
      beds: 4,
      baths: 3
    }
  },
  {
    id: '2',
    type: 'vehicle',
    name: '2023 Tesla Model S',
    description: 'Long Range AWD',
    purchasePrice: 95000,
    currentValue: 88000,
    purchaseDate: '2023-01-10',
    location: 'Garage',
    financing: {
      loanAmount: 75000,
      monthlyPayment: 1200,
      remainingBalance: 65000,
      lender: 'Tesla Finance',
      interestRate: 4.5
    },
    insurance: {
      provider: 'Progressive',
      annualPremium: 1800,
      coverage: 95000
    },
    details: {
      make: 'Tesla',
      model: 'Model S',
      year: 2023,
      mileage: 12000,
      vin: '5YJ3E1EA5PF123456'
    }
  },
  {
    id: '3',
    type: 'boat',
    name: 'Sea Ray Sundancer 320',
    description: '32ft luxury cruiser',
    purchasePrice: 280000,
    currentValue: 265000,
    purchaseDate: '2022-05-20',
    location: 'Marina Del Rey',
    details: {
      length: 32,
      year: 2022,
      engineHours: 150,
      sleeps: 6
    }
  },
  {
    id: '4',
    type: 'vehicle',
    name: '2022 Porsche 911',
    description: 'Carrera 4S',
    purchasePrice: 145000,
    currentValue: 142000,
    purchaseDate: '2022-03-15',
    location: 'Garage',
    insurance: {
      provider: 'Geico',
      annualPremium: 2400,
      coverage: 145000
    },
    details: {
      make: 'Porsche',
      model: '911 Carrera 4S',
      year: 2022,
      mileage: 8000,
      color: 'GT Silver'
    }
  },
  {
    id: '5',
    type: 'jewelry',
    name: 'Rolex Submariner',
    description: 'Date, 41mm, Oystersteel',
    purchasePrice: 12000,
    currentValue: 15000,
    purchaseDate: '2020-12-25',
    details: {
      brand: 'Rolex',
      model: 'Submariner Date',
      reference: '126610LN',
      condition: 'Excellent'
    }
  }
]

export function AssetsView() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>(demoAssets)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Calculate totals
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
  const totalDebt = assets.reduce((sum, asset) =>
    sum + (asset.financing?.remainingBalance || 0), 0
  )
  const netAssetValue = totalValue - totalDebt
  const totalAppreciation = assets.reduce((sum, asset) =>
    sum + (asset.currentValue - asset.purchasePrice), 0
  )

  // Asset categories with icons and colors
  const categories = [
    { id: 'all', name: 'All Assets', icon: SparklesIcon, color: 'text-gray-600' },
    { id: 'home', name: 'Real Estate', icon: HomeIcon, color: 'text-blue-600' },
    { id: 'vehicle', name: 'Vehicles', icon: TruckIcon, color: 'text-green-600' },
    { id: 'boat', name: 'Boats', icon: null, emoji: '🛥️', color: 'text-cyan-600' },
    { id: 'jewelry', name: 'Jewelry', icon: null, emoji: '💎', color: 'text-purple-600' },
    { id: 'art', name: 'Art', icon: PhotographIcon, color: 'text-pink-600' },
    { id: 'other', name: 'Other', icon: CashIcon, color: 'text-gray-600' }
  ]

  // Filter assets by category
  const filteredAssets = selectedCategory === 'all'
    ? assets
    : assets.filter(asset => asset.type === selectedCategory)

  // Group assets by type for summary
  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = { count: 0, value: 0 }
    }
    acc[asset.type].count++
    acc[asset.type].value += asset.currentValue
    return acc
  }, {} as Record<string, { count: number; value: number }>)

  const handleAddAsset = (newAsset: Omit<Asset, 'id'>) => {
    const asset: Asset = {
      ...newAsset,
      id: Date.now().toString()
    }
    setAssets([...assets, asset])
    setShowAddModal(false)
  }

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id))
    setSelectedAsset(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600 rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assets</h1>
                <p className="text-xs text-gray-500">Track your valuables</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUpIcon className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-600">Total Value</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-green-600 mt-1">
              +{formatCurrency(totalAppreciation)} appreciation
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CashIcon className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Net Value</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(netAssetValue)}</p>
            <p className="text-xs text-gray-500 mt-1">
              After {formatCurrency(totalDebt)} debt
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.icon ? (
                  <category.icon className="h-4 w-4" />
                ) : (
                  <span className="text-base">{category.emoji}</span>
                )}
                <span className="text-sm font-medium">{category.name}</span>
                {assetsByType[category.id] && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {assetsByType[category.id].count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
          </p>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Assets Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          <AnimatePresence mode="popLayout">
            {filteredAssets.map(asset => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AssetCard
                  asset={asset}
                  onClick={() => setSelectedAsset(asset)}
                  onDelete={() => handleDeleteAsset(asset.id)}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedCategory === 'all'
                ? 'Start tracking your valuable assets'
                : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} found`
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Asset
            </button>
          </div>
        )}

        {/* Asset Type Summary */}
        {selectedCategory === 'all' && Object.keys(assetsByType).length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Breakdown</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {Object.entries(assetsByType).map(([type, data]) => {
                const category = categories.find(c => c.id === type)
                const percentage = (data.value / totalValue) * 100
                return (
                  <div key={type} className="px-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {category?.icon ? (
                          <category.icon className={`h-4 w-4 ${category.color}`} />
                        ) : (
                          <span className="text-base">{category?.emoji}</span>
                        )}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {category?.name || type}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({data.count} {data.count === 1 ? 'item' : 'items'})
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(data.value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of portfolio</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAsset}
      />

      {/* Asset Detail Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setSelectedAsset(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <AssetDetailView
                asset={selectedAsset}
                onClose={() => setSelectedAsset(null)}
                onDelete={() => handleDeleteAsset(selectedAsset.id)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Asset Detail View Component
function AssetDetailView({
  asset,
  onClose,
  onDelete
}: {
  asset: Asset
  onClose: () => void
  onDelete: () => void
}) {
  const getAssetIcon = () => {
    switch (asset.type) {
      case 'home': return <HomeIcon className="h-6 w-6 text-blue-600" />
      case 'vehicle': return <TruckIcon className="h-6 w-6 text-green-600" />
      case 'boat': return <span className="text-2xl">🛥️</span>
      case 'jewelry': return <span className="text-2xl">💎</span>
      case 'art': return <PhotographIcon className="h-6 w-6 text-pink-600" />
      default: return <CashIcon className="h-6 w-6 text-gray-600" />
    }
  }

  const appreciation = asset.currentValue - asset.purchasePrice
  const appreciationPercent = ((appreciation / asset.purchasePrice) * 100).toFixed(1)

  return (
    <div>
      {/* Image Header */}
      <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 relative -m-6 mb-6 rounded-t-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-4 bg-white/90 backdrop-blur rounded-full">
            {getAssetIcon()}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-sm"
        >
          <XIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      <div className="p-6 pt-0">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">{asset.name}</h3>
          {asset.description && (
            <p className="text-sm text-gray-500 mt-1">{asset.description}</p>
          )}
        </div>

        {/* Value Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Current Value</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(asset.currentValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Appreciation</p>
            <p className={`text-xl font-bold ${appreciation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {appreciation >= 0 ? '+' : ''}{formatCurrency(appreciation)}
            </p>
            <p className="text-xs text-gray-500">({appreciationPercent}%)</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Purchase Price</span>
              <span className="font-medium text-gray-900">{formatCurrency(asset.purchasePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Purchase Date</span>
              <span className="font-medium text-gray-900">
                {new Date(asset.purchaseDate).toLocaleDateString()}
              </span>
            </div>
            {asset.location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location</span>
                <span className="font-medium text-gray-900">{asset.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financing */}
        {asset.financing && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Financing</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lender</span>
                <span className="font-medium text-gray-900">{asset.financing.lender}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-medium text-gray-900">{asset.financing.interestRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Payment</span>
                <span className="font-medium text-gray-900">{formatCurrency(asset.financing.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining Balance</span>
                <span className="font-medium text-red-600">{formatCurrency(asset.financing.remainingBalance)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Insurance */}
        {asset.insurance && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Insurance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Provider</span>
                <span className="font-medium text-gray-900">{asset.insurance.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Annual Premium</span>
                <span className="font-medium text-gray-900">{formatCurrency(asset.insurance.annualPremium)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Coverage Amount</span>
                <span className="font-medium text-gray-900">{formatCurrency(asset.insurance.coverage)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Details */}
        {asset.details && Object.keys(asset.details).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details</h4>
            <div className="space-y-2">
              {Object.entries(asset.details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium text-gray-900">
                    {typeof value === 'number' && key.toLowerCase().includes('size')
                      ? `${value.toLocaleString()} sqft`
                      : typeof value === 'number'
                      ? value.toLocaleString()
                      : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit Asset
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}