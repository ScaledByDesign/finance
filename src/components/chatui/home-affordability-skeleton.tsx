'use client'

import { Card } from '@tremor/react'

const HomeAffordabilitySkeleton = () => {
  return (
    <Card className="mx-auto">
      <div className="animate-pulse space-y-4">
        {/* Title Section */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded max-w-80"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded max-w-96"></div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="mt-6 space-y-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-10 bg-gray-50 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="h-10 bg-gray-50 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <div className="h-12 bg-blue-200 dark:bg-blue-800 rounded w-full"></div>
        </div>
      </div>
    </Card>
  )
}

export default HomeAffordabilitySkeleton