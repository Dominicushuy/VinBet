// src/components/auth/RegisterForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const registerSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    fullName: z.string().min(1, 'Họ tên không được để trống'),
    referralCode: z.string().optional()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export function RegisterForm() {
  const router = useRouter()
  const registerMutation = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      referralCode: ''
    }
  })

  async function onSubmit(data) {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        referralCode: data.referralCode || undefined
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

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Đăng ký tài khoản</CardTitle>
        <CardDescription>Tạo tài khoản mới để bắt đầu sử dụng VinBet</CardDescription>
      </CardHeader>

      <CardContent>
        {registerMutation.error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{registerMutation.error.message}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className='mb-4 bg-success/20 border-success text-success'>
            <CheckCircle className='h-4 w-4 mr-2' />
            <AlertDescription>
              Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản. Bạn sẽ được chuyển hướng đến trang đăng
              nhập...
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        {...field}
                        placeholder='Họ và tên'
                        className='pl-9 h-11'
                        disabled={registerMutation.isLoading || success}
                      />
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
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        {...field}
                        type='email'
                        placeholder='email@example.com'
                        className='pl-9 h-11'
                        disabled={registerMutation.isLoading || success}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Email sẽ được dùng để đăng nhập và nhận thông báo quan trọng.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Key className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          className='pl-9 pr-10 h-11'
                          disabled={registerMutation.isLoading || success}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 text-muted-foreground'
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={registerMutation.isLoading || success}
                        >
                          {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>
                      </div>
                    </FormControl>
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
                        <Key className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          className='pl-9 pr-10 h-11'
                          disabled={registerMutation.isLoading || success}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 text-muted-foreground'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={registerMutation.isLoading || success}
                        >
                          {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='referralCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã giới thiệu (không bắt buộc)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Nhập mã giới thiệu nếu có'
                      className='h-11'
                      disabled={registerMutation.isLoading || success}
                    />
                  </FormControl>
                  <FormDescription className='text-xs'>
                    Nhập mã giới thiệu để nhận thêm quà tặng khi đăng ký.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-between items-center pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/login')}
                disabled={registerMutation.isLoading || success}
              >
                <ArrowLeft className='mr-2 h-4 w-4' /> Đăng nhập
              </Button>

              <Button type='submit' disabled={registerMutation.isLoading || success}>
                {registerMutation.isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang đăng ký...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Đăng ký thành công
                  </>
                ) : (
                  <>
                    Đăng ký
                    <UserPlus className='ml-2 h-4 w-4' />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className='flex justify-center border-t pt-4'>
        <p className='text-sm text-muted-foreground'>
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <Button variant='link' size='sm' asChild className='p-0 h-auto font-normal'>
            <Link href='/terms'>Điều khoản dịch vụ</Link>
          </Button>{' '}
          và{' '}
          <Button variant='link' size='sm' asChild className='p-0 h-auto font-normal'>
            <Link href='/privacy'>Chính sách bảo mật</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
