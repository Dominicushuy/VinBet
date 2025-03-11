/* eslint-disable react-hooks/rules-of-hooks */
// src/hooks/queries/useNotificationQueries.js (Enhanced)
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Query keys
export const NOTIFICATION_QUERY_KEYS = {
  notifications: params => ['notifications', 'list', { ...params }],
  notificationDetail: id => ['notifications', 'detail', id],
  notificationCount: ['notifications', 'count'],
  settings: ['notifications', 'settings'],
  telegramStatus: ['notifications', 'telegram']
}

// API functions
const notificationApi = {
  // Get user notifications
  getNotifications: async params => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString())
    if (params?.searchQuery) queryParams.append('search', params.searchQuery)

    const response = await fetch(`/api/notifications?${queryParams}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể tải thông báo')
    }

    return response.json()
  },

  // Get notification detail
  getNotificationDetail: async id => {
    const response = await fetch(`/api/notifications/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể tải chi tiết thông báo')
    }

    return response.json()
  },

  // Get unread notification count
  getNotificationCount: async () => {
    const response = await fetch(`/api/notifications/count`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể tải số lượng thông báo')
    }

    return response.json()
  },

  // Mark notification as read
  markNotificationRead: async id => {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'POST'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể đánh dấu đã đọc')
    }

    return response.json()
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const response = await fetch(`/api/notifications/read-all`, {
      method: 'POST'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể đánh dấu tất cả đã đọc')
    }

    return response.json()
  },

  // Delete notification
  deleteNotification: async id => {
    const response = await fetch(`/api/notifications/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể xóa thông báo')
    }

    return response.json()
  },

  // Delete all notifications
  deleteAllNotifications: async params => {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)

    const response = await fetch(`/api/notifications/delete-all?${queryParams}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể xóa tất cả thông báo')
    }

    return response.json()
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const response = await fetch(`/api/notifications/settings`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể tải cài đặt thông báo')
    }

    return response.json()
  },

  // Update notification settings
  updateNotificationSettings: async settings => {
    const response = await fetch(`/api/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể cập nhật cài đặt thông báo')
    }

    return response.json()
  },

  // Get Telegram status
  getTelegramStatus: async () => {
    const response = await fetch(`/api/notifications/telegram`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể kiểm tra trạng thái Telegram')
    }

    return response.json()
  },

  // Connect Telegram
  connectTelegram: async telegramId => {
    const response = await fetch(`/api/notifications/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ telegram_id: telegramId })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể kết nối Telegram')
    }

    return response.json()
  },

  // Disconnect Telegram
  disconnectTelegram: async () => {
    const response = await fetch(`/api/notifications/telegram`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể ngắt kết nối Telegram')
    }

    return response.json()
  }
}

// Queries
export function useNotificationsQuery(params) {
  // For infinite scrolling
  if (params?.infinite) {
    return useInfiniteQuery({
      queryKey: NOTIFICATION_QUERY_KEYS.notifications({
        ...params,
        infinite: true
      }),
      queryFn: ({ pageParam = 1 }) =>
        notificationApi.getNotifications({
          ...params,
          page: pageParam
        }),
      getNextPageParam: (lastPage, allPages) => {
        const { pagination } = lastPage
        if (pagination.page < pagination.totalPages) {
          return pagination.page + 1
        }
        return undefined
      }
    })
  }

  // Regular pagination
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notifications(params),
    queryFn: () => notificationApi.getNotifications(params)
  })
}

export function useNotificationDetailQuery(id) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notificationDetail(id),
    queryFn: () => notificationApi.getNotificationDetail(id),
    enabled: !!id
  })
}

export function useNotificationCountQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notificationCount,
    queryFn: notificationApi.getNotificationCount,
    refetchInterval: 60000 // Refetch every minute
  })
}

export function useNotificationSettingsQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.settings,
    queryFn: notificationApi.getNotificationSettings
  })
}

export function useTelegramStatusQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.telegramStatus,
    queryFn: notificationApi.getTelegramStatus
  })
}

// Mutations
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: id => notificationApi.markNotificationRead(id),
    onSuccess: () => {
      // Invalidate notification count and list queries
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notificationCount
      })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
        exact: false
      })
    },
    onError: error => {
      toast.error(error.message || 'Không thể đánh dấu đã đọc')
    }
  })
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate notification count and list queries
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notificationCount
      })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
        exact: false
      })
    },
    onError: error => {
      toast.error(error.message || 'Không thể đánh dấu tất cả đã đọc')
    }
  })
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: id => notificationApi.deleteNotification(id),
    onSuccess: () => {
      // Invalidate notification count and list queries
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notificationCount
      })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
        exact: false
      })
    },
    onError: error => {
      toast.error(error.message || 'Không thể xóa thông báo')
    }
  })
}

export function useDeleteAllNotificationsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: params => notificationApi.deleteAllNotifications(params),
    onSuccess: () => {
      // Invalidate notification count and list queries
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notificationCount
      })
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
        exact: false
      })
      toast.success('Đã xóa tất cả thông báo')
    },
    onError: error => {
      toast.error(error.message || 'Không thể xóa tất cả thông báo')
    }
  })
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.settings
      })
      toast.success('Cài đặt thông báo đã được cập nhật')
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật cài đặt thông báo')
    }
  })
}

export function useConnectTelegramMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.connectTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.telegramStatus
      })
      toast.success('Kết nối Telegram thành công')
    },
    onError: error => {
      toast.error(error.message || 'Không thể kết nối Telegram')
    }
  })
}

export function useDisconnectTelegramMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.disconnectTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.telegramStatus
      })
      toast.success('Đã ngắt kết nối Telegram')
    },
    onError: error => {
      toast.error(error.message || 'Không thể ngắt kết nối Telegram')
    }
  })
}
