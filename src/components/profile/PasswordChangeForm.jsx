// src/components/profile/PasswordChangeForm.jsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useChangePasswordMutation } from '@/hooks/queries/useProfileQueries'
import { toast } from 'react-hot-toast'
import { Key, Loader2, Eye, EyeOff, Info } from 'lucide-react'

// Define validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất một chữ cái thường')
      .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái hoa')
      .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một chữ số')
      .regex(/[^a-zA-Z0-9]/, 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt'),
    confirmPassword: z.string()
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export function PasswordChangeForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const changePasswordMutation = useChangePasswordMutation()

  // Initialize form with validation schema
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Calculate password strength
  const calculatePasswordStrength = password => {
    if (!password) return 0

    let strength = 0

    // Length check
    if (password.length >= 12) strength += 25
    else if (password.length >= 8) strength += 15

    // Character type checks
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20

    // Variety check
    const uniqueChars = new Set(password).size
    if (uniqueChars > 10) strength += 10
    else if (uniqueChars > 5) strength += 5

    return Math.min(100, strength)
  }

  const getPasswordStrengthLabel = strength => {
    if (strength >= 80) return { label: 'Mạnh', color: 'bg-green-500' }
    if (strength >= 50) return { label: 'Trung bình', color: 'bg-amber-500' }
    return { label: 'Yếu', color: 'bg-red-500' }
  }

  const passwordStrength = calculatePasswordStrength(form.watch('newPassword'))
  const strengthInfo = getPasswordStrengthLabel(passwordStrength)

  async function onSubmit(data) {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })

      form.reset()
      toast.success('Đổi mật khẩu thành công')
    } catch (error) {
      toast.error(error.message || 'Đổi mật khẩu thất bại')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <Key className='mr-2 h-5 w-5 text-primary' />
          Đổi mật khẩu
        </CardTitle>
        <CardDescription>Cập nhật mật khẩu tài khoản của bạn</CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu hiện tại'
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3'
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      <span className='sr-only'>{showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input type={showNewPassword ? 'text' : 'password'} placeholder='Nhập mật khẩu mới' {...field} />
                    </FormControl>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      <span className='sr-only'>{showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                    </Button>
                  </div>

                  {/* Password strength indicator */}
                  {field.value && (
                    <div className='space-y-1 mt-2'>
                      <div className='flex justify-between items-center text-xs'>
                        <span>Độ mạnh: {strengthInfo.label}</span>
                        <span>{passwordStrength}%</span>
                      </div>
                      <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                        <div
                          className={`h-full ${strengthInfo.color} transition-all duration-500`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <FormDescription className='space-y-1'>
                    <p>Mật khẩu phải:</p>
                    <ul className='text-xs space-y-1'>
                      <PasswordRequirement text='Có ít nhất 8 ký tự' satisfied={field.value?.length >= 8} />
                      <PasswordRequirement
                        text='Có ít nhất một chữ cái thường (a-z)'
                        satisfied={/[a-z]/.test(field.value)}
                      />
                      <PasswordRequirement
                        text='Có ít nhất một chữ cái hoa (A-Z)'
                        satisfied={/[A-Z]/.test(field.value)}
                      />
                      <PasswordRequirement text='Có ít nhất một chữ số (0-9)' satisfied={/[0-9]/.test(field.value)} />
                      <PasswordRequirement
                        text='Có ít nhất một ký tự đặc biệt (!@#$%...)'
                        satisfied={/[^a-zA-Z0-9]/.test(field.value)}
                      />
                    </ul>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <div className='relative'>
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Nhập lại mật khẩu mới'
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      <span className='sr-only'>{showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex items-center space-x-2 rounded-md border p-3 bg-amber-500/10'>
              <Info className='h-5 w-5 text-amber-500' />
              <div className='flex-1 text-sm'>
                Sau khi đổi mật khẩu, bạn sẽ được đăng xuất khỏi tất cả các thiết bị khác
              </div>
            </div>
          </CardContent>

          <CardFooter className='border-t p-6'>
            <Button type='submit' className='w-full' disabled={changePasswordMutation.isLoading}>
              {changePasswordMutation.isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang cập nhật...
                </>
              ) : (
                'Đổi mật khẩu'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

function PasswordRequirement({ text, satisfied }) {
  return (
    <li className={`flex items-center gap-1.5 ${satisfied ? 'text-green-600' : 'text-muted-foreground'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${satisfied ? 'bg-green-600' : 'bg-muted-foreground'}`} />
      <span>{text}</span>
    </li>
  )
}
