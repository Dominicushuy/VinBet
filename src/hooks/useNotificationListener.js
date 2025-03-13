// src/hooks/useNotificationListener.jsx
'use client'

import { useEffect, useState } from 'react'
import { useNotificationToast } from '@/components/notifications/NotificationToast'
import { supabaseClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { NOTIFICATION_QUERY_KEYS } from '@/hooks/queries/useNotificationQueries'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export function useNotificationListener() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { showNotificationToast } = useNotificationToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id || isInitialized) return

    let subscription

    const setupSubscription = async () => {
      try {
        // Subscribe to changes in the notifications table for this user
        subscription = supabaseClient
          .channel('notification-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `profile_id=eq.${user.id}`
            },
            payload => {
              try {
                // Show toast notification
                const newNotification = payload.new

                // Update query cache
                queryClient.invalidateQueries({
                  queryKey: NOTIFICATION_QUERY_KEYS.notificationCount
                })
                queryClient.invalidateQueries({
                  queryKey: NOTIFICATION_QUERY_KEYS.notifications()
                })

                // Show toast for the new notification
                showNotificationToast(newNotification)
              } catch (error) {
                console.error('Error processing notification:', error)
              }
            }
          )
          .subscribe()

        setIsInitialized(true)
      } catch (error) {
        console.error('Error setting up notification listener:', error)
        toast.error('Không thể kết nối đến kênh thông báo, vui lòng tải lại trang')
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        try {
          supabaseClient.removeChannel(subscription)
        } catch (error) {
          console.error('Error removing channel:', error)
        }
      }
    }
  }, [user?.id, isInitialized, showNotificationToast, queryClient])
}
