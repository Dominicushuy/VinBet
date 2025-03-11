// src/components/notifications/NotificationItem.jsx (Enhanced)
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { Bell, DollarSign, Gamepad, ShieldAlert, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMarkNotificationReadMutation, useDeleteNotificationMutation } from '@/hooks/queries/useNotificationQueries'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export function NotificationItem({
  notification,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect = () => {}
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const markReadMutation = useMarkNotificationReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()

  const handleMarkRead = async e => {
    e.preventDefault()
    e.stopPropagation()

    if (notification.is_read) return

    try {
      await markReadMutation.mutateAsync(notification.id)
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const handleDelete = async e => {
    e.preventDefault()
    e.stopPropagation()

    setIsDeleting(true)

    try {
      await deleteNotificationMutation.mutateAsync(notification.id)
      toast.success('Đã xóa thông báo')
    } catch (error) {
      toast.error('Không thể xóa thông báo')
      setIsDeleting(false)
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'system':
        return <Bell className='h-5 w-5 text-blue-500' />
      case 'transaction':
        return <DollarSign className='h-5 w-5 text-green-500' />
      case 'game':
        return <Gamepad className='h-5 w-5 text-purple-500' />
      case 'admin':
        return <ShieldAlert className='h-5 w-5 text-red-500' />
      default:
        return <Bell className='h-5 w-5' />
    }
  }

  const getStatusBadge = () => {
    const typeBadges = {
      system: 'bg-blue-100 text-blue-600',
      transaction: 'bg-green-100 text-green-600',
      game: 'bg-purple-100 text-purple-600',
      admin: 'bg-red-100 text-red-600'
    }

    return typeBadges[notification.type] || 'bg-gray-100 text-gray-600'
  }

  if (isDeleting) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={isSelectMode ? '#' : `/notifications?id=${notification.id}`}
        className={cn(
          'block relative border rounded-lg p-4 transition-colors mb-2',
          !notification.is_read ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/40 border-border',
          isSelectMode && 'cursor-default'
        )}
        onClick={e => {
          if (isSelectMode) {
            e.preventDefault()
            onToggleSelect()
          } else if (!notification.is_read) {
            handleMarkRead(e)
          }
        }}
      >
        <div className='flex gap-4'>
          {isSelectMode && (
            <div className='flex-shrink-0 flex items-start pt-1'>
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                aria-label='Select notification'
                className='data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'
              />
            </div>
          )}

          <div className={cn('flex-shrink-0 p-2 rounded-full', getStatusBadge())}>{getNotificationIcon()}</div>

          <div className='flex-grow space-y-1 min-w-0'>
            <div className='flex justify-between items-start gap-2'>
              <h4 className={cn('font-medium line-clamp-1', !notification.is_read && 'text-primary')}>
                {notification.title}
              </h4>
              <span className='text-xs text-muted-foreground whitespace-nowrap flex-shrink-0'>
                {notification.created_at
                  ? format(new Date(notification.created_at), 'dd MMM, HH:mm', {
                      locale: vi
                    })
                  : 'N/A'}
              </span>
            </div>

            <p className='text-sm text-muted-foreground line-clamp-2'>{notification.content}</p>

            {!isSelectMode && (
              <div className='flex justify-end gap-2 pt-1'>
                {!notification.is_read && (
                  <Button size='sm' variant='ghost' className='h-8' onClick={handleMarkRead}>
                    <Check className='h-4 w-4 mr-1' />
                    Đánh dấu đã đọc
                  </Button>
                )}

                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 text-destructive hover:text-destructive'
                  onClick={handleDelete}
                >
                  <Trash2 className='h-4 w-4 mr-1' />
                  Xóa
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
