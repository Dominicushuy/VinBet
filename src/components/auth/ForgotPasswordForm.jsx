// src/components/auth/ForgotPasswordForm.jsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useForgotPasswordMutation } from '@/hooks/queries/useAuthQueries'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ')
})

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const forgotPasswordMutation = useForgotPasswordMutation()

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  async function onSubmit(data) {
    try {
      await forgotPasswordMutation.mutateAsync(data)
      setEmail(data.email)
      setSuccess(true)
    } catch (error) {
      // Lỗi đã được xử lý trong mutation hook
    }
  }

  if (success) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='text-center'>Kiểm tra email của bạn</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-center'>
            Chúng tôi đã gửi một email đến <strong>{email}</strong> với hướng dẫn đặt lại mật khẩu.
          </p>
          <p className='text-center text-sm text-gray-500'>
            Vui lòng kiểm tra cả thư mục spam nếu bạn không thấy email.
          </p>
          <Alert className='bg-blue-50 border-blue-100'>
            <AlertDescription className='text-blue-800'>
              Vì lý do bảo mật, liên kết đặt lại mật khẩu sẽ hết hạn sau 1 giờ.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Link href='/login'>
            <Button variant='outline'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Quay lại đăng nhập
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader>
            <CardTitle className='text-center'>Quên mật khẩu</CardTitle>
            <CardDescription className='text-center'>
              Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            {forgotPasswordMutation.isError && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {forgotPasswordMutation.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'}
                </AlertDescription>
              </Alert>
            )}

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
          </CardContent>

          <CardFooter className='flex flex-col space-y-4'>
            <Button type='submit' className='w-full' disabled={forgotPasswordMutation.isPending}>
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý
                </>
              ) : (
                'Gửi link đặt lại mật khẩu'
              )}
            </Button>

            <div className='text-center text-sm'>
              <Link href='/login' className='text-primary hover:underline'>
                <ArrowLeft className='mr-1 h-3 w-3 inline' />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
