// src/app/admin/telegram/connections/page.jsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Search, RefreshCw, Send, MailWarning, XCircle } from 'lucide-react'
import { fetchData, postData } from '@/utils/fetchUtils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function TelegramConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'telegram-connections'],
    queryFn: () => fetchData('/api/admin/telegram/users')
  })

  const sendTestMessageMutation = useMutation({
    mutationFn: userId => postData('/api/admin/telegram/send-test', { userId }),
    onSuccess: () => {
      toast.success('Tin nhắn thử nghiệm đã được gửi')
    },
    onError: error => {
      toast.error(`Không thể gửi tin nhắn: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const disconnectUserMutation = useMutation({
    mutationFn: userId => postData('/api/admin/telegram/disconnect', { userId }),
    onSuccess: () => {
      toast.success('Đã ngắt kết nối người dùng khỏi Telegram')
      queryClient.invalidateQueries(['admin', 'telegram-connections'])
    },
    onError: error => {
      toast.error(`Không thể ngắt kết nối: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const users = data?.users || []

  const filteredUsers = users.filter(user => {
    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by connection status
    if (activeTab === 'connected') {
      return matchesSearch && user.telegram_id
    } else if (activeTab === 'not-connected') {
      return matchesSearch && !user.telegram_id
    }

    return matchesSearch
  })

  const handleSendTestMessage = userId => {
    sendTestMessageMutation.mutate(userId)
  }

  const handleDisconnectUser = userId => {
    if (confirm('Bạn có chắc chắn muốn ngắt kết nối Telegram của người dùng này?')) {
      disconnectUserMutation.mutate(userId)
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Quản lý kết nối Telegram</CardTitle>
              <CardDescription>Xem và quản lý các kết nối Telegram của người dùng</CardDescription>
            </div>
            <Button variant='outline' onClick={() => refetch()}>
              <RefreshCw className='h-4 w-4 mr-2' />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-2'>
            <Search className='w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Tìm kiếm theo tên, email...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='max-w-xs'
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className='flex justify-between items-center mb-2'>
              <TabsList>
                <TabsTrigger value='all'>Tất cả</TabsTrigger>
                <TabsTrigger value='connected'>Đã kết nối</TabsTrigger>
                <TabsTrigger value='not-connected'>Chưa kết nối</TabsTrigger>
              </TabsList>

              <div className='text-sm text-muted-foreground'>
                Hiển thị {filteredUsers.length} trong số {users.length} người dùng
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian kết nối</TableHead>
                  <TableHead>Cài đặt thông báo</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center'>
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center'>
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <div
                            className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'
                            style={{
                              backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : 'none',
                              backgroundSize: 'cover'
                            }}
                          >
                            {!user.avatar_url && (user.display_name?.[0] || user.username?.[0] || '?')}
                          </div>
                          <div>
                            <div className='font-medium'>{user.display_name || user.username}</div>
                            <div className='text-xs text-muted-foreground'>{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.telegram_id ? (
                          <Badge variant='success' className='bg-green-100 text-green-800 hover:bg-green-200'>
                            Đã kết nối
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='bg-gray-100 text-gray-800 hover:bg-gray-200'>
                            Chưa kết nối
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.telegram_connected_at
                          ? format(new Date(user.telegram_connected_at), 'dd/MM/yyyy HH:mm', { locale: vi })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.telegram_id ? (
                          <div className='space-y-1'>
                            <div className='text-xs flex items-center gap-1'>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  user.telegram_settings?.receive_win_notifications !== false
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`}
                              ></div>
                              <span>Thắng cuộc</span>
                            </div>
                            <div className='text-xs flex items-center gap-1'>
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  user.telegram_settings?.receive_login_alerts !== false
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                                }`}
                              ></div>
                              <span>Đăng nhập</span>
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        {user.telegram_id ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem onClick={() => handleSendTestMessage(user.id)}>
                                <Send className='mr-2 h-4 w-4' />
                                <span>Gửi tin nhắn thử</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDisconnectUser(user.id)}>
                                <XCircle className='mr-2 h-4 w-4' />
                                <span>Ngắt kết nối</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button variant='ghost' size='sm' className='h-8' disabled>
                            <MailWarning className='h-4 w-4 mr-2' />
                            Chưa kết nối
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
