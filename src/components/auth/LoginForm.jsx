'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, CheckCircle, Github, Mail } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().default(false)
})

export function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    try {
      await signIn({
        email: data.email,
        password: data.password
      })

      // Lưu nhớ thông tin đăng nhập nếu được chọn
      if (data.rememberMe) {
        localStorage.setItem('rememberEmail', data.email)
      } else {
        localStorage.removeItem('rememberEmail')
      }

      // router.push("/");
      // toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social login
  const handleSocialLogin = provider => {
    toast.success(`Đăng nhập với ${provider} sẽ được hỗ trợ trong tương lai`)
  }

  return (
    <div className='space-y-6'>
      {/* Hiển thị thông báo trạng thái */}
      {registeredSuccess && (
        <Alert className='bg-success/10 border-success/30 text-success'>
          <CheckCircle className='h-4 w-4' />
          <AlertTitle>Đăng ký thành công!</AlertTitle>
          <AlertDescription>Vui lòng kiểm tra email để xác thực tài khoản.</AlertDescription>
        </Alert>
      )}

      {resetSuccess && (
        <Alert className='bg-success/10 border-success/30 text-success'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.</AlertDescription>
        </Alert>
      )}

      {verifiedSuccess && (
        <Alert className='bg-success/10 border-success/30 text-success'>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>Email đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error === 'missing_verification_token' && 'Mã xác thực không hợp lệ hoặc đã hết hạn.'}
            {error === 'invalid_verification_token' && 'Mã xác thực không chính xác.'}
            {error === 'server_error' && 'Lỗi server, vui lòng thử lại sau.'}
            {!['missing_verification_token', 'invalid_verification_token', 'server_error'].includes(error) &&
              'Đã có lỗi xảy ra. Vui lòng thử lại.'}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-foreground'>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder='email@example.com'
                    type='email'
                    className='h-11'
                    disabled={isLoading}
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
                <div className='flex items-center justify-between'>
                  <FormLabel className='text-foreground'>Mật khẩu</FormLabel>
                  <Link href='/forgot-password' className='text-xs text-primary hover:text-primary/80 hover:underline'>
                    Quên mật khẩu?
                  </Link>
                </div>
                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder='••••••••'
                      type={showPassword ? 'text' : 'password'}
                      className='h-11 pr-10'
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3 text-muted-foreground'
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      <span className='sr-only'>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
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
              <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                </FormControl>
                <FormLabel className='text-sm font-normal cursor-pointer'>Ghi nhớ đăng nhập</FormLabel>
              </FormItem>
            )}
          />

          <Button type='submit' className='w-full h-11 font-medium' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center'>
          <span className='bg-background px-4 text-xs text-muted-foreground'>Hoặc đăng nhập với</span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <Button variant='outline' className='h-11' onClick={() => handleSocialLogin('Google')} disabled={isLoading}>
          <Mail className='mr-2 h-4 w-4' />
          Google
        </Button>
        <Button variant='outline' className='h-11' onClick={() => handleSocialLogin('Github')} disabled={isLoading}>
          <Github className='mr-2 h-4 w-4' />
          Github
        </Button>
      </div>
    </div>
  )
}
