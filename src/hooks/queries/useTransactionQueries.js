// src/hooks/queries/useTransactionQueries.js
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'

// Query keys
export const TRANSACTION_QUERY_KEYS = {
  transactions: params => ['transactions', 'history', { ...params }],
  summary: params => ['transactions', 'summary', { ...params }]
}

// Queries
export function useTransactionsQuery(params) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.transactions(params),
    queryFn: () => apiService.transactions.getTransactions(params)
  })
}

export function useTransactionSummaryQuery(params) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.summary(params),
    queryFn: () => apiService.transactions.getTransactionSummary(params)
  })
}
