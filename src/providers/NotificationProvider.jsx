// src/providers/NotificationProvider.jsx (cập nhật)
'use client'

import { createContext, useContext, useCallback, useEffect } from 'react'
// import { useNotificationListener } from '@/hooks/useNotificationListener';
import { useNotificationCountQuery } from '@/hooks/queries/useNotificationQueries'
import { useNotificationToast } from '@/components/notifications/NotificationToast'
import { useAuth } from '@/hooks/useAuth'
import { fetchData } from '@/utils/fetchUtils'
import { getBrowserInfo } from '@/utils/getBrowserInfo'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  // useNotificationListener();
  const { data } = useNotificationCountQuery()
  const { showNotificationToast } = useNotificationToast()
  const { user, profile } = useAuth()

  const unreadCount = data?.count || 0

  // Gửi thông báo đăng nhập qua Telegram
  useEffect(() => {
    const checkAndSendLoginNotification = async () => {
      if (!user?.id || !profile?.telegram_id) return

      // Kiểm tra xem đã lưu sessionId trong localStorage chưa
      const sessionId = user.id + '_' + Date.now()
      const lastSession = localStorage.getItem('last_session_id')

      // Nếu chưa có session hoặc session khác với lần trước
      if (!lastSession) {
        localStorage.setItem('last_session_id', sessionId)

        try {
          // Lấy thông tin thiết bị và vị trí
          const deviceInfo = {
            device: getBrowserInfo(),
            location: 'Không xác định (Riêng tư)',
            time: new Date().toLocaleString('vi-VN')
          }

          // Kiểm tra thiết lập nhận thông báo đăng nhập
          if (profile.telegram_settings?.receive_login_alerts !== false) {
            // Gửi thông báo
            await fetchData('/api/telegram/send', {
              method: 'POST',
              body: JSON.stringify({
                notificationType: 'login',
                userId: user.id,
                ...deviceInfo
              })
            })
          }
        } catch (error) {
          console.error('Error sending login notification:', error)
        }
      }
    }

    checkAndSendLoginNotification()
  }, [user?.id, profile])

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
