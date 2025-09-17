'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Transaction } from '../../hooks/useTransactions'

interface OverviewChartProps {
  isDarkMode?: boolean
  transactions?: Transaction[]
  timeRange?: string
}

// Default demo data for when no transactions are available
const demoData = [
  { name: 'Mon', income: 1200, expense: 800 },
  { name: 'Tue', income: 1800, expense: 1200 },
  { name: 'Wed', income: 2200, expense: 900 },
  { name: 'Thu', income: 1600, expense: 1100 },
  { name: 'Fri', income: 2400, expense: 1400 },
  { name: 'Sat', income: 1900, expense: 1600 },
  { name: 'Sun', income: 2100, expense: 1000 },
]

// Process transactions into chart data based on time range
const processTransactionData = (transactions: Transaction[], timeRange: string) => {
  if (!transactions || transactions.length === 0) return demoData

  const now = new Date()
  const data: { [key: string]: { income: number; expense: number } } = {}

  // Determine date range and grouping
  let startDate: Date
  let groupBy: 'day' | 'week' | 'month'

  switch (timeRange) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      groupBy = 'day'
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      groupBy = 'day'
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      groupBy = 'day'
      break
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      groupBy = 'month'
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      groupBy = 'day'
  }

  // Filter transactions within date range
  const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate)

  // Group transactions by time period
  filteredTransactions.forEach(transaction => {
    const date = new Date(transaction.date)
    let key: string

    if (groupBy === 'day') {
      if (timeRange === '24h') {
        key = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
      } else {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        key = dayNames[date.getDay()]
      }
    } else {
      key = date.toLocaleDateString('en-US', { month: 'short' })
    }

    if (!data[key]) {
      data[key] = { income: 0, expense: 0 }
    }

    if (transaction.amount > 0) {
      data[key].income += transaction.amount
    } else {
      data[key].expense += Math.abs(transaction.amount)
    }
  })

  // Convert to array and ensure we have data for each period
  const chartData: { name: string; income: number; expense: number }[] = []

  if (groupBy === 'day') {
    if (timeRange === '24h') {
      // Show last 24 hours
      for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
        const key = hour.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
        chartData.push({
          name: key,
          income: Math.round(data[key]?.income || 0),
          expense: Math.round(data[key]?.expense || 0)
        })
      }
    } else {
      // Show days of week
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const daysToShow = timeRange === '7d' ? 7 : 30

      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const key = dayNames[date.getDay()]
        const dayData = data[key] || { income: 0, expense: 0 }

        if (timeRange === '30d') {
          // For 30 days, show date instead of day name
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          chartData.push({
            name: dateKey,
            income: Math.round(dayData.income),
            expense: Math.round(dayData.expense)
          })
        } else {
          chartData.push({
            name: key,
            income: Math.round(dayData.income),
            expense: Math.round(dayData.expense)
          })
        }
      }
    }
  } else {
    // Monthly view for 1 year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = monthDate.toLocaleDateString('en-US', { month: 'short' })
      chartData.push({
        name: key,
        income: Math.round(data[key]?.income || 0),
        expense: Math.round(data[key]?.expense || 0)
      })
    }
  }

  // If we have no data, return demo data
  if (chartData.every(d => d.income === 0 && d.expense === 0)) {
    return demoData
  }

  // Limit data points for better mobile visibility
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const maxPoints = isMobile ? 5 : 7

  if (timeRange === '30d') {
    // For 30 days, show weekly aggregates on mobile, daily on desktop
    if (isMobile && chartData.length > 7) {
      const weeklyData: { name: string; income: number; expense: number }[] = []
      for (let i = 0; i < chartData.length; i += 7) {
        const weekSlice = chartData.slice(i, Math.min(i + 7, chartData.length))
        const weekIncome = weekSlice.reduce((sum, d) => sum + d.income, 0)
        const weekExpense = weekSlice.reduce((sum, d) => sum + d.expense, 0)
        weeklyData.push({
          name: `Week ${Math.floor(i / 7) + 1}`,
          income: Math.round(weekIncome / weekSlice.length),
          expense: Math.round(weekExpense / weekSlice.length)
        })
      }
      return weeklyData
    }
  } else if (chartData.length > maxPoints && timeRange !== '1y') {
    return chartData.slice(-maxPoints)
  }

  return chartData
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`rounded-lg p-2 sm:p-3 ${
        isDarkMode
          ? 'bg-gray-900 border border-gray-700'
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        <p className={`text-xs sm:text-sm mb-1 sm:mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs sm:text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function OverviewChart({ isDarkMode = true, transactions, timeRange = '7d' }: OverviewChartProps) {
  const gridColor = isDarkMode ? '#334155' : '#e5e7eb'
  const axisColor = isDarkMode ? '#64748b' : '#9ca3af'
  const tickColor = isDarkMode ? '#94a3b8' : '#6b7280'
  const legendColor = isDarkMode ? '#e5e7eb' : '#374151'

  // Process transaction data based on time range
  const chartData = processTransactionData(transactions || [], timeRange)

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke={axisColor}
            tick={{ fill: tickColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            interval="preserveStartEnd"
            angle={timeRange === '30d' ? -45 : 0}
            textAnchor={timeRange === '30d' ? 'end' : 'middle'}
            height={timeRange === '30d' ? 60 : 30}
          />
          <YAxis
            stroke={axisColor}
            tick={{ fill: tickColor, fontSize: 10 }}
            axisLine={{ stroke: gridColor }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`
              }
              return value
            }}
            width={35}
          />
          <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            iconType="line"
            iconSize={14}
            formatter={(value) => <span style={{ color: legendColor, fontSize: '12px' }}>{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
            activeDot={{ r: 5 }}
            name="Expense"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
