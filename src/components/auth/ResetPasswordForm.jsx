// src/components/auth/ResetPasswordForm.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSessionQuery, useNewPasswordMutation } from '@/hooks/queries/useAuthQueries'

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu cần ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export function ResetPasswordForm() {
  const router = useRouter()
  const { data: sessionData, isLoading: authLoading } = useSessionQuery()
  const resetPasswordMutation = useNewPasswordMutation()
  const user = sessionData?.session?.user || null

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  // Kiểm tra xem người dùng có đến từ luồng đặt lại mật khẩu không
  useEffect(() => {
    if (!authLoading) {
      const isPasswordReset =
        typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('type') === 'recovery'

      if (user && !isPasswordReset) {
        router.push('/')
      } else if (!user) {
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  async function onSubmit(data) {
    try {
      await resetPasswordMutation.mutateAsync(data.password)
    } catch (error) {
      // Lỗi đã được xử lý trong mutation
    }
  }

  if (authLoading) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardContent className='py-12 flex justify-center items-center'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Đặt lại mật khẩu</CardTitle>
        <CardDescription>Tạo mật khẩu mới cho tài khoản của bạn</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {resetPasswordMutation.error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4 mr-2' />
            <AlertDescription>{resetPasswordMutation.error.message}</AlertDescription>
          </Alert>
        )}

        {resetPasswordMutation.isSuccess ? (
          <Alert className='bg-success/20 border-success text-success'>
            <CheckCircle className='h-4 w-4 mr-2' />
            <AlertDescription>
              Mật khẩu đã được đặt lại thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập...
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          className='pr-10 h-11'
                          disabled={resetPasswordMutation.isPending}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 text-muted-foreground'
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={resetPasswordMutation.isPending}
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
                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='••••••••'
                          className='pr-10 h-11'
                          disabled={resetPasswordMutation.isPending}
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 text-muted-foreground'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={resetPasswordMutation.isPending}
                        >
                          {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-between items-center pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/login')}
                  disabled={resetPasswordMutation.isPending}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
                </Button>

                <Button type='submit' disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      Lưu mật khẩu
                      <Save className='ml-2 h-4 w-4' />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>

      <CardFooter className='border-t pt-4 text-center text-sm text-muted-foreground'>
        Mật khẩu cần có ít nhất 6 ký tự và nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt để tăng tính bảo mật.
      </CardFooter>
    </Card>
  )
}
