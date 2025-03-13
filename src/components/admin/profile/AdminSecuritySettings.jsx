// src/components/admin/profile/AdminSecuritySettings.jsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Shield, LogOut, Loader2, Key, AlertTriangle } from 'lucide-react'
import { AdminSessionsList } from './AdminSessionsList'
import { useChangePasswordMutation } from '@/hooks/queries/useAdminProfileQueries'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
      .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export function AdminSecuritySettings() {
  const changePasswordMutation = useChangePasswordMutation()
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async data => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      toast.success('Mật khẩu đã được cập nhật thành công')
      form.reset()
    } catch (error) {
      if (error.message === 'Mật khẩu hiện tại không đúng') {
        form.setError('currentPassword', { message: 'Mật khẩu hiện tại không đúng' })
      } else {
        toast.error('Không thể cập nhật mật khẩu')
      }
      console.error(error)
    }
  }

  return (
    <Tabs defaultValue='password' className='space-y-6'>
      <TabsList>
        <TabsTrigger value='password'>Đổi mật khẩu</TabsTrigger>
        <TabsTrigger value='2fa'>Xác thực hai yếu tố</TabsTrigger>
        <TabsTrigger value='sessions'>Phiên đăng nhập</TabsTrigger>
      </TabsList>

      <TabsContent value='password'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Key className='mr-2 h-5 w-5' /> Đổi mật khẩu
            </CardTitle>
            <CardDescription>Cập nhật mật khẩu của bạn thường xuyên để tăng cường bảo mật</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div>
                <Label htmlFor='currentPassword'>Mật khẩu hiện tại</Label>
                <Input
                  id='currentPassword'
                  type='password'
                  {...form.register('currentPassword')}
                  error={form.formState.errors.currentPassword?.message}
                />
                {form.formState.errors.currentPassword && (
                  <p className='text-sm text-destructive mt-1'>{form.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor='newPassword'>Mật khẩu mới</Label>
                <Input
                  id='newPassword'
                  type='password'
                  {...form.register('newPassword')}
                  error={form.formState.errors.newPassword?.message}
                />
                {form.formState.errors.newPassword && (
                  <p className='text-sm text-destructive mt-1'>{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor='confirmPassword'>Xác nhận mật khẩu mới</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  {...form.register('confirmPassword')}
                  error={form.formState.errors.confirmPassword?.message}
                />
                {form.formState.errors.confirmPassword && (
                  <p className='text-sm text-destructive mt-1'>{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className='flex justify-end'>
                <Button type='submit' disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='2fa'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Shield className='mr-2 h-5 w-5' /> Xác thực hai yếu tố
            </CardTitle>
            <CardDescription>Thiết lập thêm lớp bảo mật cho tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            {!showTwoFactorSetup ? (
              <div className='space-y-6'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>Khuyến nghị bảo mật</AlertTitle>
                  <AlertDescription>
                    Xác thực hai yếu tố sẽ giúp bảo vệ tài khoản của bạn ngay cả khi mật khẩu bị lộ.
                  </AlertDescription>
                </Alert>

                <div className='flex'>
                  <Button onClick={() => setShowTwoFactorSetup(true)}>Thiết lập xác thực hai yếu tố</Button>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                <p>Đang phát triển tính năng này. Sẽ có sẵn trong bản cập nhật tiếp theo.</p>
                <Button variant='outline' onClick={() => setShowTwoFactorSetup(false)}>
                  Quay lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='sessions'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <LogOut className='mr-2 h-5 w-5' /> Quản lý phiên đăng nhập
            </CardTitle>
            <CardDescription>Quản lý các thiết bị đang đăng nhập vào tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSessionsList />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
