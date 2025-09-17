/**
 * Centralized currency formatting utilities for the Finance application
 * Ensures consistent money display across all components
 */

export interface CurrencyFormatOptions {
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showSign?: boolean
  compact?: boolean
}

/**
 * Primary currency formatter - use this for all money display
 * Always shows currency symbol and proper formatting
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSign = false,
    compact = false
  } = options

  // Handle edge cases
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00'
  }

  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : (showSign && amount > 0 ? '+' : '')

  // Use compact notation for large numbers if requested
  if (compact && absAmount >= 1000000) {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    })
    return sign + formatter.format(absAmount)
  }

  // Standard currency formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  })

  return sign + formatter.format(absAmount)
}

/**
 * Format currency with explicit positive/negative signs
 * Useful for transaction displays
 */
export function formatCurrencyWithSign(amount: number, options: CurrencyFormatOptions = {}): string {
  return formatCurrency(amount, { ...options, showSign: true })
}

/**
 * Format currency in compact notation (e.g., $1.2M, $500K)
 * Useful for large amounts in dashboards
 */
export function formatCurrencyCompact(amount: number, options: CurrencyFormatOptions = {}): string {
  return formatCurrency(amount, { ...options, compact: true })
}

/**
 * Format percentage values consistently
 */
export function formatPercentage(
  value: number,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const { minimumFractionDigits = 1, maximumFractionDigits = 2 } = options
  
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value / 100)
}

/**
 * Format numbers without currency symbol
 * Useful for calculations or non-monetary numbers
 */
export function formatNumber(
  value: number,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options
  
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value)
}

/**
 * Legacy compatibility - maps to formatCurrency
 * @deprecated Use formatCurrency instead
 */
export const dollarFormatter = (value: number): string => formatCurrency(value)

/**
 * Legacy compatibility - maps to formatNumber
 * @deprecated Use formatNumber instead
 */
export const numberFormatter = (value: number): string => formatNumber(value)

/**
 * Legacy compatibility - maps to formatPercentage
 * @deprecated Use formatPercentage instead
 */
export const percentageFormatter = (value: number): string => formatPercentage(value * 100)
