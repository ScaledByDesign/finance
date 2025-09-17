'use client'

import { formatCurrency } from '@/utils/currency'
import {
  HomeIcon,
  TruckIcon,
  PhotographIcon,
  CashIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  LocationMarkerIcon,
  TrashIcon
} from '@heroicons/react/outline'
import { Asset } from './assets-view'

interface AssetCardProps {
  asset: Asset
  onClick: () => void
  onDelete: () => void
  viewMode: 'grid' | 'list'
}

export function AssetCard({ asset, onClick, onDelete, viewMode }: AssetCardProps) {
  const getAssetIcon = () => {
    switch (asset.type) {
      case 'home':
        return <HomeIcon className="h-5 w-5 text-blue-600" />
      case 'vehicle':
        return <TruckIcon className="h-5 w-5 text-green-600" />
      case 'boat':
        return <span className="text-xl">🛥️</span>
      case 'jewelry':
        return <span className="text-xl">💎</span>
      case 'art':
        return <PhotographIcon className="h-5 w-5 text-pink-600" />
      case 'collectible':
        return <span className="text-xl">🏆</span>
      default:
        return <CashIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const appreciation = asset.currentValue - asset.purchasePrice
  const appreciationPercent = ((appreciation / asset.purchasePrice) * 100).toFixed(1)
  const netValue = asset.currentValue - (asset.financing?.remainingBalance || 0)

  if (viewMode === 'list') {
    return (
      <div
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getAssetIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{asset.name}</h3>
              {asset.description && (
                <p className="text-xs text-gray-500 mt-0.5">{asset.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {asset.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <LocationMarkerIcon className="h-3 w-3" />
                    <span>{asset.location}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Purchased {new Date(asset.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatCurrency(asset.currentValue)}</p>
            <div className={`flex items-center justify-end gap-1 ${
              appreciation >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {appreciation >= 0 ? (
                <TrendingUpIcon className="h-3 w-3" />
              ) : (
                <TrendingDownIcon className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">
                {appreciation >= 0 ? '+' : ''}{formatCurrency(appreciation)} ({appreciationPercent}%)
              </span>
            </div>
            {asset.financing && (
              <p className="text-xs text-gray-500 mt-1">
                Net: {formatCurrency(netValue)}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex">
        {/* Image placeholder on the left */}
        <div className="w-24 bg-gradient-to-br from-blue-50 to-indigo-100 relative flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            {getAssetIcon()}
          </div>
          {asset.financing && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" title="Financed" />
          )}
        </div>

        {/* Content on the right */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{asset.name}</h3>
              {asset.description && (
                <p className="text-xs text-gray-500 mt-0.5">{asset.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(asset.currentValue)}</p>
              <div className={`flex items-center justify-end gap-1 ${
                appreciation >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {appreciation >= 0 ? (
                  <TrendingUpIcon className="h-3 w-3" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {appreciation >= 0 ? '+' : ''}{formatCurrency(appreciation)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {asset.location && (
                <div className="flex items-center gap-1">
                  <LocationMarkerIcon className="h-3 w-3" />
                  <span>{asset.location}</span>
                </div>
              )}
              {asset.financing && (
                <span className="text-blue-600 font-medium">
                  Net: {formatCurrency(netValue)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}