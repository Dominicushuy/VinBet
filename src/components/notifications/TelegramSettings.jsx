// src/components/notifications/TelegramSettings.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertCircle, Bell, CreditCard, Lock, Game, Info } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { fetchData, postData } from '@/utils/fetchUtils'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export default function TelegramSettings() {
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [settings, setSettings] = useState({
    receive_win_notifications: true,
    receive_deposit_notifications: true,
    receive_withdrawal_notifications: true,
    receive_login_alerts: true,
    receive_system_notifications: true
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetchData('/api/notifications/telegram')
        setConnected(response.connected)

        if (response.settings) {
          setSettings(response.settings)
        }
      } catch (error) {
        console.error('Error fetching Telegram settings:', error)
        toast({
          variant: 'destructive',
          title: 'Lỗi kết nối',
          description: 'Không thể lấy cài đặt Telegram'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  // Toggle setting
  const toggleSetting = setting => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true)
      await postData('/api/notifications/telegram/settings', settings)

      toast({
        title: 'Cài đặt đã được lưu',
        description: 'Thiết lập thông báo Telegram đã được cập nhật'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi cập nhật',
        description: 'Không thể lưu thiết lập Telegram'
      })
    } finally {
      setSaving(false)
    }
  }

  // Send test notification
  const sendTestNotification = async () => {
    try {
      setSaving(true)
      await postData('/api/telegram/send/test', {})

      toast({
        title: 'Đã gửi thông báo thử nghiệm',
        description: 'Hãy kiểm tra Telegram của bạn'
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi gửi thông báo',
        description: 'Không thể gửi thông báo thử nghiệm'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Cài đặt thông báo Telegram</CardTitle>
          <CardDescription>Quản lý các thông báo qua Telegram</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-6 w-full' />
          <Skeleton className='h-6 w-full' />
          <Skeleton className='h-6 w-full' />
          <Skeleton className='h-6 w-full' />
          <Skeleton className='h-6 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!connected) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Cài đặt thông báo Telegram</CardTitle>
          <CardDescription>Quản lý các thông báo qua Telegram</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Chưa kết nối Telegram</AlertTitle>
            <AlertDescription>
              Bạn cần kết nối Telegram trước khi thiết lập thông báo.{' '}
              <a href='/notifications/telegram' className='font-medium underline'>
                Kết nối Telegram ngay
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Cài đặt thông báo Telegram</CardTitle>
        <CardDescription>Quản lý các thông báo qua Telegram</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertTitle>Telegram đã kết nối</AlertTitle>
          <AlertDescription>Thiết lập các loại thông báo bạn muốn nhận qua Telegram</AlertDescription>
        </Alert>

        <div className='space-y-3'>
          <div className='flex items-center justify-between space-x-2'>
            <div className='flex items-center space-x-2'>
              <Game className='h-4 w-4 text-muted-foreground' />
              <Label>Thông báo kết quả trúng thưởng</Label>
            </div>
            <Switch
              checked={settings.receive_win_notifications}
              onCheckedChange={() => toggleSetting('receive_win_notifications')}
            />
          </div>

          <div className='flex items-center justify-between space-x-2'>
            <div className='flex items-center space-x-2'>
              <CreditCard className='h-4 w-4 text-muted-foreground' />
              <Label>Thông báo nạp tiền thành công</Label>
            </div>
            <Switch
              checked={settings.receive_deposit_notifications}
              onCheckedChange={() => toggleSetting('receive_deposit_notifications')}
            />
          </div>

          <div className='flex items-center justify-between space-x-2'>
            <div className='flex items-center space-x-2'>
              <CreditCard className='h-4 w-4 text-muted-foreground' />
              <Label>Thông báo rút tiền được phê duyệt</Label>
            </div>
            <Switch
              checked={settings.receive_withdrawal_notifications}
              onCheckedChange={() => toggleSetting('receive_withdrawal_notifications')}
            />
          </div>

          <div className='flex items-center justify-between space-x-2'>
            <div className='flex items-center space-x-2'>
              <Lock className='h-4 w-4 text-muted-foreground' />
              <Label>Thông báo đăng nhập và bảo mật</Label>
            </div>
            <Switch
              checked={settings.receive_login_alerts}
              onCheckedChange={() => toggleSetting('receive_login_alerts')}
            />
          </div>

          <div className='flex items-center justify-between space-x-2'>
            <div className='flex items-center space-x-2'>
              <Bell className='h-4 w-4 text-muted-foreground' />
              <Label>Thông báo hệ thống quan trọng</Label>
            </div>
            <Switch
              checked={settings.receive_system_notifications}
              onCheckedChange={() => toggleSetting('receive_system_notifications')}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button variant='outline' onClick={sendTestNotification} disabled={saving}>
          Gửi thông báo thử nghiệm
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thiết lập'}
        </Button>
      </CardFooter>
    </Card>
  )
}
