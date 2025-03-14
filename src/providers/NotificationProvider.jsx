'use client'

import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useNotificationCountQuery } from '@/hooks/queries/useNotificationQueries'
import { useNotificationToast } from '@/components/notifications/NotificationToast'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserInfo } from '@/utils/getBrowserInfo'

const NotificationContext = createContext(null)

// Cooldown period in milliseconds (e.g., 1 hour)
const LOGIN_NOTIFICATION_COOLDOWN = 60 * 60 * 1000

export function NotificationProvider({ children }) {
  const { data } = useNotificationCountQuery()
  const { showNotificationToast } = useNotificationToast()
  const { user, profile } = useAuth()
  const [clientInfo, setClientInfo] = useState(null)

  const unreadCount = data?.count || 0

  // Fetch client info once when component mounts
  useEffect(() => {
    const getClientInfo = async () => {
      try {
        const response = await fetch('/api/utils/client-info')
        const data = await response.json()
        setClientInfo(data)
      } catch (error) {
        console.error('Failed to get client info:', error)
        setClientInfo({ ip: 'unknown', isDevelopment: false })
      }
    }

    getClientInfo()
  }, [])

  // Gửi thông báo đăng nhập qua Telegram
  useEffect(() => {
    const checkAndSendLoginNotification = async () => {
      if (!user?.id || !profile?.telegram_id || !clientInfo) return

      // Skip notifications in development mode if desired
      if (clientInfo.isDevelopment && process.env.NEXT_PUBLIC_DISABLE_DEV_NOTIFICATIONS === 'true') {
        console.log('Login notification skipped in development mode')
        return
      }

      // Create a more unique device fingerprint
      const deviceInfo = getBrowserInfo()
      const deviceFingerprint = `${clientInfo.ip}_${deviceInfo.browser}_${deviceInfo.os}`

      // Create a storage key that includes the user ID and device fingerprint
      const storageKey = `login_notification_${user.id}_${deviceFingerprint}`

      // Check last notification time for this device/user combination
      const lastNotificationTime = localStorage.getItem(storageKey)
      const currentTime = Date.now()

      // Only send if we haven't sent recently for this device/user combo
      if (!lastNotificationTime || currentTime - parseInt(lastNotificationTime) > LOGIN_NOTIFICATION_COOLDOWN) {
        // Update the timestamp first to prevent multiple calls
        localStorage.setItem(storageKey, currentTime.toString())

        // Prep notification data
        try {
          const notificationData = {
            notificationType: 'login',
            userId: user.id,
            device: deviceInfo,
            ipAddress: clientInfo.ip,
            location: 'Không xác định (Riêng tư)',
            time: new Date().toLocaleString('vi-VN')
          }

          // Only send if user has not disabled login alerts
          if (profile.telegram_settings?.receive_login_alerts !== false) {
            await fetch('/api/telegram/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(notificationData)
            })
            console.log('Login notification sent successfully')
          }
        } catch (error) {
          console.error('Error sending login notification:', error)
        }
      } else {
        console.log('Login notification skipped - cooldown period active')
      }
    }

    if (clientInfo) {
      checkAndSendLoginNotification()
    }
  }, [user?.id, profile, clientInfo])

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
