// src/app/(main)/notifications/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Bell,
  Filter,
  Search,
  X,
  ArrowUp,
  Check,
  Trash2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from '@/hooks/queries/useNotificationQueries'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'react-hot-toast'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { EmptyNotifications } from '@/components/notifications/EmptyNotifications'
import { NotificationDetail } from '@/components/notifications/NotificationDetail'
import { NotificationSkeleton } from '@/components/notifications/NotificationSkeleton'

export default function NotificationsPage() {
  const searchParams = useSearchParams()
  const notificationId = searchParams.get('id')

  const [activeTab, setActiveTab] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  )
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useNotificationsQuery({
    type: activeTab !== 'all' ? activeTab : undefined,
    searchQuery: searchQuery.length > 2 ? searchQuery : undefined,
    page: 1,
    pageSize: 20,
    infinite: true,
  })

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()
  const deleteAllNotificationsMutation = useDeleteAllNotificationsMutation()

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSelectedNotifications([])
    setIsSelectMode(false)
    setPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedNotifications([])
  }

  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(
        selectedNotifications.filter((item) => item !== id)
      )
    } else {
      setSelectedNotifications([...selectedNotifications, id])
    }
  }

  const handleSelectAll = () => {
    if (!data?.pages) return

    const allNotifications = data.pages.flatMap(
      (page) => page.notifications || []
    )

    if (selectedNotifications.length === allNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(
        allNotifications.map((notification) => notification.id)
      )
    }
  }

  const handleMarkSelectedAsRead = async () => {
    try {
      for (const id of selectedNotifications) {
        await markReadMutation.mutateAsync(id)
      }
      toast.success(
        `Đã đánh dấu ${selectedNotifications.length} thông báo là đã đọc`
      )
      setSelectedNotifications([])
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync()
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả đã đọc')
    }
  }

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedNotifications) {
        await deleteNotificationMutation.mutateAsync(id)
      }
      toast.success(`Đã xóa ${selectedNotifications.length} thông báo`)
      setSelectedNotifications([])
    } catch (error) {
      toast.error('Không thể xóa thông báo')
    }
  }

  const getNotifications = () => {
    if (!data?.pages) return []
    return data.pages.flatMap((page) => page.notifications || [])
  }

  const notifications = getNotifications()
  const isAllSelected =
    selectedNotifications.length > 0 &&
    selectedNotifications.length === notifications.length

  return (
    <div className='container mx-auto py-6 max-w-5xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-3xl font-bold flex items-center gap-3'>
          <Bell className='h-7 w-7' />
          Thông báo
        </h1>
        <div className='flex items-center gap-2'>
          {isSelectMode ? (
            <>
              <Button variant='outline' size='sm' onClick={toggleSelectMode}>
                <X className='h-4 w-4 mr-1' />
                Hủy
              </Button>
              <Button variant='default' size='sm' onClick={handleSelectAll}>
                {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={toggleSelectMode}>
                Chọn
              </Button>
              <Button variant='default' size='sm' onClick={handleMarkAllAsRead}>
                <Check className='h-4 w-4 mr-1' />
                Đánh dấu tất cả đã đọc
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6'>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
              <CardDescription>Lọc thông báo của bạn</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='relative'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='search'
                    placeholder='Tìm kiếm thông báo...'
                    className='pl-9 pr-10'
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground'>
                      <X className='h-4 w-4' />
                    </button>
                  )}
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Loại thông báo</label>
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Tất cả loại' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả loại</SelectItem>
                    <SelectItem value='system'>Hệ thống</SelectItem>
                    <SelectItem value='game'>Game</SelectItem>
                    <SelectItem value='transaction'>Giao dịch</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Trạng thái</label>
                <Select defaultValue='all'>
                  <SelectTrigger>
                    <SelectValue placeholder='Tất cả trạng thái' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                    <SelectItem value='read'>Đã đọc</SelectItem>
                    <SelectItem value='unread'>Chưa đọc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Thời gian</label>
                <Select defaultValue='any'>
                  <SelectTrigger>
                    <SelectValue placeholder='Bất kỳ thời gian' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='any'>Bất kỳ thời gian</SelectItem>
                    <SelectItem value='today'>Hôm nay</SelectItem>
                    <SelectItem value='week'>Tuần này</SelectItem>
                    <SelectItem value='month'>Tháng này</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <Button variant='outline' className='w-full'>
                <Filter className='h-4 w-4 mr-2' />
                Áp dụng bộ lọc
              </Button>
            </CardContent>
          </Card>

          {isSelectMode && selectedNotifications.length > 0 && (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle>Hành động</CardTitle>
                <CardDescription>
                  Đã chọn {selectedNotifications.length} thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  variant='default'
                  className='w-full'
                  onClick={handleMarkSelectedAsRead}>
                  <Check className='h-4 w-4 mr-2' />
                  Đánh dấu đã đọc
                </Button>
                <Button
                  variant='destructive'
                  className='w-full'
                  onClick={handleDeleteSelected}>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Xóa thông báo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className='space-y-6'>
          {notificationId ? (
            <NotificationDetail id={notificationId} />
          ) : (
            <Card>
              <CardHeader className='pb-0'>
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className='w-full'>
                  <TabsList className='w-full'>
                    <TabsTrigger value='all'>Tất cả</TabsTrigger>
                    <TabsTrigger value='system'>Hệ thống</TabsTrigger>
                    <TabsTrigger value='game'>Game</TabsTrigger>
                    <TabsTrigger value='transaction'>Giao dịch</TabsTrigger>
                    <TabsTrigger value='admin'>Admin</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className='pt-4'>
                {isLoading ? (
                  <NotificationSkeleton count={5} />
                ) : error ? (
                  <Alert variant='destructive'>
                    <AlertDescription>
                      Không thể tải thông báo. Vui lòng thử lại sau.
                    </AlertDescription>
                  </Alert>
                ) : notifications.length === 0 ? (
                  <EmptyNotifications type={activeTab} />
                ) : (
                  <ScrollArea className='h-[600px] pr-4'>
                    <div className='space-y-1'>
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          isSelectMode={isSelectMode}
                          isSelected={selectedNotifications.includes(
                            notification.id
                          )}
                          onToggleSelect={() =>
                            toggleSelectNotification(notification.id)
                          }
                        />
                      ))}
                      {hasNextPage && (
                        <div
                          ref={loadMoreRef}
                          className='flex justify-center py-4'>
                          {isFetchingNextPage ? (
                            <div className='flex items-center gap-2'>
                              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                              <span className='text-sm text-muted-foreground'>
                                Đang tải thêm...
                              </span>
                            </div>
                          ) : (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => fetchNextPage()}>
                              Tải thêm
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className='fixed bottom-6 right-6'>
        <Button
          size='icon'
          className='h-10 w-10 rounded-full shadow-lg'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUp className='h-5 w-5' />
        </Button>
      </div>
    </div>
  )
}
