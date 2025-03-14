'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchData, postData } from '@/utils/fetchUtils'
import { AlertCircle, Send, Users, Loader2, Search, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

const NOTIFICATION_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Chào mừng',
    title: 'Chào mừng đến với VinBet!',
    content:
      'Chúc mừng bạn đã kết nối thành công với Telegram Bot của VinBet. Từ giờ bạn sẽ nhận được thông báo quan trọng qua Telegram.',
    type: 'system'
  },
  {
    id: 'maintenance',
    name: 'Bảo trì',
    title: 'Thông báo bảo trì',
    content: 'VinBet sẽ tiến hành bảo trì hệ thống từ {startTime} đến {endTime}. Xin lỗi vì sự bất tiện này!',
    type: 'system'
  },
  {
    id: 'promo',
    name: 'Khuyến mãi',
    title: 'Khuyến mãi đặc biệt',
    content: 'VinBet đang có chương trình khuyến mãi đặc biệt! Nạp tiền ngay hôm nay để nhận thêm 20% giá trị nạp.',
    type: 'system'
  },
  {
    id: 'jackpot',
    name: 'Jackpot',
    title: 'Jackpot sắp quay!',
    content: 'Jackpot tuần này đã lên đến 500,000,000 VND! Đặt cược ngay để có cơ hội trúng giải lớn.',
    type: 'game'
  }
]

