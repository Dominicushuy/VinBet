// src/hooks/queries/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData, buildQueryString } from '@/utils/fetchUtils'
import { GAME_QUERY_KEYS } from './useGameQueries'

// Query keys - theo chuẩn để tránh key conflicts
// Removed useCallback memoization as requested
export const ADMIN_QUERY_KEYS = {
  paymentRequests: params => ['admin', 'payment-requests', params],
  usersList: params => ['admin', 'users', params],
  dashboard: ['admin', 'dashboard'],
  metrics: params => ['admin', 'metrics', params],
  transactions: params => ['admin', 'transactions', params],
  user: id => ['admin', 'user', id]
}

// Timeout chung cho tất cả API requests
const API_TIMEOUT = 30000 // 30 giây

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

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await fetchData(`/api/admin/payment-requests${queryString}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
  },

  // Phê duyệt/từ chối payment request
  processPaymentRequest: async (id, action, data) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await postData(`/api/admin/payment-requests/${id}/${action}`, data, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
  },

  // Lấy danh sách người dùng
  getUsers: async params => {
    const queryString = buildQueryString({
      query: params?.query,
      page: params?.page,
      pageSize: params?.pageSize,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
      status: params?.status
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await fetchData(`/api/admin/users${queryString}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
  },

  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await fetchData('/api/admin/dashboard-summary', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
  },

  // Lấy metrics theo thời gian
  getMetrics: async params => {
    const queryString = buildQueryString({
      startDate: params?.startDate,
      endDate: params?.endDate,
      interval: params?.interval
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await fetchData(`/api/admin/metrics${queryString}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
  },

  getUserDetail: async userId => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await fetchData(`/api/admin/users/${userId}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
  },

  // Improved error handling for updateUser
  updateUser: async (userId, data) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      if (!userId) {
        throw new Error('ID người dùng không hợp lệ')
      }

      const result = await postData(`/api/admin/users/${userId}`, data, {
        method: 'PUT',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Cập nhật thông tin bị hủy do quá thời gian')
      }
      // Enhanced error handling
      if (error.status === 404) {
        throw new Error('Không tìm thấy người dùng')
      } else if (error.status === 403) {
        throw new Error('Bạn không có quyền cập nhật thông tin người dùng này')
      } else if (error.status === 400) {
        throw new Error(error.message || 'Dữ liệu không hợp lệ')
      }
      throw error
    }
  },

  // Improved error handling for setGameResult
  setGameResult: async (gameId, data) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      if (!gameId) {
        throw new Error('ID trận đấu không hợp lệ')
      }

      if (!data || !data.result) {
        throw new Error('Thiếu thông tin kết quả trận đấu')
      }

      const result = await postData(`/api/admin/games/${gameId}/results`, data, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Cập nhật kết quả bị hủy do quá thời gian')
      }
      // Enhanced error handling
      if (error.status === 404) {
        throw new Error('Không tìm thấy trận đấu')
      } else if (error.status === 403) {
        throw new Error('Bạn không có quyền cập nhật kết quả trận đấu này')
      } else if (error.status === 400) {
        throw new Error(error.message || 'Dữ liệu kết quả không hợp lệ')
      } else if (error.status === 409) {
        throw new Error('Trận đấu đã có kết quả và không thể cập nhật lại')
      }
      throw error
    }
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

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const result = await fetchData(`/api/admin/transactions${queryString}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return result
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu bị hủy do quá thời gian')
      }
      throw error
    }
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
