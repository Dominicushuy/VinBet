// src/hooks/queries/useTransactionQueries.js
import { useQuery } from '@tanstack/react-query'
import { fetchData, buildQueryString } from '@/utils/fetchUtils'

// Query keys
export const TRANSACTION_QUERY_KEYS = {
  transactions: params => ['transactions', 'history', { ...params }],
  summary: params => ['transactions', 'summary', { ...params }]
}

// API functions
const transactionApi = {
  // Get transaction history with filters
  getTransactions: async params => {
    const queryString = buildQueryString({
      type: params?.type,
      status: params?.status,
      startDate: params?.startDate,
      endDate: params?.endDate,
      page: params?.page,
      pageSize: params?.pageSize
    })

    return fetchData(`/api/transactions${queryString}`)
  },

  // Get transaction summary
  getTransactionSummary: async params => {
    const queryString = buildQueryString({
      startDate: params?.startDate,
      endDate: params?.endDate
    })

    return fetchData(`/api/transactions/summary${queryString}`)
  }
}

// Queries
export function useTransactionsQuery(params) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.transactions(params),
    queryFn: () => transactionApi.getTransactions(params)
  })
}

export function useTransactionSummaryQuery(params) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.summary(params),
    queryFn: () => transactionApi.getTransactionSummary(params)
  })
}
