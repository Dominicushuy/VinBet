// src/components/notifications/NotificationBadge.jsx
'use client'

import { useNotificationCountQuery } from '@/hooks/queries/useNotificationQueries'

export function NotificationBadge({ className }) {
  const { data, isLoading } = useNotificationCountQuery()

  const count = data?.count || 0

  if (isLoading || count === 0) {
    return null
  }

  return (
    <div
      className={`bg-red-500 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 ${className}`}
    >
      {count > 99 ? '99+' : count}
    </div>
  )
}
