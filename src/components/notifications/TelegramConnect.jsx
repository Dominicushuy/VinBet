'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/useToast'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, AlertCircle, Check, Loader2, Send, QrCode } from 'lucide-react'
import { fetchData, postData } from '@/utils/fetchUtils'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'

export function TelegramConnect() {
  const [loading, setLoading] = useState(true)
  const [telegramStatus, setTelegramStatus] = useState(null)
  const [telegramId, setTelegramId] = useState('')
  const [telegramUsername, setTelegramUsername] = useState('')
  const [verificationCode, setVerificationCode] = useState(null)
  const [activeTab, setActiveTab] = useState('chatid')
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  // Bot username - used for QR code and links
  const botUsername = 'vinbet_notifications_bot'
  const botUrl = `https://t.me/${botUsername}`

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
        if (response.telegram_username) {
          setTelegramUsername(response.telegram_username)
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
      const response = await postData('/api/telegram/generate-code', {})

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
      setTelegramUsername('')
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

  // Test connection by sending a test message
  const testConnection = async () => {
    try {
      setTestingConnection(true)
      await postData('/api/telegram/send/test', {})
      toast({
        title: 'Thông báo thử nghiệm đã gửi',
        description: 'Vui lòng kiểm tra Telegram của bạn'
      })
    } catch (error) {
      console.error('Error testing connection:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi gửi thông báo',
        description: 'Không thể gửi thông báo thử nghiệm'
      })
    } finally {
      setTestingConnection(false)
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
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center'>
              <Check className='mr-2 h-5 w-5 text-success' />
              Telegram đã kết nối
            </CardTitle>
            <Badge variant='success' className='px-3 py-1'>
              Kết nối hoạt động
            </Badge>
          </div>
          <CardDescription>
            {telegramUsername
              ? `Đã kết nối với tài khoản @${telegramUsername}`
              : 'Bạn đang nhận thông báo qua Telegram'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert variant='success'>
            <Check className='h-4 w-4 text-success' />
            <AlertTitle>Thông tin kết nối</AlertTitle>
            <AlertDescription className='pt-2'>
              <div className='flex flex-col space-y-2'>
                <div className='flex justify-between'>
                  <span className='font-medium'>Chat ID:</span>
                  <span>{telegramId}</span>
                </div>
                {telegramUsername && (
                  <div className='flex justify-between'>
                    <span className='font-medium'>Tên người dùng:</span>
                    <span>@{telegramUsername}</span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className='flex flex-col sm:flex-row gap-3'>
          <Button
            variant='outline'
            onClick={testConnection}
            disabled={testingConnection || disconnecting}
            className='w-full sm:w-auto'
          >
            {testingConnection && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            <Send className='w-4 h-4 mr-2' />
            Gửi tin nhắn thử nghiệm
          </Button>
          <Button
            variant='destructive'
            onClick={disconnectTelegram}
            disabled={disconnecting || testingConnection}
            className='w-full sm:w-auto'
          >
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
        <div className='flex items-center justify-between'>
          <CardTitle>Kết nối Telegram</CardTitle>
          <Badge variant='destructive' className='px-3 py-1'>
            Chưa kết nối
          </Badge>
        </div>
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
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='chatid'>Dùng Chat ID</TabsTrigger>
            <TabsTrigger value='code'>Dùng mã xác thực</TabsTrigger>
            <TabsTrigger value='qrcode'>QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value='chatid' className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Bước 1: Kết nối với bot</h4>
              <p className='text-sm text-muted-foreground'>Mở Telegram và trò chuyện với bot của chúng tôi:</p>
              <div className='flex items-center space-x-2'>
                <Input value={`@${botUsername}`} readOnly />
                <Button size='icon' variant='outline' onClick={() => copyToClipboard(`@${botUsername}`)}>
                  <Copy className='h-4 w-4' />
                </Button>
              </div>
              <p className='text-sm text-muted-foreground mt-1'>
                Hoặc{' '}
                <a href={botUrl} target='_blank' rel='noopener noreferrer' className='text-primary underline'>
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
                    <a href={botUrl} target='_blank' rel='noopener noreferrer' className='text-primary underline'>
                      Mở bot Telegram
                    </a>{' '}
                    hoặc tìm @{botUsername} trong Telegram.
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

                <Alert variant='warning'>
                  <AlertCircle className='h-4 w-4 text-warning' />
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

          <TabsContent value='qrcode' className='space-y-4'>
            <div className='flex flex-col items-center justify-center space-y-4'>
              <div className='border p-4 rounded-lg bg-card'>
                <QRCodeSVG
                  value={verificationCode ? `https://t.me/${botUsername}?start=verify_${verificationCode}` : botUrl}
                  size={200}
                  bgColor={isDarkMode ? '#1e293b' : '#ffffff'}
                  fgColor={isDarkMode ? '#ffffff' : '#000000'}
                  level={'M'}
                  includeMargin={true}
                />
              </div>

              <div className='text-center space-y-2'>
                <h4 className='font-medium'>Quét mã QR để kết nối</h4>
                <p className='text-sm text-muted-foreground max-w-sm'>
                  {verificationCode
                    ? 'Mã QR này đã được liên kết với tài khoản của bạn. Chỉ cần quét và gửi lệnh xác thực.'
                    : 'Quét mã QR để mở bot và nhận Chat ID. Sau đó sử dụng ID để kết nối.'}
                </p>
              </div>

              {!verificationCode && (
                <Button onClick={generateVerificationCode} disabled={connecting} variant='outline' className='mt-2'>
                  {connecting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  <QrCode className='h-4 w-4 mr-2' />
                  Tạo QR Code với mã xác thực
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
