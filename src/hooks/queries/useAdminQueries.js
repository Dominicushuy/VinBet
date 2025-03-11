// src/hooks/queries/useAdminQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
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
    const queryParams = new URLSearchParams()
    if (params && params.type) queryParams.append('type', params.type)
    if (params && params.status) queryParams.append('status', params.status)
    if (params && params.page) queryParams.append('page', params.page.toString())
    if (params && params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    // Add these new filter parameters
    if (params && params.startDate) queryParams.append('startDate', params.startDate)
    if (params && params.endDate) queryParams.append('endDate', params.endDate)
    if (params && params.search) queryParams.append('search', params.search)
    if (params && params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params && params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`/api/admin/payment-requests?${queryParams}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy danh sách yêu cầu')
    }

    return response.json()
  },

  // Phê duyệt/từ chối payment request
  processPaymentRequest: async (id, action, data) => {
    const response = await fetch(`/api/admin/payment-requests/${id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Không thể ${action === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu`)
    }

    return response.json()
  },

  // Lấy danh sách người dùng
  getUsers: async params => {
    const queryParams = new URLSearchParams()
    if (params && params.query) queryParams.append('query', params.query)
    if (params && params.page) queryParams.append('page', params.page.toString())
    if (params && params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params && params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params && params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`/api/admin/users?${queryParams}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy danh sách người dùng')
    }

    return response.json()
  },

  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    const response = await fetch('/api/admin/dashboard-summary')

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy thống kê dashboard')
    }

    return response.json()
  },

  // Lấy thống kê dashboard
  getDashboardSummary: async () => {
    const response = await fetch('/api/admin/dashboard-summary')

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy thống kê dashboard')
    }

    return response.json()
  },

  // Lấy metrics theo thời gian
  getMetrics: async params => {
    const queryParams = new URLSearchParams()
    if (params && params.startDate) queryParams.append('startDate', params.startDate)
    if (params && params.endDate) queryParams.append('endDate', params.endDate)
    if (params && params.interval) queryParams.append('interval', params.interval)

    const response = await fetch(`/api/admin/metrics?${queryParams}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy metrics')
    }

    return response.json()
  },

  getUserDetail: async userId => {
    const response = await fetch(`/api/admin/users/${userId}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy thông tin người dùng')
    }

    return response.json()
  },

  updateUser: async (userId, data) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể cập nhật người dùng')
    }

    return response.json()
  },

  setGameResult: async (gameId, data) => {
    const response = await fetch(`/api/admin/games/${gameId}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể cập nhật kết quả game')
    }

    return response.json()
  },

  getTransactions: async () => {
    const response = await fetch('/api/admin/transactions')

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy danh sách giao dịch')
    }

    return response.json()
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
    // Thêm cấu hình để tránh gọi API liên tục
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000 // Tự động refetch sau 5 phút
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
