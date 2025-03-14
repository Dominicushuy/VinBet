'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal, Search, RefreshCw, Send, MailWarning, XCircle, AlertCircle, Users } from 'lucide-react'
import { fetchData, postData } from '@/utils/fetchUtils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

// UserAvatar Component
const UserAvatar = ({ user }) => (
  <div
    className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'
    style={{
      backgroundImage: user?.avatar_url ? `url(${user.avatar_url})` : 'none',
      backgroundSize: 'cover'
    }}
  >
    {!user?.avatar_url && (user?.display_name?.[0] || user?.username?.[0] || '?')}
  </div>
)

// TelegramStatusBadge Component
const TelegramStatusBadge = ({ isConnected }) =>
  isConnected ? (
    <Badge variant='success' className='bg-green-100 text-green-800 hover:bg-green-200'>
      Đã kết nối
    </Badge>
  ) : (
    <Badge variant='outline' className='bg-gray-100 text-gray-800 hover:bg-gray-200'>
      Chưa kết nối
    </Badge>
  )

// TelegramSettingIndicator Component
const TelegramSettingIndicator = ({ enabled }) => (
  <div className={`w-2 h-2 rounded-full ${enabled !== false ? 'bg-green-500' : 'bg-gray-300'}`} />
)

export default function TelegramConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [userToDisconnect, setUserToDisconnect] = useState(null)
  const queryClient = useQueryClient()

  // Fetch telegram users with query options
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'telegram-connections'],
    queryFn: () => fetchData('/api/admin/telegram/users'),
    staleTime: 30000, // 30 seconds
    cacheTime: 5 * 60 * 1000 // 5 minutes
  })

  // Send test message mutation
  const sendTestMessageMutation = useMutation({
    mutationFn: userId => postData('/api/admin/telegram/send-test', { userId }),
    onSuccess: () => {
      toast.success('Tin nhắn thử nghiệm đã được gửi')
    },
    onError: error => {
      toast.error(`Không thể gửi tin nhắn: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  // Disconnect user mutation
  const disconnectUserMutation = useMutation({
    mutationFn: userId => postData('/api/admin/telegram/disconnect', { userId }),
    onSuccess: () => {
      toast.success('Đã ngắt kết nối người dùng khỏi Telegram')
      queryClient.invalidateQueries(['admin', 'telegram-connections'])
      setUserToDisconnect(null)
    },
    onError: error => {
      toast.error(`Không thể ngắt kết nối: ${error.message || 'Lỗi không xác định'}`)
      setUserToDisconnect(null)
    }
  })

  const users = data?.users || []

  // Memoize filtered users to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
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
  }, [users, searchQuery, activeTab])

  // Memoize handlers to prevent unnecessary recreations
  const handleSendTestMessage = useCallback(
    userId => {
      if (!userId) return
      sendTestMessageMutation.mutate(userId)
    },
    [sendTestMessageMutation]
  )

  const handleDisconnectUser = useCallback(userId => {
    if (!userId) return
    setUserToDisconnect(userId)
  }, [])

  const confirmDisconnect = useCallback(() => {
    if (!userToDisconnect) return
    disconnectUserMutation.mutate(userToDisconnect)
  }, [userToDisconnect, disconnectUserMutation])

  const cancelDisconnect = useCallback(() => {
    setUserToDisconnect(null)
  }, [])

  // Stats for UI display
  const connectedCount = useMemo(() => users.filter(user => user.telegram_id).length, [users])

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <CardTitle>Quản lý kết nối Telegram</CardTitle>
              <CardDescription>Xem và quản lý các kết nối Telegram của người dùng</CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground hidden md:flex items-center'>
                <Users className='h-4 w-4 mr-1' />
                {data ? `${connectedCount}/${users.length} người dùng đã kết nối` : 'Đang tải...'}
              </span>
              <Button variant='outline' onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2'>
            <div className='relative w-full sm:max-w-xs'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                placeholder='Tìm kiếm theo tên, email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full pl-9'
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2'>
              <TabsList>
                <TabsTrigger value='all'>Tất cả</TabsTrigger>
                <TabsTrigger value='connected'>Đã kết nối</TabsTrigger>
                <TabsTrigger value='not-connected'>Chưa kết nối</TabsTrigger>
              </TabsList>

              <div className='text-sm text-muted-foreground'>
                Hiển thị {filteredUsers.length} trong số {users.length} người dùng
              </div>
            </div>

            <div className='border rounded-md'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className='hidden md:table-cell'>Thời gian kết nối</TableHead>
                    <TableHead className='hidden md:table-cell'>Cài đặt thông báo</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className='space-y-3'>
                          <Skeleton className='h-10 w-full' />
                          <Skeleton className='h-10 w-full' />
                          <Skeleton className='h-10 w-full' />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center py-8'>
                        <div className='flex flex-col items-center text-muted-foreground'>
                          <AlertCircle className='h-10 w-10 mb-2' />
                          <p>Không tìm thấy người dùng nào</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <UserAvatar user={user} />
                            <div>
                              <div className='font-medium'>{user.display_name || user.username}</div>
                              <div className='text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TelegramStatusBadge isConnected={!!user.telegram_id} />
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {user.telegram_connected_at
                            ? format(new Date(user.telegram_connected_at), 'dd/MM/yyyy HH:mm', { locale: vi })
                            : 'N/A'}
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {user.telegram_id ? (
                            <div className='space-y-1'>
                              <div className='text-xs flex items-center gap-1'>
                                <TelegramSettingIndicator enabled={user.telegram_settings?.receive_win_notifications} />
                                <span>Thắng cuộc</span>
                              </div>
                              <div className='text-xs flex items-center gap-1'>
                                <TelegramSettingIndicator enabled={user.telegram_settings?.receive_login_alerts} />
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
                                <DropdownMenuItem
                                  onClick={() => handleSendTestMessage(user.id)}
                                  disabled={sendTestMessageMutation.isPending}
                                >
                                  {sendTestMessageMutation.isPending ? (
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                  ) : (
                                    <Send className='mr-2 h-4 w-4' />
                                  )}
                                  <span>Gửi tin nhắn thử</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDisconnectUser(user.id)}
                                  disabled={disconnectUserMutation.isPending}
                                  className='text-destructive focus:text-destructive'
                                >
                                  {disconnectUserMutation.isPending ? (
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                  ) : (
                                    <XCircle className='mr-2 h-4 w-4' />
                                  )}
                                  <span>Ngắt kết nối</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button variant='ghost' size='sm' className='h-8' disabled>
                              <MailWarning className='h-4 w-4 mr-2' />
                              <span className='hidden sm:inline'>Chưa kết nối</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disconnection Confirmation Dialog */}
      <AlertDialog open={!!userToDisconnect} onOpenChange={open => !open && setUserToDisconnect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ngắt kết nối Telegram</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ngắt kết nối Telegram của người dùng này? Họ sẽ không nhận được thông báo qua
              Telegram cho đến khi kết nối lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDisconnect}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisconnect} className='bg-destructive text-destructive-foreground'>
              {disconnectUserMutation.isPending ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' /> Đang xử lý...
                </>
              ) : (
                <>Ngắt kết nối</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
