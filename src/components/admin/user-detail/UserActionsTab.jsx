// src/components/admin/user-detail/UserActionsTab.jsx
import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { MessageSquare, Mail, Download, LockIcon, UnlockIcon, AlertCircle, Send } from 'lucide-react'

const UserActionsTab = React.memo(function UserActionsTab({
  user,
  onResetPassword,
  onBlockUser,
  onUnblockUser,
  onExportData
}) {
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    content: '',
    type: 'system'
  })

  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    type: 'notification'
  })

  const handleNotificationChange = e => {
    const { name, value } = e.target
    setNotificationForm(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationType = value => {
    setNotificationForm(prev => ({ ...prev, type: value }))
  }

  const handleEmailChange = e => {
    const { name, value } = e.target
    setEmailForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEmailType = value => {
    setEmailForm(prev => ({ ...prev, type: value }))
  }

  const handleSendNotification = async e => {
    e.preventDefault()

    if (!notificationForm.title || !notificationForm.content) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: [user.id],
          title: notificationForm.title,
          content: notificationForm.content,
          type: notificationForm.type
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể gửi thông báo')
      }

      toast.success('Đã gửi thông báo thành công')

      // Reset form
      setNotificationForm({
        title: '',
        content: '',
        type: 'system'
      })
    } catch (error) {
      toast.error(error.message || 'Không thể gửi thông báo')
    }
  }

  const handleSendEmail = async e => {
    e.preventDefault()

    if (!emailForm.subject || !emailForm.content) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      const response = await fetch('/api/admin/users/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          subject: emailForm.subject,
          content: emailForm.content,
          type: emailForm.type
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể gửi email')
      }

      toast.success('Đã gửi email thành công')

      // Reset form
      setEmailForm({
        subject: '',
        content: '',
        type: 'notification'
      })
    } catch (error) {
      toast.error(error.message || 'Không thể gửi email')
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center'>
              <MessageSquare className='h-4 w-4 mr-2 text-blue-500' />
              Gửi thông báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className='space-y-3'>
              <Input
                placeholder='Tiêu đề thông báo'
                name='title'
                value={notificationForm.title}
                onChange={handleNotificationChange}
                required
              />
              <textarea
                className='min-h-24 w-full rounded-md border border-input p-2 text-sm'
                placeholder='Nội dung thông báo'
                name='content'
                value={notificationForm.content}
                onChange={handleNotificationChange}
                required
              />
              <Select defaultValue='system' value={notificationForm.type} onValueChange={handleNotificationType}>
                <SelectTrigger>
                  <SelectValue placeholder='Loại thông báo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='system'>Hệ thống</SelectItem>
                  <SelectItem value='game'>Trò chơi</SelectItem>
                  <SelectItem value='transaction'>Giao dịch</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type='submit' className='w-full'>
                <Send className='h-4 w-4 mr-2' />
                Gửi thông báo
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center'>
              <Mail className='h-4 w-4 mr-2 text-indigo-500' />
              Gửi email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendEmail} className='space-y-3'>
              <Input
                placeholder='Tiêu đề email'
                name='subject'
                value={emailForm.subject}
                onChange={handleEmailChange}
                required
              />
              <textarea
                className='min-h-24 w-full rounded-md border border-input p-2 text-sm'
                placeholder='Nội dung email'
                name='content'
                value={emailForm.content}
                onChange={handleEmailChange}
                required
              />
              <Select defaultValue='notification' value={emailForm.type} onValueChange={handleEmailType}>
                <SelectTrigger>
                  <SelectValue placeholder='Loại email' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='notification'>Thông báo</SelectItem>
                  <SelectItem value='promotion'>Khuyến mãi</SelectItem>
                  <SelectItem value='support'>Hỗ trợ</SelectItem>
                </SelectContent>
              </Select>
              <Button type='submit' className='w-full'>
                <Send className='h-4 w-4 mr-2' />
                Gửi email
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium flex items-center'>
            <Download className='h-4 w-4 mr-2 text-green-500' />
            Xuất dữ liệu người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <Button variant='outline' className='justify-start' onClick={() => onExportData('transactions')}>
                <Download className='h-4 w-4 mr-2' />
                Xuất lịch sử giao dịch
              </Button>
              <Button variant='outline' className='justify-start' onClick={() => onExportData('bets')}>
                <Download className='h-4 w-4 mr-2' />
                Xuất lịch sử cược
              </Button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <Button variant='outline' className='justify-start' onClick={() => onExportData('profile')}>
                <Download className='h-4 w-4 mr-2' />
                Xuất thông tin chi tiết
              </Button>
              <Button variant='outline' className='justify-start' onClick={() => onExportData('logins')}>
                <Download className='h-4 w-4 mr-2' />
                Xuất lịch sử đăng nhập
              </Button>
            </div>

            <Button className='w-full' onClick={() => onExportData('all')}>
              <Download className='h-4 w-4 mr-2' />
              Xuất tất cả dữ liệu
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='border-red-100'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium flex items-center text-red-500'>
            <AlertCircle className='h-4 w-4 mr-2' />
            Hành động nguy hiểm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <Button
                variant='outline'
                className='justify-start text-red-500 border-red-300 hover:bg-red-50'
                onClick={onResetPassword}
              >
                <LockIcon className='h-4 w-4 mr-2' />
                Reset mật khẩu
              </Button>

              {user.is_blocked ? (
                <Button
                  variant='outline'
                  className='justify-start text-green-500 border-green-300 hover:bg-green-50'
                  onClick={onUnblockUser}
                >
                  <UnlockIcon className='h-4 w-4 mr-2' />
                  Mở khóa tài khoản
                </Button>
              ) : (
                <Button
                  variant='outline'
                  className='justify-start text-red-500 border-red-300 hover:bg-red-50'
                  onClick={onBlockUser}
                >
                  <LockIcon className='h-4 w-4 mr-2' />
                  Khóa tài khoản
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export { UserActionsTab }
