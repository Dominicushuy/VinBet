'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useDeleteAllNotificationsMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation
} from '@/hooks/queries/useNotificationQueries'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { NotificationDetail } from '@/components/notifications/NotificationDetail'
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton'
import { EmptyNotifications } from '@/components/notifications/EmptyNotifications'
import { Separator } from '@/components/ui/separator'
import { Bell, Trash2, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const notificationId = searchParams.get('id')
  const [activeTab, setActiveTab] = useState('all')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotificationsQuery({
    type: activeTab !== 'all' ? activeTab : undefined,
    page,
    pageSize,
    infinite: true
  })

  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const deleteAllMutation = useDeleteAllNotificationsMutation()
  const markReadMutation = useMarkNotificationReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()

  // Reset selected IDs when changing tab
  useEffect(() => {
    setSelectedIds([])
    setSelectMode(false)
  }, [activeTab])

  const handleTabChange = value => {
    setActiveTab(value)
    setPage(1)
  }

  const handleToggleSelect = id => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const handleToggleSelectAll = () => {
    if (!data) return

    const notifications = getNotifications()
    if (selectedIds.length === notifications.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(notifications.map(item => item.id))
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllMutation.mutateAsync({
        type: activeTab !== 'all' ? activeTab : undefined
      })
    } catch (error) {
      toast.error('Không thể xóa thông báo')
    }
  }

  const handleBatchMarkAsRead = async () => {
    if (selectedIds.length === 0) return

    try {
      // Thực hiện lần lượt các mutations
      for (const id of selectedIds) {
        await markReadMutation.mutateAsync(id)
      }

      toast.success(`Đã đánh dấu ${selectedIds.length} thông báo là đã đọc`)
      setSelectedIds([])
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      // Thực hiện lần lượt các mutations
      for (const id of selectedIds) {
        await deleteNotificationMutation.mutateAsync(id)
      }

      toast.success(`Đã xóa ${selectedIds.length} thông báo`)
      setSelectedIds([])
    } catch (error) {
      toast.error('Không thể xóa thông báo')
    }
  }

  const getNotifications = () => {
    if (!data) return []
    return data.pages.flatMap(page => page.notifications)
  }

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }

  const notifications = getNotifications()
  const hasNotifications = notifications.length > 0

  if (notificationId) {
    return <NotificationDetail id={notificationId} />
  }

  return (
    <div className='container mx-auto py-6 max-w-4xl'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
        <h1 className='text-2xl font-bold flex items-center'>
          <Bell className='h-6 w-6 mr-2' />
          Thông báo của bạn
        </h1>

        <div className='flex flex-wrap items-center gap-2'>
          {!selectMode ? (
            <>
              <Button variant='outline' size='sm' onClick={() => setSelectMode(true)}>
                Chọn
              </Button>
              <Button variant='outline' size='sm' onClick={handleMarkAllAsRead} disabled={!hasNotifications}>
                <Check className='h-4 w-4 mr-1' />
                <span className='hidden sm:inline'>Đánh dấu đã đọc</span>
                <span className='sm:hidden'>Đã đọc</span>
              </Button>
              <Button variant='outline' size='sm' onClick={handleDeleteAll} disabled={!hasNotifications}>
                <Trash2 className='h-4 w-4 mr-1' />
                <span className='hidden sm:inline'>Xóa tất cả</span>
                <span className='sm:hidden'>Xóa</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={() => setSelectMode(false)}>
                Hủy
              </Button>
              <Button variant='default' size='sm' disabled={selectedIds.length === 0}>
                {selectedIds.length} đã chọn
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className='flex items-center justify-between'>
          <TabsList className='w-full sm:w-auto'>
            <TabsTrigger value='all'>Tất cả</TabsTrigger>
            <TabsTrigger value='system'>Hệ thống</TabsTrigger>
            <TabsTrigger value='game'>Game</TabsTrigger>
            <TabsTrigger value='transaction'>Giao dịch</TabsTrigger>
          </TabsList>

          {selectMode && hasNotifications && (
            <Button variant='ghost' size='sm' onClick={handleToggleSelectAll} className='hidden sm:flex'>
              {selectedIds.length === notifications.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
          )}
        </div>

        <Separator className='my-4' />

        <TabsContent value={activeTab} className='mt-0'>
          {isLoading ? (
            <NotificationSkeleton count={5} />
          ) : error ? (
            <div className='text-center py-8'>
              <p className='text-muted-foreground mb-4'>Không thể tải thông báo</p>
              <Button variant='outline' onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          ) : !hasNotifications ? (
            <EmptyNotifications type={activeTab} />
          ) : (
            <div>
              <AnimatePresence>
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isSelectMode={selectMode}
                    isSelected={selectedIds.includes(notification.id)}
                    onToggleSelect={() => handleToggleSelect(notification.id)}
                  />
                ))}
              </AnimatePresence>

              {hasNextPage && (
                <div className='flex justify-center mt-6'>
                  <Button variant='outline' onClick={handleLoadMore} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Đang tải...' : 'Tải thêm'}
                  </Button>
                </div>
              )}

              {selectMode && selectedIds.length > 0 && (
                <div className='sticky bottom-4 flex justify-center mt-6'>
                  <div className='bg-card border shadow-md rounded-full px-4 py-2 flex items-center gap-2'>
                    <span className='text-sm'>{selectedIds.length} được chọn</span>
                    <Button variant='ghost' size='sm' className='h-8' onClick={handleBatchMarkAsRead}>
                      <Check className='h-4 w-4 mr-1' />
                      Đánh dấu đọc
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 text-destructive hover:text-destructive'
                      onClick={handleBatchDelete}
                    >
                      <Trash2 className='h-4 w-4 mr-1' />
                      Xóa
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
