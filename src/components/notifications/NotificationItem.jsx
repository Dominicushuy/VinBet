'use client'

import { memo, useState, useMemo, cloneElement } from 'react'
import Link from 'next/link'
import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMarkNotificationReadMutation, useDeleteNotificationMutation } from '@/hooks/queries/useNotificationQueries'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { formatTimeAgo, getNotificationIcon, getNotificationTypeBadge } from '@/utils/notificationUtils'

// Memoize component để tránh re-render không cần thiết
export const NotificationItem = memo(function NotificationItem({
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

  // Memoize các giá trị để tránh tính toán lại
  const notificationIcon = useMemo(() => getNotificationIcon(notification.type), [notification.type])
  const statusBadgeClass = useMemo(() => getNotificationTypeBadge(notification.type), [notification.type])
  const timeAgoString = useMemo(() => formatTimeAgo(notification.created_at), [notification.created_at])

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
            <div className='flex-shrink-0 flex items-center self-start pt-1'>
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                aria-label='Select notification'
                className='data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'
              />
            </div>
          )}

          {/* Badge đã sửa lại để icon nằm chính giữa */}
          <div className='flex-shrink-0 self-start'>
            <div className={cn('w-9 h-9 inline-flex items-center justify-center rounded-full', statusBadgeClass)}>
              {cloneElement(notificationIcon, {
                className: 'w-4 h-4',
                size: 16
              })}
            </div>
          </div>

          <div className='flex-grow space-y-1.5 min-w-0'>
            <div className='flex justify-between items-start gap-2'>
              <h4
                className={cn(
                  'font-medium line-clamp-1 text-sm',
                  !notification.is_read && 'text-primary font-semibold'
                )}
              >
                {notification.title}
              </h4>
              <span className='text-xs text-muted-foreground whitespace-nowrap flex-shrink-0'>{timeAgoString}</span>
            </div>

            <p className='text-sm text-muted-foreground line-clamp-2'>{notification.content}</p>

            {!isSelectMode && (
              <div className='flex justify-end gap-2 pt-2'>
                {!notification.is_read && (
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-8 rounded-md hover:bg-primary/10'
                    onClick={handleMarkRead}
                  >
                    <Check className='h-4 w-4 mr-1.5' />
                    <span className='text-xs'>Đánh dấu đã đọc</span>
                  </Button>
                )}

                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive'
                  onClick={handleDelete}
                >
                  <Trash2 className='h-4 w-4 mr-1.5' />
                  <span className='text-xs'>Xóa</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
})
