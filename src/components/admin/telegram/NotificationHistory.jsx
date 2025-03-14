'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { fetchData } from '@/utils/fetchUtils'
import {
  Clock,
  Search,
  MailCheck,
  RefreshCw,
  Loader2,
  FileX,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Bell
} from 'lucide-react'
import { X } from 'lucide-react'

export function NotificationHistory() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch notification history
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'telegram-notification-history', page, typeFilter, searchQuery],
    queryFn: () =>
      fetchData(
        `/api/admin/telegram/notifications/history?page=${page}&type=${
          typeFilter !== 'all' ? typeFilter : ''
        }&search=${searchQuery}`
      ),
    keepPreviousData: true
  })

  // Memoize values to avoid recalculations
  const notifications = useMemo(() => data?.notifications || [], [data?.notifications])
  const pagination = useMemo(() => data?.pagination || { total: 0, totalPages: 1 }, [data?.pagination])

  // Handle type filter change
  const handleTypeFilterChange = value => {
    setTypeFilter(value)
    setPage(1) // Reset to page 1 when filter changes
  }

  // Handle search
  const handleSearch = e => {
    if (e.key === 'Enter') {
      setPage(1) // Reset to page 1 when searching
    }
  }

  // Clear filters
  const clearFilters = () => {
    setTypeFilter('all')
    setSearchQuery('')
    setPage(1)
  }

  // Get notification type badge
  const getNotificationTypeBadge = type => {
    switch (type) {
      case 'system':
        return <Badge variant='secondary'>Hệ thống</Badge>
      case 'transaction':
        return <Badge className='bg-green-100 text-green-800'>Giao dịch</Badge>
      case 'game':
        return <Badge className='bg-purple-100 text-purple-800'>Trò chơi</Badge>
      case 'admin':
        return <Badge className='bg-blue-100 text-blue-800'>Admin</Badge>
      default:
        return <Badge variant='outline'>{type}</Badge>
    }
  }

  // Check if filters are active
  const hasActiveFilters = typeFilter !== 'all' || searchQuery !== ''

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5' />
              Lịch sử thông báo Telegram
            </CardTitle>
            <CardDescription>Lịch sử thông báo đã gửi qua Telegram</CardDescription>
          </div>
          <Button variant='outline' onClick={() => refetch()} disabled={isLoading || isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and filter controls */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4'>
          <div className='relative w-full sm:max-w-xs'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm tiêu đề...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className='pl-9 pr-4'
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0'
                onClick={() => setSearchQuery('')}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>

          <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Lọc theo loại' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả</SelectItem>
              <SelectItem value='system'>Hệ thống</SelectItem>
              <SelectItem value='transaction'>Giao dịch</SelectItem>
              <SelectItem value='game'>Trò chơi</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={clearFilters} className='h-10'>
              <FilterX className='h-4 w-4 mr-2' />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Table of notifications */}
        <div className='border rounded-md overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[200px]'>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className='hidden md:table-cell'>Người gửi</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className='hidden md:table-cell'>Người nhận</TableHead>
                  <TableHead className='hidden md:table-cell'>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8'>
                      <div className='flex flex-col items-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground mb-2' />
                        <p className='text-muted-foreground'>Đang tải dữ liệu...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8 text-red-500'>
                      Lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-8'>
                      <div className='flex flex-col items-center'>
                        <FileX className='h-8 w-8 text-muted-foreground mb-2' />
                        <p className='text-muted-foreground'>
                          {hasActiveFilters
                            ? 'Không tìm thấy thông báo nào phù hợp với bộ lọc'
                            : 'Chưa có thông báo nào được gửi'}
                        </p>
                        {hasActiveFilters && (
                          <Button variant='link' className='mt-2' onClick={clearFilters}>
                            Xóa bộ lọc
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map(notification => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className='font-medium'>{notification.title}</div>
                        <div className='text-xs text-muted-foreground line-clamp-1'>{notification.content}</div>
                      </TableCell>
                      <TableCell>{getNotificationTypeBadge(notification.type)}</TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <div className='font-medium'>{notification.sender_name || 'System'}</div>
                        {notification.sender_id && (
                          <div className='text-xs text-muted-foreground truncate max-w-[120px]'>
                            {notification.sender_id}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-1'>
                          <Clock className='h-3 w-3' />
                          <span>{format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                        </div>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {notification.recipient_count === 1 ? (
                          <div className='font-medium'>
                            {notification.recipient_name || notification.recipient_id || 'Unknown'}
                          </div>
                        ) : (
                          <Badge variant='outline'>{notification.recipient_count} người dùng</Badge>
                        )}
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <div className='flex items-center space-x-1'>
                          <MailCheck className='h-3 w-3 text-green-500' />
                          <span>Đã gửi</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className='flex flex-col sm:flex-row items-center justify-between mt-4 gap-2'>
            <div className='text-sm text-muted-foreground'>
              Hiển thị trang {page} / {pagination.totalPages} (Tổng {pagination.total} bản ghi)
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading || isFetching}
              >
                <ChevronLeft className='h-4 w-4 mr-1' />
                Trang trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || isLoading || isFetching}
              >
                Trang sau
                <ChevronRight className='h-4 w-4 ml-1' />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
