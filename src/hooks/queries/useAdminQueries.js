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

// Timeout settings for different types of operations
const TIMEOUTS = {
  default: 10000, // 10s
  dashboard: 20000, // 20s
  userDetail: 15000, // 15s
  longOperation: 30000, // 30s
  export: 40000, // 40s
  payment: 15000 // 15s
}

// Hàm helper với timeout theo loại
const withTimeout = async (promise, timeoutMs = TIMEOUTS.default) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const result = await promise(controller.signal)
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

    return withTimeout(signal => fetchData(`/api/admin/payment-requests${queryString}`, { signal }), TIMEOUTS.payment)
  },

  // Phê duyệt/từ chối payment request
  processPaymentRequest: async ({ id, action, data }) => {
    // Validate UUID format
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error('ID yêu cầu không hợp lệ')
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('Hành động không hợp lệ')
    }

    return withTimeout(
      signal => postData(`/api/admin/payment-requests/${id}/${action}`, data, { signal }),
      TIMEOUTS.payment
    )
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

    return withTimeout(signal => fetchData(`/api/admin/users${queryString}`, { signal }), TIMEOUTS.default)
  },

  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    return withTimeout(signal => fetchData('/api/admin/dashboard-summary', { signal }), TIMEOUTS.dashboard)
  },

  // Lấy metrics theo thời gian
  getMetrics: async params => {
    const queryString = buildQueryString({
      startDate: params?.startDate,
      endDate: params?.endDate,
      interval: params?.interval
    })

    return withTimeout(signal => fetchData(`/api/admin/metrics${queryString}`, { signal }), TIMEOUTS.dashboard)
  },

  getUserDetail: async userId => {
    return withTimeout(signal => fetchData(`/api/admin/users/${userId}`, { signal }), TIMEOUTS.userDetail)
  },

  // Improved error handling for updateUser
  updateUser: async (userId, data) => {
    if (!userId) {
      throw new Error('ID người dùng không hợp lệ')
    }

    return withTimeout(async signal => {
      try {
        const result = await postData(`/api/admin/users/${userId}`, data, {
          method: 'PUT',
          signal
        })
        return result
      } catch (error) {
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
    }, TIMEOUTS.longOperation)
  },

  // Improved error handling for setGameResult
  setGameResult: async (gameId, data) => {
    if (!gameId) {
      throw new Error('ID trận đấu không hợp lệ')
    }

    if (!data || !data.result) {
      throw new Error('Thiếu thông tin kết quả trận đấu')
    }

    return withTimeout(async signal => {
      try {
        const result = await postData(`/api/admin/games/${gameId}/results`, data, { signal })
        return result
      } catch (error) {
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
    }, TIMEOUTS.longOperation)
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

    return withTimeout(signal => fetchData(`/api/admin/transactions${queryString}`, { signal }), TIMEOUTS.default)
  },

  exportUsers: async params => {
    const queryString = buildQueryString(params)

    return withTimeout(
      async signal => {
        const response = await fetch(`/api/admin/users/export${queryString}`, { signal })
        if (!response.ok) {
          throw new Error('Không thể xuất dữ liệu người dùng')
        }
        return response
      },
      TIMEOUTS.export // Long timeout for export operations
    )
  },

  resetUserPassword: async userId => {
    return withTimeout(
      signal => postData(`/api/admin/users/${userId}/reset-password`, {}, { signal }),
      TIMEOUTS.default
    )
  }
}

// Queries
export function useAdminPaymentRequestsQuery(params, options = {}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.paymentRequests(params),
    queryFn: () => adminApi.getPaymentRequests(params),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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

export function useProcessPaymentRequestMutation(options = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action, data }) => adminApi.processPaymentRequest({ id, action, data }),
    onSuccess: (_, variables) => {
      const successMessage =
        variables.action === 'approve' ? 'Yêu cầu thanh toán đã được phê duyệt' : 'Yêu cầu thanh toán đã bị từ chối'

      toast.success(successMessage)

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.paymentRequests()
      })

      // Invalidate user balance if approving deposit/withdrawal
      queryClient.invalidateQueries({
        queryKey: ['profile']
      })

      if (options.onSuccess) {
        options.onSuccess(_, variables)
      }
    },
    onError: (error, variables, context) => {
      toast.error(error.message || 'Không thể xử lý yêu cầu thanh toán')

      if (options.onError) {
        options.onError(error, variables, context)
      }
    },
    ...options
  })
}

export function useResetPasswordMutation(options = {}) {
  return useMutation({
    mutationFn: userId => adminApi.resetUserPassword(userId),
    onSuccess: () => {
      toast.success('Đã gửi email reset mật khẩu thành công')
      if (options.onSuccess) {
        options.onSuccess()
      }
    },
    onError: error => {
      toast.error(error.message || 'Không thể gửi reset mật khẩu')
      if (options.onError) {
        options.onError(error)
      }
    }
  })
}
