// src/components/notifications/TelegramConnect.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  MessageSquare,
  QrCode,
  Smartphone,
  X
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Steps, Step } from '@/components/ui/steps'
import { useToast } from '@/hooks/useToast'
import {
  useTelegramStatusQuery,
  useConnectTelegramMutation,
  useDisconnectTelegramMutation
} from '@/hooks/queries/useNotificationQueries'
import { Settings } from 'lucide-react'
import Link from 'next/link'

const TELEGRAM_BOT_USERNAME = 'VinBet_notification_bot'

export function TelegramConnect() {
  const { toast } = useToast()
  const { data: telegramStatus, isLoading: isStatusLoading } = useTelegramStatusQuery()
  const connectMutation = useConnectTelegramMutation()
  const disconnectMutation = useDisconnectTelegramMutation()

  const [telegramId, setTelegramId] = useState('')
  const [connectMethod, setConnectMethod] = useState('chat')

  // Set Telegram ID if already connected
  useEffect(() => {
    if (telegramStatus?.telegram_id) {
      setTelegramId(telegramStatus.telegram_id)
    }
  }, [telegramStatus])

  const handleConnect = async () => {
    if (!telegramId.trim()) return

    try {
      await connectMutation.mutateAsync(telegramId)
    } catch (error) {
      toast({
        title: 'Không thể kết nối Telegram',
        description: error.message || 'Vui lòng thử lại sau',
        variant: 'destructive'
      })
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync()
      setTelegramId('')
    } catch (error) {
      toast({
        title: 'Không thể ngắt kết nối Telegram',
        description: error.message || 'Vui lòng thử lại sau',
        variant: 'destructive'
      })
    }
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Đã sao chép',
      description: 'Đã sao chép vào clipboard',
      variant: 'success'
    })
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <MessageSquare className='mr-2 h-5 w-5 text-primary' />
          Kết nối Telegram
        </CardTitle>
        <CardDescription>Kết nối tài khoản Telegram để nhận thông báo nhanh chóng</CardDescription>
      </CardHeader>

      <CardContent className='pb-6'>
        {isStatusLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : telegramStatus?.connected ? (
          <>
            {/* Already connected state */}
            <div className='space-y-4'>
              <Alert variant='success' className='bg-green-50 border-green-200'>
                <Check className='h-5 w-5 text-green-600' />
                <AlertDescription className='text-green-600'>
                  Tài khoản Telegram của bạn đã được kết nối thành công.
                </AlertDescription>
              </Alert>

              <div className='border rounded-lg p-4'>
                <div className='flex justify-between items-center'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium'>ID Telegram đã kết nối</h3>
                    <p className='text-xs text-muted-foreground flex items-center'>
                      {telegramStatus.telegram_id}
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-5 w-5 ml-1'
                        onClick={() => copyToClipboard(telegramStatus.telegram_id)}
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </p>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isLoading}
                  >
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

              <div className='mt-4 space-y-2'>
                <h3 className='text-sm font-medium'>Bot Telegram VinBet</h3>
                <p className='text-sm text-muted-foreground'>
                  Bạn sẽ nhận được thông báo từ bot Telegram chính thức của VinBet.
                </p>

                <div className='flex flex-col sm:flex-row gap-2 mt-2'>
                  <Button variant='outline' size='sm' className='flex-1' asChild>
                    <a
                      href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center'
                    >
                      <MessageSquare className='h-4 w-4 mr-2' />
                      Mở bot trên Telegram
                      <ExternalLink className='h-3 w-3 ml-2' />
                    </a>
                  </Button>

                  <Button variant='outline' size='sm' className='flex-1' asChild>
                    <Link href='/notifications/settings' className='flex items-center justify-center'>
                      <Settings className='h-4 w-4 mr-2' />
                      Cài đặt thông báo
                    </Link>
                  </Button>
                </div>
              </div>

              <Alert className='bg-amber-50 border-amber-200 mt-6'>
                <AlertTriangle className='h-5 w-5 text-amber-600' />
                <AlertDescription className='text-amber-700'>
                  Nếu bạn không nhận được thông báo, hãy đảm bảo rằng bạn chưa chặn bot VinBet trên Telegram.
                </AlertDescription>
              </Alert>
            </div>
          </>
        ) : (
          <>
            {/* Not connected state - Connect flow */}
            <Tabs value={connectMethod} onValueChange={setConnectMethod} className='w-full'>
              <TabsList className='w-full grid grid-cols-2'>
                <TabsTrigger value='chat'>Chat với Bot</TabsTrigger>
                <TabsTrigger value='qr'>Quét mã QR</TabsTrigger>
              </TabsList>

              <TabsContent value='chat' className='pt-6 space-y-6'>
                <Steps>
                  <Step
                    title='Mở bot trên Telegram'
                    description='Tìm bot VinBet theo username @VinBet_notification_bot'
                  >
                    <div className='flex flex-col space-y-2 mt-2'>
                      <div className='flex items-center gap-2'>
                        <Input value={`@${TELEGRAM_BOT_USERNAME}`} readOnly className='flex-1 bg-muted' />
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => copyToClipboard(`@${TELEGRAM_BOT_USERNAME}`)}
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>

                      <Button variant='secondary' className='w-full' asChild>
                        <a
                          href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center justify-center'
                        >
                          <MessageSquare className='h-4 w-4 mr-2' />
                          Mở trên Telegram
                          <ExternalLink className='h-3 w-3 ml-2' />
                        </a>
                      </Button>
                    </div>
                  </Step>

                  <Step title='Gửi lệnh bắt đầu' description='Gửi lệnh /start cho bot để nhận ID kết nối'>
                    <div className='max-w-xs mx-auto mt-3'>
                      <div className='border rounded-lg p-3 bg-muted/30'>
                        <div className='text-xs text-muted-foreground mb-2'>Gửi tin nhắn này cho bot:</div>
                        <div className='flex justify-between items-center'>
                          <code className='bg-primary/10 text-primary px-2 py-1 rounded text-sm'>/start</code>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => copyToClipboard('/start')}
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Step>

                  <Step title='Nhập ID Telegram' description='Nhập ID Telegram mà bot cung cấp cho bạn'>
                    <div className='space-y-2 mt-2'>
                      <div className='flex items-center gap-2'>
                        <Input
                          value={telegramId}
                          onChange={e => setTelegramId(e.target.value)}
                          placeholder='Nhập Telegram ID của bạn'
                          className='flex-1'
                        />
                        <Button
                          variant='primary'
                          onClick={handleConnect}
                          disabled={!telegramId.trim() || connectMutation.isLoading}
                        >
                          {connectMutation.isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Kết nối'}
                        </Button>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Bot sẽ cung cấp cho bạn một ID duy nhất để kết nối tài khoản
                      </p>
                    </div>
                  </Step>
                </Steps>

                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    Sau khi kết nối, bạn sẽ nhận được thông báo về các hoạt động quan trọng trên tài khoản VinBet.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value='qr' className='pt-6 space-y-6'>
                <div className='flex flex-col items-center'>
                  <div className='border-2 border-primary/20 rounded-lg p-2 bg-white'>
                    <div className='relative'>
                      <div className='w-48 h-48 bg-primary/5 flex items-center justify-center'>
                        <QrCode className='w-32 h-32 text-primary/20' />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://t.me/${TELEGRAM_BOT_USERNAME}?start=connect`}
                            alt='QR Code'
                            className='w-32 h-32'
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className='text-sm text-muted-foreground mt-4 text-center max-w-xs'>
                    Sử dụng ứng dụng Telegram trên điện thoại để quét mã QR và bắt đầu kết nối
                  </p>

                  <div className='w-full mt-6 space-y-2'>
                    <Label htmlFor='qr-telegram-id'>Nhập ID Telegram nhận được từ bot</Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        id='qr-telegram-id'
                        value={telegramId}
                        onChange={e => setTelegramId(e.target.value)}
                        placeholder='Nhập Telegram ID từ bot'
                      />
                      <Button onClick={handleConnect} disabled={!telegramId.trim() || connectMutation.isLoading}>
                        {connectMutation.isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Kết nối'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Smartphone className='h-4 w-4' />
                  <AlertDescription>Bạn cần cài đặt ứng dụng Telegram trên điện thoại để quét mã QR.</AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>

      <CardFooter className='border-t px-6 py-4 flex justify-between'>
        <Button variant='ghost' asChild>
          <a href='/notifications/settings'>Quay lại cài đặt</a>
        </Button>

        <Button variant='outline' asChild>
          <a href='https://telegram.org/faq' target='_blank' rel='noopener noreferrer' className='flex items-center'>
            Trợ giúp
            <ExternalLink className='ml-2 h-3 w-3' />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
