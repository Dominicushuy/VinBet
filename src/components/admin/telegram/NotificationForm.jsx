// src/components/admin/telegram/NotificationForm.jsx
'use client'

import { useState, useEffect } from 'react'
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
import { AlertCircle, Send, Users } from 'lucide-react'

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

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin', 'telegram-connected-users'],
    queryFn: () => fetchData('/api/admin/telegram/users?connected=true'),
    enabled: !sendToAll
  })

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
    },
    onError: error => {
      toast.error(`Không thể gửi thông báo: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const users = usersData?.users || []

  const handleTemplateChange = templateId => {
    if (templateId === '') return

    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setTitle(template.title)
      setContent(template.content)
      setNotificationType(template.type)
    }
  }

  const handleSendNotification = () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thông báo')
      return
    }

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo')
      return
    }

    const payload = {
      title,
      content,
      type: notificationType,
      userIds: sendToAll ? [] : selectedUsers
    }

    sendNotificationMutation.mutate(payload)
  }

  const handleUserSelection = userId => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gửi thông báo Telegram</CardTitle>
        <CardDescription>Tạo và gửi thông báo đến người dùng qua Telegram</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='template'>Mẫu thông báo</Label>
            <Select onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder='Chọn mẫu thông báo hoặc tạo mới' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>Thông báo tùy chỉnh</SelectItem>
                {NOTIFICATION_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='title'>Tiêu đề</Label>
            <Input
              id='title'
              placeholder='Nhập tiêu đề thông báo'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

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

          <div className='flex items-center space-x-2'>
            <Switch id='sendToAll' checked={sendToAll} onCheckedChange={setSendToAll} />
            <Label htmlFor='sendToAll'>Gửi cho tất cả người dùng đã kết nối Telegram</Label>
          </div>

          {!sendToAll && (
            <div className='border rounded-md p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-medium'>Chọn người nhận</h3>
                <span className='text-sm text-muted-foreground'>Đã chọn {selectedUsers.length} người dùng</span>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='mb-4'>
                  <TabsTrigger value='all'>Tất cả</TabsTrigger>
                  <TabsTrigger value='selected'>Đã chọn</TabsTrigger>
                </TabsList>

                <TabsContent value='all'>
                  {loadingUsers ? (
                    <div className='text-center py-4'>Đang tải danh sách người dùng...</div>
                  ) : users.length === 0 ? (
                    <div className='text-center py-4'>Không có người dùng nào đã kết nối Telegram</div>
                  ) : (
                    <div className='max-h-60 overflow-y-auto space-y-2 pr-2'>
                      {users.map(user => (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-2 rounded-md ${
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
                              <div className='text-xs text-muted-foreground'>{user.email}</div>
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
                    <div className='text-center py-4'>Chưa chọn người dùng nào</div>
                  ) : (
                    <div className='max-h-60 overflow-y-auto space-y-2 pr-2'>
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
                                <div className='text-xs text-muted-foreground'>{user.email}</div>
                              </div>
                            </div>
                            <Button variant='ghost' size='sm' onClick={() => handleUserSelection(user.id)}>
                              Xóa
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
          disabled={sendNotificationMutation.isLoading || (!sendToAll && selectedUsers.length === 0)}
        >
          {sendNotificationMutation.isLoading ? (
            <>Đang gửi...</>
          ) : (
            <>
              <Send className='h-4 w-4 mr-2' />
              Gửi thông báo
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
