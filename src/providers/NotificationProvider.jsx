'use client'

import { createContext, useContext, useCallback } from 'react'
// import { useNotificationListener } from '@/hooks/useNotificationListener'
import { useNotificationCountQuery } from '@/hooks/queries/useNotificationQueries'
import { useNotificationToast } from '@/components/notifications/NotificationToast'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  // useNotificationListener()
  const { data } = useNotificationCountQuery()
  const { showNotificationToast } = useNotificationToast()

  const unreadCount = data?.count || 0

  const showToast = useCallback(
    notification => {
      showNotificationToast(notification)
    },
    [showNotificationToast]
  )

  return <NotificationContext.Provider value={{ unreadCount, showToast }}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
