'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

export function SpendingChart({ detailed = false }: { detailed?: boolean }) {
  const { cumulativeSpend } = useSelector((state: RootState) => state.user)

  const data = cumulativeSpend?.map((item: any) => ({
    month: item.month || item.date,
    spending: item.Spending || item.spend || 0,
    income: item.Income || item.moneyIn || 0,
  })) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="floating-card p-6 lg:p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Spending Overview</h3>
        <select className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
          <option>This year</option>
        </select>
      </div>

      <div className="h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: any) => [`$${value}`, '']}
            />
            <Area
              type="monotone"
              dataKey="spending"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorSpending)"
              strokeWidth={2}
            />
            {detailed && (
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {detailed && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Spending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}