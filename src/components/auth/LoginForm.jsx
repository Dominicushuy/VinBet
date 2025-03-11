// src/components/auth/LoginForm.jsx
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Github, Mail, LogIn } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useLoginMutation } from '@/hooks/queries/useAuthQueries'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  rememberMe: z.boolean().default(false)
})

export function LoginForm() {
  const loginMutation = useLoginMutation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)

  // Lấy redirect URL nếu có
  const redirectTo = searchParams.get('redirectTo') || '/'

  // Get query parameters
  const registeredSuccess = searchParams.get('registered') === 'true'
  const resetSuccess = searchParams.get('reset') === 'success'
  const verifiedSuccess = searchParams.get('verified') === 'true'
  const error = searchParams.get('error')

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  async function onSubmit(data) {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password
      })

      // Redirect sau khi đăng nhập thành công
      router.push(redirectTo)
    } catch (error) {
      // Lỗi đã được xử lý trong hook mutation
    }
  }

  async function handleSocialLogin(provider) {
    setSocialLoading(true)
    try {
      const supabase = createClientComponentClient()

      // Sử dụng cơ chế CSRF tích hợp của Supabase
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase(),
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`
          // Bỏ queryParams CSRF tự định nghĩa
        }
      })

      if (error) throw error
    } catch (error) {
      toast.error(`Đăng nhập với ${provider} thất bại. ${error.message}`)
      setSocialLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Đăng nhập</CardTitle>
        <CardDescription>Đăng nhập vào tài khoản VinBet của bạn</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Thông báo */}
        {registeredSuccess && (
          <Alert className='bg-success/20 border-success text-success'>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.</AlertDescription>
          </Alert>
        )}

        {resetSuccess && (
          <Alert className='bg-success/20 border-success text-success'>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>Mật khẩu đã được thay đổi thành công!</AlertDescription>
          </Alert>
        )}

        {verifiedSuccess && (
          <Alert className='bg-success/20 border-success text-success'>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>Email của bạn đã được xác thực!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              {error === 'invalid_verification_token'
                ? 'Link xác thực không hợp lệ hoặc đã hết hạn.'
                : error === 'csrf_mismatch'
                ? 'Lỗi bảo mật: CSRF token không hợp lệ.'
                : 'Có lỗi xảy ra. Vui lòng thử lại.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Form đăng nhập */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='email@example.com'
                      type='email'
                      autoComplete='email'
                      className='h-11'
                      disabled={loginMutation.isLoading}
                      {...field}
                    />
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
                  <div className='flex justify-between items-center'>
                    <FormLabel>Mật khẩu</FormLabel>
                    <Button variant='link' size='sm' asChild className='p-0 h-auto font-normal'>
                      <Link href='/forgot-password'>Quên mật khẩu?</Link>
                    </Button>
                  </div>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='••••••••'
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        className='h-11 pr-10'
                        disabled={loginMutation.isLoading}
                        {...field}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute right-0 top-0 h-full px-3 text-muted-foreground'
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loginMutation.isLoading}
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
              name='rememberMe'
              render={({ field }) => (
                <FormItem className='flex items-center space-x-2 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loginMutation.isLoading}
                    />
                  </FormControl>
                  <FormLabel className='font-normal cursor-pointer'>Ghi nhớ đăng nhập</FormLabel>
                </FormItem>
              )}
            />

            <Button type='submit' className='w-full h-11' disabled={loginMutation.isLoading || socialLoading}>
              {loginMutation.isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <LogIn className='ml-2 h-4 w-4' />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            className='h-11'
            onClick={() => handleSocialLogin('Google')}
            disabled={loginMutation.isLoading || socialLoading}
          >
            <Mail className='mr-2 h-4 w-4' />
            Google
          </Button>
          <Button
            variant='outline'
            className='h-11'
            onClick={() => handleSocialLogin('Github')}
            disabled={loginMutation.isLoading || socialLoading}
          >
            <Github className='mr-2 h-4 w-4' />
            Github
          </Button>
        </div>
      </CardContent>

      <CardFooter className='flex justify-center border-t pt-4'>
        <p className='text-sm text-muted-foreground'>
          Chưa có tài khoản?{' '}
          <Button variant='link' size='sm' asChild className='p-0 h-auto font-normal'>
            <Link href='/register'>Đăng ký ngay</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
