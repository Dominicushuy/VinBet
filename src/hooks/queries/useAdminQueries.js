// src/hooks/queries/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData, buildQueryString } from '@/utils/fetchUtils'
import { GAME_QUERY_KEYS } from './useGameQueries'

// Query keys
export const ADMIN_QUERY_KEYS = {
  paymentRequests: params => ['admin', 'payment-requests', { ...params }],
  usersList: params => ['admin', 'users', { ...params }],
  dashboard: ['admin', 'dashboard'],
  metrics: params => ['admin', 'metrics', { ...params }],
  transactions: ['admin', 'transactions']
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

  // Lấy thống kê dashboard
  getDashboardSummary: async () => {
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

  getTransactions: async () => {
    return fetchData('/api/admin/transactions')
  }
}

// Queries
export function useAdminPaymentRequestsQuery(params) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.paymentRequests(params),
    queryFn: () => adminApi.getPaymentRequests(params)
  })
}

export function useAdminUsersQuery(params) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.usersList(params),
    queryFn: () => adminApi.getUsers(params)
  })
}

// Mutations
export function useProcessPaymentRequestMutation(action) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }) => adminApi.processPaymentRequest(id, action, { notes }),
    onSuccess: () => {
      toast.success(`Yêu cầu đã được ${action === 'approve' ? 'phê duyệt' : 'từ chối'} thành công`)
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.paymentRequests()
      })
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.dashboard
      })
    },
    onError: error => {
      toast.error(error.message || `Không thể ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu`)
    }
  })
}

// Queries
export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard,
    queryFn: adminApi.getDashboardSummary
  })
}

export function useAdminMetricsQuery(params) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.metrics(params),
    queryFn: () => adminApi.getMetrics(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000
  })
}

export function useUserDetailQuery(userId) {
  return useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUserDetail(userId),
    enabled: !!userId
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => adminApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      toast.success('Thông tin người dùng đã được cập nhật')
      queryClient.invalidateQueries({
        queryKey: ['admin', 'user', variables.id]
      })
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.usersList() })
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật thông tin người dùng')
    }
  })
}

export function useSetGameResultMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gameId, data }) => adminApi.setGameResult(gameId, data),
    onSuccess: (_, variables) => {
      toast.success('Kết quả đã được cập nhật thành công')
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gameDetail(variables.gameId)
      })
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.gamesList() })
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.activeGames })
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật kết quả')
    }
  })
}

export function useAdminTransactionsQuery() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.transactions,
    queryFn: adminApi.getTransactions
  })
}