export function NotificationForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [notificationType, setNotificationType] = useState('system')
  const [sendToAll, setSendToAll] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  // Lấy danh sách người dùng đã kết nối Telegram
  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['admin', 'telegram-connected-users'],
    queryFn: () => fetchData('/api/admin/telegram/users?connected=true'),
    enabled: !sendToAll,
    staleTime: 5 * 60 * 1000, // 5 phút
    retry: 2
  })

  // Gửi thông báo mutation
  const sendNotificationMutation = useMutation({
    mutationFn: data => postData('/api/admin/notifications/send', data),
    onSuccess: () => {
      toast.success('Thông báo đã được gửi thành công')
      // Reset form
      setTitle('')
      setContent('')
      setNotificationType('system')
      setSendToAll(true)
      setSelectedUsers([])
      setActiveTab('all')
      setError('')
    },
    onError: error => {
      setError(`Không thể gửi thông báo: ${error.message || 'Lỗi không xác định'}`)
      toast.error(`Không thể gửi thông báo: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  // Memoize danh sách người dùng
  const users = useMemo(() => usersData?.users || [], [usersData?.users])

  // Memoize danh sách đã lọc để tránh tính toán lại khi render
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Lọc theo search query
      const matchesSearch =
        searchQuery === '' ||
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))

      // Tab "selected" chỉ hiển thị người dùng đã chọn
      if (activeTab === 'selected') {
        return selectedUsers.includes(user.id)
      }

      // Tab "all" hiển thị tất cả người dùng phù hợp với search query
      return matchesSearch
    })
  }, [users, activeTab, searchQuery, selectedUsers])

  // Chọn/bỏ chọn người dùng
  const handleUserSelection = useCallback(userId => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }, [])

  // Xử lý thay đổi template
  const handleTemplateChange = useCallback(templateId => {
    if (templateId === 'custom') return

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setTitle(template.title)
      setContent(template.content)
      setNotificationType(template.type)
    }
  }, [])

  // Xử lý gửi thông báo
  const handleSendNotification = useCallback(() => {
    // Validate input
    setError('')

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề thông báo')
      toast.error('Vui lòng nhập tiêu đề thông báo')
      return
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung thông báo')
      toast.error('Vui lòng nhập nội dung thông báo')
      return
    }

    // Validate selected users nếu không gửi cho tất cả
    if (!sendToAll && selectedUsers.length === 0) {
      setError('Vui lòng chọn ít nhất một người dùng hoặc chọn gửi cho tất cả')
      toast.error('Vui lòng chọn ít nhất một người dùng hoặc chọn gửi cho tất cả')
      return
    }

    // Prepare payload
    const payload = {
      title,
      content,
      type: notificationType,
      userIds: sendToAll ? [] : selectedUsers
    }

    // Send notification
    sendNotificationMutation.mutate(payload)
  }, [title, content, notificationType, sendToAll, selectedUsers, sendNotificationMutation])

  // Xóa tất cả người dùng đã chọn
  const clearSelectedUsers = useCallback(() => {
    setSelectedUsers([])
    toast.success('Đã xóa tất cả người dùng đã chọn')
  }, [])

  // Chọn tất cả người dùng đang hiển thị
  const selectAllDisplayedUsers = useCallback(() => {
    const newSelectedUsers = [...selectedUsers]
    filteredUsers.forEach(user => {
      if (!newSelectedUsers.includes(user.id)) {
        newSelectedUsers.push(user.id)
      }
    })
    setSelectedUsers(newSelectedUsers)
    toast.success(`Đã chọn ${filteredUsers.length} người dùng`)
  }, [filteredUsers, selectedUsers])

  // Load lại danh sách user khi toggle sendToAll
  useEffect(() => {
    if (!sendToAll) {
      refetchUsers()
    }
  }, [sendToAll, refetchUsers])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gửi thông báo Telegram</CardTitle>
        <CardDescription>Tạo và gửi thông báo đến người dùng qua Telegram</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4 mr-2' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='space-y-4'>
          {/* Mẫu thông báo */}
          <div className='grid gap-2'>
            <Label htmlFor='template'>Mẫu thông báo</Label>
            <Select onValueChange={handleTemplateChange} defaultValue='custom'>
              <SelectTrigger>
                <SelectValue placeholder='Chọn mẫu thông báo hoặc tạo mới' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='custom'>Thông báo tùy chỉnh</SelectItem>
                {NOTIFICATION_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tiêu đề */}
          <div className='grid gap-2'>
            <Label htmlFor='title'>Tiêu đề</Label>
            <Input
              id='title'
              placeholder='Nhập tiêu đề thông báo'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Nội dung */}
          <div className='grid gap-2'>
            <Label htmlFor='content'>Nội dung</Label>
            <Textarea
              id='content'
              placeholder='Nhập nội dung thông báo'
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          {/* Loại thông báo */}
          <div className='grid gap-2'>
            <Label htmlFor='type'>Loại thông báo</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn loại thông báo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='system'>Hệ thống</SelectItem>
                <SelectItem value='transaction'>Giao dịch</SelectItem>
                <SelectItem value='game'>Trò chơi</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gửi cho tất cả */}
          <div className='flex items-center space-x-2'>
            <Switch id='sendToAll' checked={sendToAll} onCheckedChange={setSendToAll} />
            <Label htmlFor='sendToAll'>Gửi cho tất cả người dùng đã kết nối Telegram</Label>
          </div>

          {/* Chọn người nhận */}
          {!sendToAll && (
            <div className='border rounded-md p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-medium'>Chọn người nhận</h3>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground'>
                    Đã chọn{' '}
                    <Badge variant='outline' className='ml-1'>
                      {selectedUsers.length}
                    </Badge>{' '}
                    người dùng
                  </span>
                  {selectedUsers.length > 0 && (
                    <Button size='sm' variant='outline' className='h-8' onClick={clearSelectedUsers}>
                      <X className='h-3.5 w-3.5 mr-1' />
                      Xóa tất cả
                    </Button>
                  )}
                </div>
              </div>

              {/* Tìm kiếm */}
              <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  placeholder='Tìm kiếm người dùng...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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

              {/* Các tab */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2'>
                  <TabsList>
                    <TabsTrigger value='all'>Tất cả</TabsTrigger>
                    <TabsTrigger value='selected'>Đã chọn</TabsTrigger>
                  </TabsList>

                  {activeTab === 'all' && filteredUsers.length > 0 && (
                    <Button size='sm' variant='outline' className='h-8' onClick={selectAllDisplayedUsers}>
                      <CheckCircle className='h-3.5 w-3.5 mr-1' />
                      Chọn tất cả
                    </Button>
                  )}
                </div>

                <TabsContent value='all'>
                  {loadingUsers ? (
                    <div className='space-y-2 py-2'>
                      <Skeleton className='h-12 w-full' />
                      <Skeleton className='h-12 w-full' />
                      <Skeleton className='h-12 w-full' />
                    </div>
                  ) : usersError ? (
                    <Alert variant='destructive' className='my-4'>
                      <AlertCircle className='h-4 w-4 mr-2' />
                      <AlertDescription>Không thể tải danh sách người dùng</AlertDescription>
                    </Alert>
                  ) : filteredUsers.length === 0 ? (
                    <div className='text-center py-8'>
                      <Users className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                      <p className='text-muted-foreground'>
                        {searchQuery
                          ? 'Không tìm thấy người dùng phù hợp'
                          : 'Không có người dùng nào đã kết nối Telegram'}
                      </p>
                      {searchQuery && (
                        <Button variant='link' className='mt-2' onClick={() => setSearchQuery('')}>
                          Xóa tìm kiếm
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className='max-h-60 overflow-y-auto space-y-2 pr-2 mt-2'>
                      {filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                            selectedUsers.includes(user.id) ? 'bg-primary/10' : 'hover:bg-secondary'
                          }`}
                        >
                          <div className='flex items-center space-x-2'>
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
                              <div className='text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleUserSelection(user.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='selected'>
                  {selectedUsers.length === 0 ? (
                    <div className='text-center py-8'>
                      <AlertCircle className='h-12 w-12 mx-auto text-muted-foreground mb-2' />
                      <p className='text-muted-foreground'>Chưa chọn người dùng nào</p>
                      <Button variant='link' className='mt-2' onClick={() => setActiveTab('all')}>
                        Quay lại danh sách
                      </Button>
                    </div>
                  ) : (
                    <div className='max-h-60 overflow-y-auto space-y-2 pr-2 mt-2'>
                      {users
                        .filter(user => selectedUsers.includes(user.id))
                        .map(user => (
                          <div key={user.id} className='flex items-center justify-between p-2 rounded-md bg-primary/10'>
                            <div className='flex items-center space-x-2'>
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
                                <div className='text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs'>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8'
                              onClick={() => handleUserSelection(user.id)}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className='flex justify-between border-t p-4'>
        <div className='flex items-center text-sm text-muted-foreground'>
          <AlertCircle className='h-4 w-4 mr-1' />
          <span>
            {sendToAll ? (
              <>
                Thông báo sẽ được gửi cho <b>tất cả</b> người dùng đã kết nối Telegram
              </>
            ) : (
              <>
                Thông báo sẽ được gửi cho <b>{selectedUsers.length}</b> người dùng đã chọn
              </>
            )}
          </span>
        </div>
        <Button
          onClick={handleSendNotification}
          disabled={
            sendNotificationMutation.isPending || (!sendToAll && selectedUsers.length === 0) || !title || !content
          }
        >
          {sendNotificationMutation.isPending ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' /> Đang gửi...
            </>
          ) : (
            <>
              <Send className='h-4 w-4 mr-2' /> Gửi thông báo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
