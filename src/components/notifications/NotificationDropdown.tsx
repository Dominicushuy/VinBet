// src/components/notifications/NotificationDropdown.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Settings, Check, Clock, X, ChevronRight } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { NotificationBadge } from './NotificationBadge'
import {
  useNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
} from '@/hooks/queries/useNotificationQueries'
import { NotificationSkeletonItem } from './NotificationSkeletonItem'
import { useNotificationsQuery } from '@/hooks/queries/useNotificationQueries'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { NotificationType } from '@/types/database'

type NotificationItem = {
  id: string
  title: string
  content: string
  created_at: string
  is_read: boolean
  type: NotificationType
  reference_id?: string
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')
  const { data: countData, isLoading: isCountLoading } =
    useNotificationCountQuery()
  const { data, isLoading, error } = useNotificationsQuery({
    page: 1,
    pageSize: 5,
    type: activeTab !== 'all' ? activeTab : undefined,
  })
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Bell className='h-4 w-4 text-blue-500' />
      case 'game':
        return (
          <svg
            className='h-4 w-4 text-purple-500'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
            <path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
            <path d='M4 22h16' />
            <path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
            <path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
            <path d='M18 2H6v7a6 6 0 0 0 12 0V2Z' />
          </svg>
        )
      case 'transaction':
        return (
          <svg
            className='h-4 w-4 text-green-500'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <circle cx='12' cy='12' r='10' />
            <path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8' />
            <path d='M12 18V6' />
          </svg>
        )
      case 'admin':
        return (
          <svg
            className='h-4 w-4 text-red-500'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <rect width='18' height='18' x='3' y='3' rx='2' />
            <path d='M7 7h.01' />
            <path d='M12 7h.01' />
            <path d='M17 7h.01' />
            <path d='M7 12h.01' />
            <path d='M12 12h.01' />
            <path d='M17 12h.01' />
            <path d='M7 17h.01' />
            <path d='M12 17h.01' />
            <path d='M17 17h.01' />
          </svg>
        )
      default:
        return <Bell className='h-4 w-4 text-gray-500' />
    }
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'vừa xong'
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  }

  const unreadCount = countData?.count || 0
  const notifications = (data?.notifications as NotificationItem[]) || []

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-10 w-10 rounded-full'
          onClick={() => setOpen(true)}>
          <Bell className='h-5 w-5 text-muted-foreground' />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='absolute -top-1 -right-1'>
              <NotificationBadge className='' />
            </motion.div>
          )}
          <span className='sr-only'>Thông báo</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[380px] p-0 shadow-lg overflow-hidden'
        forceMount>
        <div className='p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium flex items-center gap-2'>
              <Bell className='h-4 w-4' />
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant='secondary'
                className='bg-primary/10 text-primary hover:bg-primary/20'>
                {unreadCount} chưa đọc
              </Badge>
            )}
          </div>
        </div>

        <Tabs
          defaultValue='all'
          value={activeTab}
          onValueChange={handleTabChange}
          className='w-full'>
          <div className='border-b bg-muted/30'>
            <TabsList className='h-11 w-full rounded-none bg-transparent border-b'>
              <TabsTrigger
                value='all'
                className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'>
                Tất cả
              </TabsTrigger>
              <TabsTrigger
                value='system'
                className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'>
                Hệ thống
              </TabsTrigger>
              <TabsTrigger
                value='game'
                className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'>
                Game
              </TabsTrigger>
              <TabsTrigger
                value='transaction'
                className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'>
                Giao dịch
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='max-h-[350px] overflow-y-auto'>
            <AnimatePresence mode='wait'>
              {isLoading ? (
                <div className='p-1'>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <NotificationSkeletonItem key={index} />
                  ))}
                </div>
              ) : error ? (
                <div className='p-8 text-center'>
                  <p className='text-sm text-muted-foreground'>
                    Không thể tải thông báo
                  </p>
                  <Button variant='outline' size='sm' className='mt-2'>
                    Thử lại
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className='flex flex-col items-center justify-center py-12 px-4'>
                  <div className='bg-muted rounded-full p-3 mb-3'>
                    <Bell className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <p className='text-muted-foreground text-center'>
                    Không có thông báo nào
                    {activeTab !== 'all' ? ` thuộc loại này` : ''}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'p-4 border-b last:border-b-0 transition-colors relative hover:bg-muted/40',
                        !notification.is_read && 'bg-primary/5'
                      )}>
                      {!notification.is_read && (
                        <span className='absolute left-0 top-0 bottom-0 w-1 bg-primary' />
                      )}
                      <div className='flex gap-3'>
                        <div
                          className={cn(
                            'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10'
                          )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between gap-2'>
                            <p
                              className={cn(
                                'font-medium text-sm line-clamp-1',
                                notification.is_read
                                  ? 'text-foreground'
                                  : 'text-primary'
                              )}>
                              {notification.title}
                            </p>
                            <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                              {timeAgo(notification.created_at)}
                            </span>
                          </div>
                          <p className='text-xs text-muted-foreground line-clamp-2 mt-0.5'>
                            {notification.content}
                          </p>

                          <div className='flex items-center justify-between mt-2'>
                            <Link
                              href={`/notifications?id=${notification.id}`}
                              className='text-[11px] text-primary hover:underline flex items-center'
                              onClick={() => setOpen(false)}>
                              Xem chi tiết
                              <ChevronRight className='h-3 w-3 ml-0.5' />
                            </Link>

                            {!notification.is_read && (
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-6 px-2 text-[11px]'>
                                <Check className='h-3 w-3 mr-1' />
                                Đánh dấu đã đọc
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Tabs>

        <div className='p-2 border-t bg-muted/30 flex items-center justify-between'>
          <Link
            href='/notifications'
            className='text-xs text-primary hover:underline flex items-center'
            onClick={() => setOpen(false)}>
            Xem tất cả thông báo
            <ChevronRight className='h-3 w-3 ml-0.5' />
          </Link>

          {unreadCount > 0 && (
            <Button
              size='sm'
              variant='ghost'
              className='h-7 text-xs'
              onClick={handleMarkAllAsRead}>
              <Check className='h-3 w-3 mr-1' />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
