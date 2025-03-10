// src/components/notifications/TelegramConnect.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Link as LinkIcon, Check, X, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  useTelegramStatusQuery,
  useConnectTelegramMutation,
  useDisconnectTelegramMutation,
} from '@/hooks/queries/useNotificationQueries'
import Link from 'next/link'

const telegramFormSchema = z.object({
  telegram_id: z.string().min(1, 'Telegram ID không được để trống'),
})

type TelegramFormValues = z.infer<typeof telegramFormSchema>

export function TelegramConnect() {
  const { data, isLoading } = useTelegramStatusQuery()
  const connectMutation = useConnectTelegramMutation()
  const disconnectMutation = useDisconnectTelegramMutation()

  const form = useForm<TelegramFormValues>({
    resolver: zodResolver(telegramFormSchema),
    defaultValues: {
      telegram_id: '',
    },
  })

  // Cập nhật form khi có dữ liệu
  useEffect(() => {
    if (data?.telegram_id) {
      form.setValue('telegram_id', data.telegram_id)
    }
  }, [data, form])

  // Kết nối với Telegram
  const handleConnect = async (formData: TelegramFormValues) => {
    await connectMutation.mutateAsync(formData.telegram_id)
  }

  // Ngắt kết nối Telegram
  const handleDisconnect = async () => {
    await disconnectMutation.mutateAsync()
    form.reset()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kết nối Telegram</CardTitle>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  const isConnected = data?.connected

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kết nối Telegram</CardTitle>
        <CardDescription>
          Kết nối tài khoản Telegram để nhận thông báo quan trọng từ VinBet
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isConnected ? (
          <div className='space-y-4'>
            <Alert variant='success' className='bg-green-50 border-green-200'>
              <Check className='h-5 w-5 text-green-600' />
              <AlertTitle>Đã kết nối thành công</AlertTitle>
              <AlertDescription>
                Tài khoản của bạn đã được kết nối với Telegram. Bạn sẽ nhận được
                thông báo quan trọng qua Telegram.
              </AlertDescription>
            </Alert>

            <div className='rounded-md border p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-medium'>Telegram ID</h3>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {data?.telegram_id}
                  </p>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isLoading}>
                  {disconnectMutation.isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <>
                      <X className='h-4 w-4 mr-2' />
                      Ngắt kết nối
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <Alert>
              <AlertCircle className='h-5 w-5' />
              <AlertTitle>Cách kết nối Telegram</AlertTitle>
              <AlertDescription className='space-y-2'>
                <p>
                  1. Tìm bot VinBet tại <code>@VinBet_notification_bot</code>{' '}
                  trên Telegram
                </p>
                <p>
                  2. Bắt đầu cuộc trò chuyện và gửi lệnh <code>/start</code>
                </p>
                <p>3. Bot sẽ cung cấp Telegram ID của bạn</p>
                <p>
                  4. Nhập Telegram ID vào trường bên dưới để hoàn tất kết nối
                </p>
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleConnect)}
                className='space-y-4'>
                <FormField
                  control={form.control}
                  name='telegram_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Nhập Telegram ID của bạn'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        ID này được cung cấp bởi bot sau khi bạn gửi lệnh{' '}
                        <code>/start</code>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type='submit'
                  className='w-full'
                  disabled={connectMutation.isLoading}>
                  {connectMutation.isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Đang kết nối...
                    </>
                  ) : (
                    'Kết nối Telegram'
                  )}
                </Button>
              </form>
            </Form>

            <div className='flex justify-center'>
              <a
                href='https://t.me/VinBet_notification_bot'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-primary hover:underline'>
                <LinkIcon className='h-4 w-4' />
                Mở bot VinBet trên Telegram
              </a>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className='bg-muted/50 border-t'>
        <div className='text-sm text-muted-foreground'>
          <p>
            Cập nhật loại thông báo bạn muốn nhận qua Telegram tại trang{' '}
            <Link
              href='/notifications/settings'
              className='text-primary hover:underline'>
              Cài đặt thông báo
            </Link>
            .
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
