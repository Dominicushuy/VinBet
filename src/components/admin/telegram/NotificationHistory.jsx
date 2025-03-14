// src/components/admin/telegram/NotificationHistory.jsx
'use client'

import { useState } from 'react'
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
import { Clock, Search, MailCheck, RefreshCw } from 'lucide-react'

export function NotificationHistory() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'telegram-notification-history', page, typeFilter, searchQuery],
    queryFn: () =>
      fetchData(
        `/api/admin/telegram/notifications/history?page=${page}&type=${
          typeFilter !== 'all' ? typeFilter : ''
        }&search=${searchQuery}`
      )
  })

  const notifications = data?.notifications || []
  const pagination = data?.pagination || { total: 0, totalPages: 1 }

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

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Lịch sử thông báo Telegram</CardTitle>
            <CardDescription>Lịch sử thông báo đã gửi qua Telegram</CardDescription>
          </div>
          <Button variant='outline' onClick={() => refetch()}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center space-x-2 mb-4'>
          <div className='flex items-center space-x-2'>
            <Search className='h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm tiêu đề...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='max-w-xs'
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
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
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Người gửi</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người nhận</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8'>
                  Không tìm thấy thông báo nào
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
                  <TableCell>
                    <div className='font-medium'>{notification.sender_name || 'System'}</div>
                    {notification.sender_id && (
                      <div className='text-xs text-muted-foreground'>{notification.sender_id}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center space-x-1'>
                      <Clock className='h-3 w-3' />
                      <span>{format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {notification.recipient_count === 1 ? (
                      <div className='font-medium'>
                        {notification.recipient_name || notification.recipient_id || 'Unknown'}
                      </div>
                    ) : (
                      <Badge variant='outline'>{notification.recipient_count} người dùng</Badge>
                    )}
                  </TableCell>
                  <TableCell>
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

        {pagination.totalPages > 1 && (
          <div className='flex items-center justify-between mt-4'>
            <div className='text-sm text-muted-foreground'>
              Hiển thị trang {page} / {pagination.totalPages}
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
