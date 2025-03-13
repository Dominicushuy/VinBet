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
      minAmount: params?.minAmount,
      maxAmount: params?.maxAmount,
      page: params?.page,
      pageSize: params?.pageSize,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder
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
  },

  // Get chart data
  getChartData: async params => {
    const queryString = buildQueryString({
      chartType: params?.chartType || 'bar',
      timeRange: params?.timeRange || '30days',
      type: params?.type,
      startDate: params?.startDate,
      endDate: params?.endDate
    })

    return fetchData(`/api/transactions/chart${queryString}`)
  },

  // Export transactions
  exportTransactions: async (params, format) => {
    const queryString = buildQueryString({
      ...params,
      format
    })

    // Return fetch promise directly for blob handling
    return fetch(`/api/transactions/export${queryString}`, {
      method: 'GET'
    })
  }
}

// Queries
export function useTransactionsQuery(params) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.transactions(params),
    queryFn: () => transactionApi.getTransactions(params),
    staleTime: 60 * 1000, // 1 minute
    keepPreviousData: true, // Giữ dữ liệu cũ khi fetch mới
    retry: 1, // Chỉ retry 1 lần
    refetchOnWindowFocus: false // Không refetch khi focus lại window
  })
}

export function useTransactionSummaryQuery(params) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.summary(params),
    queryFn: () => transactionApi.getTransactionSummary(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: false
  })
}

export function useTransactionChartQuery(params) {
  return useQuery({
    queryKey: ['transactions', 'chart', params],
    queryFn: () => transactionApi.getChartData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  })
}
