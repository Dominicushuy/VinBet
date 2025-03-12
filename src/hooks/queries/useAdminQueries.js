// src/hooks/queries/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData, buildQueryString } from '@/utils/fetchUtils'
import { GAME_QUERY_KEYS } from './useGameQueries'

// Query keys - theo chuẩn để tránh key conflicts
export const ADMIN_QUERY_KEYS = {
  paymentRequests: params => ['admin', 'payment-requests', params],
  usersList: params => ['admin', 'users', params],
  dashboard: ['admin', 'dashboard'],
  metrics: params => ['admin', 'metrics', params],
  transactions: params => ['admin', 'transactions', params],
  user: id => ['admin', 'user', id]
}

// API functions
export const adminApi = {
  // Lấy danh sách các payment requests
  getPaymentRequests: async params => {
    const queryString = buildQueryString({
      type: params?.type,
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize,
      startDate: params?.startDate,
      endDate: params?.endDate,
      search: params?.search,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder
    })

    return fetchData(`/api/admin/payment-requests${queryString}`)
  },

  // Phê duyệt/từ chối payment request
  processPaymentRequest: async (id, action, data) => {
    return postData(`/api/admin/payment-requests/${id}/${action}`, data)
  },

  // Lấy danh sách người dùng
  getUsers: async params => {
    const queryString = buildQueryString({
      query: params?.query,
      page: params?.page,
      pageSize: params?.pageSize,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder
    })

    return fetchData(`/api/admin/users${queryString}`)
  },

  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    return fetchData('/api/admin/dashboard-summary')
  },

  // Lấy metrics theo thời gian
  getMetrics: async params => {
    const queryString = buildQueryString({
      startDate: params?.startDate,
      endDate: params?.endDate,
      interval: params?.interval
    })

    return fetchData(`/api/admin/metrics${queryString}`)
  },

  getUserDetail: async userId => {
    return fetchData(`/api/admin/users/${userId}`)
  },

  updateUser: async (userId, data) => {
    return postData(`/api/admin/users/${userId}`, data, { method: 'PUT' })
  },

  setGameResult: async (gameId, data) => {
    return postData(`/api/admin/games/${gameId}/results`, data)
  },

  getTransactions: async (params = {}) => {
    const queryString = buildQueryString({
      type: params?.type,
      status: params?.status,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      startDate: params?.startDate,
      endDate: params?.endDate,
      sortBy: params?.sortBy || 'created_at',
      sortOrder: params?.sortOrder || 'desc'
    })

    return fetchData(`/api/admin/transactions${queryString}`)
  }
}

// Queries
export function useAdminPaymentRequestsQuery(params, options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.paymentRequests(params),
    queryFn: () => adminApi.getPaymentRequests(params),
    ...options
  })
}

export function useAdminUsersQuery(params, options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.usersList(params),
    queryFn: () => adminApi.getUsers(params),
    ...options
  })
}

// Admin Dashboard Query
export function useAdminDashboardQuery(options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard,
    queryFn: adminApi.getDashboardStats,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    refetchOnWindowFocus: false, // Không refetch khi focus tab
    ...options
  })
}

// Admin Metrics Query
export function useAdminMetricsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.metrics(params),
    queryFn: () => adminApi.getMetrics(params),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    refetchOnWindowFocus: false,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    ...options
  })
}

// User Detail Query
export function useUserDetailQuery(userId, options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.user(userId),
    queryFn: () => adminApi.getUserDetail(userId),
    enabled: !!userId,
    ...options
  })
}

// Update User Mutation
export function useUpdateUserMutation(options = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success('Thông tin người dùng đã được cập nhật')

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.user(variables.id)
      })

      queryClient.invalidateQueries({
        queryKey: ['admin', 'users']
      })

      if (options.onSuccess) {
        options.onSuccess(_, variables)
      }
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'Không thể cập nhật thông tin người dùng')

      if (options.onError) {
        options.onError(error, variables, context)
      }
    },
    ...options
  })
}

// Set Game Result Mutation
export function useSetGameResultMutation(options = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gameId, data }) => adminApi.setGameResult(gameId, data),
    onSuccess: (_, variables) => {
      toast.success('Kết quả đã được cập nhật thành công')

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gameDetail(variables.gameId)
      })

      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gamesList()
      })

      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.activeGames
      })

      if (options.onSuccess) {
        options.onSuccess(_, variables)
      }
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'Không thể cập nhật kết quả')

      if (options.onError) {
        options.onError(error, variables, context)
      }
    },
    ...options
  })
}

// Admin Transactions Query
export function useAdminTransactionsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.transactions(params),
    queryFn: () => adminApi.getTransactions(params),
    staleTime: 1 * 60 * 1000, // 1 phút
    ...options
  })
}
