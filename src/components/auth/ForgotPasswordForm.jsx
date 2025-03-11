// src/components/auth/ForgotPasswordForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2, Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForgotPasswordMutation } from '@/hooks/queries/useAuthQueries'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

export function ForgotPasswordForm() {
  const router = useRouter()
  const resetPasswordMutation = useForgotPasswordMutation()
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  async function onSubmit(data) {
    try {
      await resetPasswordMutation.mutateAsync(data.email)
      setSuccess(true)
    } catch (error) {
      // Lỗi đã được xử lý trong hook mutation
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Khôi phục mật khẩu</CardTitle>
        <CardDescription>Nhập email của bạn để nhận link đặt lại mật khẩu</CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {resetPasswordMutation.error && (
          <Alert variant='destructive'>
            <AlertDescription>{resetPasswordMutation.error.message}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className='space-y-4'>
            <Alert className='bg-success/20 border-success text-success'>
              <CheckCircle className='h-4 w-4 mr-2' />
              <AlertDescription>
                Link khôi phục mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm thư rác).
              </AlertDescription>
            </Alert>

            <div className='flex flex-col space-y-2'>
              <Button onClick={() => router.push('/login')} variant='default'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Quay lại đăng nhập
              </Button>

              <Button
                onClick={() => {
                  setSuccess(false)
                  form.reset()
                }}
                variant='outline'
              >
                Gửi lại yêu cầu
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                          disabled={resetPasswordMutation.isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className='text-xs'>Nhập email bạn đã dùng để đăng ký tài khoản.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-between items-center pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/login')}
                  disabled={resetPasswordMutation.isLoading}
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Quay lại
                </Button>

                <Button type='submit' disabled={resetPasswordMutation.isLoading}>
                  {resetPasswordMutation.isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi yêu cầu
                      <Send className='ml-2 h-4 w-4' />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>

      <CardFooter className='flex justify-center border-t pt-4'>
        <p className='text-sm text-muted-foreground'>
          Chưa có tài khoản?{' '}
          <Link href='/register' className='text-primary underline underline-offset-4 hover:text-primary/90'>
            Đăng ký ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
