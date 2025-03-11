// src/hooks/useNotificationListener.tsx
'use client'

import { useEffect, useState } from 'react'
import { useNotificationToast } from '@/components/notifications/NotificationToast'
import { supabaseClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { NOTIFICATION_QUERY_KEYS } from '@/hooks/queries/useNotificationQueries'
import { useAuth } from '@/hooks/useAuth'

export function useNotificationListener() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { showNotificationToast } = useNotificationToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id || isInitialized) return

    let subscription

    const setupSubscription = async () => {
      // Subscribe to changes in the notifications table for this user
      subscription = supabaseClient
        .channel('notification-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `profile_id=eq.${user.id}`,
          },
          (payload) => {
            // Show toast notification
            const newNotification = payload.new

            // Update query cache
            queryClient.invalidateQueries({
              queryKey: NOTIFICATION_QUERY_KEYS.notificationCount,
            })
            queryClient.invalidateQueries({
              queryKey: NOTIFICATION_QUERY_KEYS.notifications(),
            })

            // Show toast for the new notification
            showNotificationToast(newNotification)
          }
        )
        .subscribe()

      setIsInitialized(true)
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabaseClient.removeChannel(subscription)
      }
    }
  }, [user?.id, isInitialized, showNotificationToast, queryClient])
}
