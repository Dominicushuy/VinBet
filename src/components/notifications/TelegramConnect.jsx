// src/components/notifications/TelegramConnect.jsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/useToast'
import { Copy, AlertCircle, Check, Loader2 } from 'lucide-react'
import { fetchData, postData } from '@/utils/fetchUtils'

export default function TelegramConnect() {
  const [loading, setLoading] = useState(true)
  const [telegramStatus, setTelegramStatus] = useState(null)
  const [telegramId, setTelegramId] = useState('')
  const [verificationCode, setVerificationCode] = useState(null)
  const [activeTab, setActiveTab] = useState('chatid')
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const { toast } = useToast()

  // Fetch current Telegram status
  useEffect(() => {
    const fetchTelegramStatus = async () => {
      try {
        setLoading(true)
        const response = await fetchData('/api/notifications/telegram')
        setTelegramStatus(response.connected)
        if (response.telegram_id) {
          setTelegramId(response.telegram_id)
        }
      } catch (error) {
        console.error('Error fetching Telegram status:', error)
        toast({
          variant: 'destructive',
          title: 'Lỗi kết nối',
          description: 'Không thể kiểm tra trạng thái kết nối Telegram'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTelegramStatus()
  }, [toast])

  // Generate verification code
  const generateVerificationCode = async () => {
    try {
      setConnecting(true)
      const response = await postData('/api/notifications/telegram/generate-code', {})

      if (response.code) {
        setVerificationCode(response.code)
        setActiveTab('code')
        toast({
          title: 'Đã tạo mã xác thực',
          description: 'Mã xác thực có hiệu lực trong 30 phút'
        })
      }
    } catch (error) {
      console.error('Error generating code:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi tạo mã',
        description: 'Không thể tạo mã xác thực. Vui lòng thử lại sau'
      })
    } finally {
      setConnecting(false)
    }
  }

  // Connect with Chat ID
  const connectWithChatId = async () => {
    if (!telegramId) {
      toast({
        variant: 'destructive',
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập Telegram Chat ID'
      })
      return
    }

    try {
      setConnecting(true)
      const response = await postData('/api/notifications/telegram', {
        telegram_id: telegramId
      })

      setTelegramStatus(true)
      toast({
        title: 'Kết nối thành công',
        description: 'Telegram đã được kết nối với tài khoản của bạn'
      })
    } catch (error) {
      console.error('Error connecting:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi kết nối',
        description: error.message || 'Không thể kết nối với Telegram'
      })
    } finally {
      setConnecting(false)
    }
  }

  // Disconnect Telegram
  const disconnectTelegram = async () => {
    try {
      setDisconnecting(true)
      await fetchData('/api/notifications/telegram', {
        method: 'DELETE'
      })

      setTelegramStatus(false)
      setTelegramId('')
      toast({
        title: 'Ngắt kết nối thành công',
        description: 'Telegram đã được ngắt kết nối khỏi tài khoản của bạn'
      })
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi ngắt kết nối',
        description: 'Không thể ngắt kết nối Telegram'
      })
    } finally {
      setDisconnecting(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = text => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Đã sao chép',
      description: 'Nội dung đã được sao chép vào clipboard'
    })
  }

  if (loading) {
    return (
      <Card className='w-full'>
        <CardHeader className='space-y-1'>
          <CardTitle>Kết nối Telegram</CardTitle>
          <CardDescription>Đang tải thông tin...</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center p-6'>
          <Loader2 className='h-10 w-10 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  // Already connected
  if (telegramStatus) {
    return (
      <Card className='w-full'>
        <CardHeader className='space-y-1'>
          <CardTitle className='flex items-center'>
            <Check className='mr-2 h-5 w-5 text-green-500' />
            Telegram đã kết nối
          </CardTitle>
          <CardDescription>Bạn đang nhận thông báo qua Telegram</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className='bg-green-50 border-green-200'>
            <Check className='h-4 w-4 text-green-500' />
            <AlertTitle>Kết nối đang hoạt động</AlertTitle>
            <AlertDescription>Chat ID: {telegramId}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant='destructive' onClick={disconnectTelegram} disabled={disconnecting}>
            {disconnecting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Ngắt kết nối Telegram
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Not connected
  return (
    <Card className='w-full'>
      <CardHeader className='space-y-1'>
        <CardTitle>Kết nối Telegram</CardTitle>
        <CardDescription>Nhận thông báo tức thời qua Telegram</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Telegram chưa được kết nối</AlertTitle>
          <AlertDescription>
            Kết nối Telegram để nhận thông báo về nạp/rút tiền, kết quả trò chơi và các cập nhật quan trọng khác.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue='chatid' value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='chatid'>Dùng Chat ID</TabsTrigger>
            <TabsTrigger value='code'>Dùng mã xác thực</TabsTrigger>
          </TabsList>

          <TabsContent value='chatid' className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Bước 1: Kết nối với bot</h4>
              <p className='text-sm text-muted-foreground'>Mở Telegram và trò chuyện với bot của chúng tôi:</p>
              <div className='flex items-center space-x-2'>
                <Input value='@vinbet_notifications_bot' readOnly />
                <Button size='icon' variant='outline' onClick={() => copyToClipboard('@vinbet_notifications_bot')}>
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
              <p className='text-sm text-muted-foreground mt-1'>
                Hoặc{' '}
                <a
                  href='https://t.me/vinbet_notifications_bot'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary underline'
                >
                  nhấp vào đây
                </a>{' '}
                để mở bot trong Telegram.
              </p>
            </div>

            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Bước 2: Lấy Chat ID</h4>
              <p className='text-sm text-muted-foreground'>Gửi lệnh /start và lấy Chat ID từ bot.</p>
            </div>

            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Bước 3: Nhập Chat ID</h4>
              <Input
                placeholder='Nhập Chat ID từ bot'
                value={telegramId}
                onChange={e => setTelegramId(e.target.value)}
              />
            </div>

            <Button className='w-full' onClick={connectWithChatId} disabled={!telegramId || connecting}>
              {connecting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Kết nối với Chat ID
            </Button>
          </TabsContent>

          <TabsContent value='code' className='space-y-4'>
            {verificationCode ? (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>Mã xác thực của bạn:</h4>
                  <div className='flex items-center space-x-2'>
                    <Input value={verificationCode} readOnly className='font-mono text-center' />
                    <Button size='icon' variant='outline' onClick={() => copyToClipboard(verificationCode)}>
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>Bước 1: Kết nối với bot</h4>
                  <p className='text-sm text-muted-foreground'>
                    <a
                      href='https://t.me/vinbet_notifications_bot'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary underline'
                    >
                      Mở bot Telegram
                    </a>{' '}
                    hoặc tìm @vinbet_notifications_bot trong Telegram.
                  </p>
                </div>

                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>Bước 2: Gửi lệnh xác thực</h4>
                  <p className='text-sm text-muted-foreground'>Sao chép và gửi lệnh này cho bot:</p>
                  <div className='flex items-center space-x-2'>
                    <Input value={`/verify_${verificationCode}`} readOnly className='font-mono' />
                    <Button
                      size='icon'
                      variant='outline'
                      onClick={() => copyToClipboard(`/verify_${verificationCode}`)}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Lưu ý</AlertTitle>
                  <AlertDescription>Mã xác thực có hiệu lực trong 30 phút.</AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Tạo mã xác thực để kết nối Telegram mà không cần nhập Chat ID thủ công.
                </p>
                <Button className='w-full' onClick={generateVerificationCode} disabled={connecting}>
                  {connecting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Tạo mã xác thực
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
