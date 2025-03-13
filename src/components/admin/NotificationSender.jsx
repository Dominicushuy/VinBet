'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Bell } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useMutation } from '@tanstack/react-query'

const notificationFormSchema = z.object({
  title: z.string().min(3, 'Tiêu đề cần ít nhất 3 ký tự'),
  content: z.string().min(5, 'Nội dung cần ít nhất 5 ký tự'),
  type: z.enum(['system', 'transaction', 'game', 'admin']),
  recipients: z.enum(['all', 'specific']),
  user_id: z
    .string()
    .optional()
    .refine(val => {
      if (val === '' || val === undefined) return true
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
    }, 'ID người dùng không đúng định dạng UUID')
})

export function NotificationSender() {
  const form = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'admin',
      recipients: 'all',
      user_id: ''
    }
  })

  const recipientsType = form.watch('recipients')

  // Validate user_id khi recipients là 'specific'
  const validateUserIdField = data => {
    if (data.recipients === 'specific' && (!data.user_id || data.user_id.trim() === '')) {
      form.setError('user_id', {
        type: 'manual',
        message: 'ID người dùng không được để trống khi chọn gửi cho người dùng cụ thể'
      })
      return false
    }
    return true
  }

  const sendNotification = useMutation({
    mutationFn: async data => {
      // Chuẩn bị dữ liệu cho API
      const payload = {
        title: data.title,
        content: data.content,
        type: data.type,
        userIds:
          data.recipients === 'all'
            ? [] // API sẽ lấy tất cả user IDs
            : [data.user_id]
      }

      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể gửi thông báo')
      }

      return response.json()
    },
    onSuccess: data => {
      toast.success(data.message || 'Đã gửi thông báo thành công')
      form.reset()
    },
    onError: error => {
      console.error('Error sending notification:', error)
      toast.error(error.message || 'Không thể gửi thông báo')
    }
  })

  const handleSubmit = data => {
    if (!validateUserIdField(data)) return
    sendNotification.mutate(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          Gửi thông báo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập tiêu đề thông báo' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Nhập nội dung thông báo' className='min-h-24' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại thông báo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn loại thông báo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='system'>Hệ thống</SelectItem>
                      <SelectItem value='transaction'>Giao dịch</SelectItem>
                      <SelectItem value='game'>Trò chơi</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='recipients'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người nhận</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn người nhận' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='all'>Tất cả người dùng</SelectItem>
                      <SelectItem value='specific'>Người dùng cụ thể</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {recipientsType === 'specific' && (
              <FormField
                control={form.control}
                name='user_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập ID của người dùng' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type='submit' disabled={sendNotification.isPending} className='w-full'>
              {sendNotification.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang gửi...
                </>
              ) : (
                'Gửi thông báo'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
