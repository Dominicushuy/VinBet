// src/components/auth/RegisterForm.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, CheckCircle, User, Mail, Key, ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRegisterMutation } from '@/hooks/queries/useAuthQueries'

// Mở rộng schema đăng ký với validation phức tạp hơn
const registerSchema = z
  .object({
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu cần ít nhất 8 ký tự')
      .regex(/[a-z]/, 'Mật khẩu cần ít nhất 1 chữ thường')
      .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    fullName: z.string().min(1, 'Họ tên không được để trống').max(50, 'Họ tên không được vượt quá 50 ký tự'),
    referralCode: z
      .string()
      .optional()
      .transform(val => (val === '' ? undefined : val)),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Bạn phải đồng ý với điều khoản dịch vụ'
    })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')
  const registerMutation = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      referralCode: referralCode || '',
      acceptTerms: false
    }
  })

  // Password strength checker
  useEffect(() => {
    const password = form.watch('password')
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1

    setPasswordStrength(strength)
  }, [form.watch('password')])

  async function onSubmit(data) {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        referralCode: data.referralCode
      })

      setSuccess(true)
      form.reset()

      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 3000)
    } catch (error) {
      // Lỗi đã được xử lý trong hook mutation
    }
  }

  // Hiển thị độ mạnh mật khẩu
  const renderPasswordStrength = () => {
    const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']

    return (
      <div className='mt-1'>
        <div className='flex space-x-1'>
          {[1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className={`h-1 w-full rounded-full ${
                passwordStrength >= level
                  ? passwordStrength === 1
                    ? 'bg-red-500'
                    : passwordStrength === 2
                    ? 'bg-orange-500'
                    : passwordStrength === 3
                    ? 'bg-yellow-500'
                    : passwordStrength === 4
                    ? 'bg-green-400'
                    : 'bg-green-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className='text-xs mt-1 text-gray-500'>
          {passwordStrength ? strengthLabels[passwordStrength - 1] : 'Chưa nhập mật khẩu'}
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='text-center'>Đăng ký thành công</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <div className='mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center'>
            <CheckCircle className='h-6 w-6 text-green-600' />
          </div>
          <p>Cảm ơn bạn đã đăng ký! Vui lòng kiểm tra email để xác nhận tài khoản.</p>
          <p className='text-sm text-gray-500'>Đang chuyển hướng đến trang đăng nhập...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader>
            <CardTitle className='text-center'>Đăng ký tài khoản</CardTitle>
            <CardDescription className='text-center'>Nhập thông tin để tạo tài khoản mới</CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            {registerMutation.isError && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {registerMutation.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.'}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <User className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                      <Input placeholder='Nguyễn Văn A' className='pl-10' {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                      <Input
                        type='email'
                        placeholder='example@email.com'
                        className='pl-10'
                        autoComplete='email'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Key className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        className='pl-10'
                        autoComplete='new-password'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-5 w-5 text-gray-400' />
                        ) : (
                          <Eye className='h-5 w-5 text-gray-400' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {renderPasswordStrength()}
                  <FormDescription>Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Key className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        className='pl-10'
                        autoComplete='new-password'
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='h-5 w-5 text-gray-400' />
                        ) : (
                          <Eye className='h-5 w-5 text-gray-400' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='referralCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã giới thiệu (không bắt buộc)</FormLabel>
                  <FormControl>
                    <Input placeholder='Nhập mã giới thiệu nếu có' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='acceptTerms'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <input
                      type='checkbox'
                      className='h-4 w-4 mt-1 rounded border-gray-300'
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>
                      Tôi đồng ý với{' '}
                      <Link href='/terms' className='text-primary hover:underline'>
                        Điều khoản
                      </Link>{' '}
                      và{' '}
                      <Link href='/privacy' className='text-primary hover:underline'>
                        Chính sách Bảo mật
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className='flex flex-col space-y-4'>
            <Button type='submit' className='w-full' disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý
                </>
              ) : (
                <>
                  <UserPlus className='mr-2 h-4 w-4' />
                  Đăng ký
                </>
              )}
            </Button>

            <div className='text-center text-sm'>
              Đã có tài khoản?{' '}
              <Link href='/login' className='text-primary hover:underline'>
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
