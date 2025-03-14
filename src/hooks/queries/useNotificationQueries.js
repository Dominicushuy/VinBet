/* eslint-disable react-hooks/rules-of-hooks */
// src/hooks/queries/useNotificationQueries.js
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData, deleteData, putData, buildQueryString } from '@/utils/fetchUtils'
import { useAuth } from '../useAuth'

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
    const queryString = buildQueryString({
      page: params?.page,
      pageSize: params?.pageSize,
      type: params?.type,
      isRead: params?.isRead !== undefined ? params.isRead : undefined,
      search: params?.searchQuery
    })

    return fetchData(`/api/notifications${queryString}`)
  },

  // Get notification detail
  getNotificationDetail: async id => {
    return fetchData(`/api/notifications/${id}`)
  },

  // Get unread notification count
  getNotificationCount: async () => {
    return fetchData(`/api/notifications/count`)
  },

  // Mark notification as read
  markNotificationRead: async id => {
    return postData(`/api/notifications/${id}/read`, {})
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    return postData(`/api/notifications/read-all`, {})
  },

  // Delete notification
  deleteNotification: async id => {
    return deleteData(`/api/notifications/${id}`)
  },

  // Delete all notifications
  deleteAllNotifications: async params => {
    const queryString = buildQueryString({
      type: params?.type
    })

    return deleteData(`/api/notifications/delete-all${queryString}`)
  },

  // Get notification settings
  getNotificationSettings: async () => {
    return fetchData(`/api/notifications/settings`)
  },

  // Update notification settings
  updateNotificationSettings: async settings => {
    return putData(`/api/notifications/settings`, settings)
  },

  // Get Telegram status
  getTelegramStatus: async () => {
    return fetchData(`/api/notifications/telegram`)
  },

  // Connect Telegram
  connectTelegram: async telegramId => {
    return postData(`/api/notifications/telegram`, { telegram_id: telegramId })
  },

  // Disconnect Telegram
  disconnectTelegram: async () => {
    return deleteData(`/api/notifications/telegram`)
  }
}

// Queries
// Cập nhật định nghĩa useNotificationsQuery để hỗ trợ infinite loading
export function useNotificationsQuery(params) {
  const { user } = useAuth()

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
      getNextPageParam: lastPage => {
        if (!lastPage.pagination) return undefined
        const { pagination } = lastPage
        return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined
      },
      staleTime: 60 * 1000 // 1 minute
    })
  }

  // Regular pagination
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notifications(params),
    queryFn: () => notificationApi.getNotifications(params),
    enabled: !!user,
    staleTime: 60 * 1000 // 1 minute
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
  const { user } = useAuth()

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notificationCount,
    queryFn: notificationApi.getNotificationCount,
    enabled: !!user,
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

// Bổ sung infinite query cho notifications
export function useNotificationsInfiniteQuery(params) {
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
    getNextPageParam: lastPage => {
      if (!lastPage.pagination) return undefined
      const { pagination } = lastPage
      return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined
    },
    enabled: !!params,
    staleTime: 60 * 1000 // 1 minute
  })
}
