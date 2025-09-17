'use client'

import { useState, useEffect, useCallback } from 'react'
import apiCall from '@/utils/apiCall'

export interface Transaction {
  id: string
  name: string
  amount: number
  date: string
  category: string[]
  merchant_name?: string
  payment_channel?: string
  pending?: boolean
  account_id?: string
  account?: string
  iso_currency_code?: string
  personal_finance_category?: {
    primary?: string
    detailed?: string
  }
}

export interface TransactionFilter {
  currentPage?: number
  pageSize?: number
  filterDate?: {
    startDate: string | null
    endDate: string | null
  }
  merchantName?: string
  priceRange?: {
    minPrice: string
    maxPrice: string
  }
  selectedAccounts?: string[]
  selectedCategories?: string[]
  selectedPaymentChannel?: string
  selectedFinCategories?: string[]
}

export interface TransactionData {
  size: number
  data: Transaction[]
  message?: string
}

export const useTransactions = (initialFilter?: Partial<TransactionFilter>) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [filter, setFilter] = useState<TransactionFilter>({
    currentPage: 1,
    pageSize: 100,
    filterDate: {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      endDate: new Date().toISOString()
    },
    merchantName: '',
    priceRange: { minPrice: '', maxPrice: '' },
    selectedAccounts: [],
    selectedCategories: [],
    selectedPaymentChannel: 'all',
    selectedFinCategories: [],
    ...initialFilter
  })

  const fetchTransactions = useCallback(async (customFilter?: Partial<TransactionFilter>) => {
    setLoading(true)
    setError(null)

    const requestFilter = {
      filter: {
        ...filter,
        ...customFilter
      }
    }

    try {
      // First try to sync transactions from Plaid
      try {
        await apiCall.get('/api/v1/plaid/transactions')
      } catch (syncError) {
        console.log('Transaction sync skipped:', syncError)
      }

      // Then fetch the transaction data
      const response = await apiCall.post('/api/v1/transaction/getData', requestFilter)

      if (response.data) {
        const data = response.data as TransactionData
        setTransactions(data.data || [])
        setTotalCount(data.size || 0)

        // Log for debugging
        console.log('Fetched transactions:', {
          count: data.data?.length || 0,
          total: data.size || 0,
          hasData: !!data.data
        })
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to fetch transactions')
      setTransactions([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [filter])

  // Initial fetch
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Update filter and refetch
  const updateFilter = useCallback((newFilter: Partial<TransactionFilter>) => {
    const updatedFilter = { ...filter, ...newFilter }
    setFilter(updatedFilter)
    fetchTransactions(newFilter)
  }, [filter, fetchTransactions])

  // Refresh transactions
  const refresh = useCallback(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    totalCount,
    loading,
    error,
    filter,
    updateFilter,
    refresh
  }
}