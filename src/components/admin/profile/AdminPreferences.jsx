// src/components/admin/profile/AdminPreferences.jsx
'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useForm, Controller } from 'react-hook-form'
import { useAdminPreferencesQuery, useUpdateAdminPreferencesMutation } from '@/hooks/queries/useAdminProfileQueries'
import { Loader2, Monitor, Sun, Moon } from 'lucide-react'

export function AdminPreferences() {
  const { setTheme, theme } = useTheme()
  const { data: preferences, isLoading } = useAdminPreferencesQuery()
  const updateMutation = useUpdateAdminPreferencesMutation()

  const form = useForm({
    defaultValues: {
      theme: 'system',
      timezone: 'Asia/Ho_Chi_Minh',
      date_format: 'dd/MM/yyyy',
      notification_settings: {
        email_notifications: true,
        push_notifications: true,
        game_notifications: true,
        transaction_notifications: true,
        system_notifications: true
      }
    }
  })

  useEffect(() => {
    if (preferences) {
      form.reset({
        theme: preferences.theme || 'system',
        timezone: preferences.timezone || 'Asia/Ho_Chi_Minh',
        date_format: preferences.date_format || 'dd/MM/yyyy',
        notification_settings: preferences.notification_settings || {
          email_notifications: true,
          push_notifications: true,
          game_notifications: true,
          transaction_notifications: true,
          system_notifications: true
        }
      })
    }
  }, [preferences, form])

  // Cập nhật theme từ form
  useEffect(() => {
    if (theme !== form.watch('theme')) {
      setTheme(form.watch('theme'))
    }
  }, [form.watch('theme'), setTheme, theme])

  const onSubmit = async data => {
    try {
      await updateMutation.mutateAsync(data)
      toast.success('Đã lưu tùy chỉnh của bạn')
    } catch (error) {
      toast.error('Không thể cập nhật tùy chỉnh')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Giao diện và hiển thị</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='theme'>Chủ đề</Label>
              <div className='grid grid-cols-3 gap-2'>
                <Button
                  type='button'
                  variant={form.watch('theme') === 'light' ? 'default' : 'outline'}
                  onClick={() => form.setValue('theme', 'light')}
                  className='justify-start gap-2'
                >
                  <Sun className='h-4 w-4' />
                  <span>Sáng</span>
                </Button>
                <Button
                  type='button'
                  variant={form.watch('theme') === 'dark' ? 'default' : 'outline'}
                  onClick={() => form.setValue('theme', 'dark')}
                  className='justify-start gap-2'
                >
                  <Moon className='h-4 w-4' />
                  <span>Tối</span>
                </Button>
                <Button
                  type='button'
                  variant={form.watch('theme') === 'system' ? 'default' : 'outline'}
                  onClick={() => form.setValue('theme', 'system')}
                  className='justify-start gap-2'
                >
                  <Monitor className='h-4 w-4' />
                  <span>Hệ thống</span>
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='timezone'>Múi giờ</Label>
              <Controller
                control={form.control}
                name='timezone'
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn múi giờ' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Asia/Ho_Chi_Minh'>Việt Nam (GMT+7)</SelectItem>
                      <SelectItem value='Asia/Bangkok'>Thái Lan (GMT+7)</SelectItem>
                      <SelectItem value='Asia/Singapore'>Singapore (GMT+8)</SelectItem>
                      <SelectItem value='Asia/Tokyo'>Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='date_format'>Định dạng ngày tháng</Label>
              <Controller
                control={form.control}
                name='date_format'
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn định dạng ngày tháng' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='dd/MM/yyyy'>DD/MM/YYYY</SelectItem>
                      <SelectItem value='MM/dd/yyyy'>MM/DD/YYYY</SelectItem>
                      <SelectItem value='yyyy-MM-dd'>YYYY-MM-DD</SelectItem>
                      <SelectItem value='dd MMM yyyy'>DD Tháng YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông báo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='email_notifications'>Nhận thông báo qua email</Label>
                  <p className='text-sm text-muted-foreground'>Nhận email khi có thông báo quan trọng</p>
                </div>
                <Controller
                  control={form.control}
                  name='notification_settings.email_notifications'
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id='email_notifications' />
                  )}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='push_notifications'>Thông báo trong hệ thống</Label>
                  <p className='text-sm text-muted-foreground'>Hiển thị thông báo trong dashboard</p>
                </div>
                <Controller
                  control={form.control}
                  name='notification_settings.push_notifications'
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id='push_notifications' />
                  )}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='transaction_notifications'>Cập nhật giao dịch</Label>
                  <p className='text-sm text-muted-foreground'>Thông báo khi có yêu cầu thanh toán mới</p>
                </div>
                <Controller
                  control={form.control}
                  name='notification_settings.transaction_notifications'
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id='transaction_notifications' />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={updateMutation.isPending || !form.formState.isDirty}>
            {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Lưu tùy chỉnh
          </Button>
        </div>
      </div>
    </form>
  )
}
