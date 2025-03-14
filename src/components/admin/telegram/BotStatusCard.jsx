// src/components/admin/telegram/BotStatusCard.jsx
'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, RefreshCw, Power, Zap } from 'lucide-react'
import { postData } from '@/utils/fetchUtils'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function BotStatusCard({ status, isLoading, onRefresh }) {
  const [isRestarting, setIsRestarting] = useState(false)
  const [error, setError] = useState('')

  const handleRestartBot = async () => {
    try {
      setError('')
      setIsRestarting(true)
      await postData('/api/telegram/restart', {})
      toast.success('Bot đã được khởi động lại thành công')
      onRefresh()
    } catch (error) {
      setError('Không thể khởi động lại bot: ' + (error.message || 'Lỗi không xác định'))
      toast.error('Không thể khởi động lại bot: ' + (error.message || 'Lỗi không xác định'))
    } finally {
      setIsRestarting(false)
    }
  }

  const handleClearWebhook = async () => {
    try {
      setError('')
      await postData('/api/telegram/clear-webhook', {})
      toast.success('Đã xóa Webhook thành công')
      onRefresh()
    } catch (error) {
      setError('Không thể xóa webhook: ' + (error.message || 'Lỗi không xác định'))
      toast.error('Không thể xóa webhook: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-8 w-64' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-full' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-40 w-full' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between flex-wrap gap-2'>
          <CardTitle>Trạng thái Telegram Bot</CardTitle>
          <Badge variant={status?.initialized ? 'success' : 'destructive'} className='ml-2'>
            {status?.initialized ? 'Đang hoạt động' : 'Không hoạt động'}
          </Badge>
        </div>
        <CardDescription>Quản lý trạng thái kết nối và cấu hình của bot Telegram</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4 mr-2' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='border rounded-lg p-4'>
            <h3 className='font-medium mb-2'>Thông tin Bot</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Môi trường:</span>
                <span className='font-medium'>{status?.environment || 'N/A'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Chế độ:</span>
                <span className='font-medium'>
                  {status?.mode || status?.environment === 'production' ? 'Webhook' : 'Polling'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Bot Enabled:</span>
                <span className='font-medium'>{status?.botEnabled ? 'Yes' : 'No'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Khởi tạo:</span>
                <span className='font-medium'>{status?.initialized ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <h3 className='font-medium mb-2'>Actions</h3>
            <div className='space-y-2'>
              <Button onClick={handleRestartBot} variant='outline' className='w-full' disabled={isRestarting}>
                {isRestarting ? (
                  <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                ) : (
                  <Power className='h-4 w-4 mr-2' />
                )}
                Khởi động lại Bot
              </Button>

              <Button onClick={handleClearWebhook} variant='outline' className='w-full'>
                <Zap className='h-4 w-4 mr-2' />
                Xóa Webhook
              </Button>

              <Button
                onClick={() => window.open('/api/telegram/health', '_blank')}
                variant='outline'
                className='w-full'
              >
                <CheckCircle className='h-4 w-4 mr-2' />
                Kiểm tra Bot Health
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='justify-between border-t p-4'>
        <div className='text-xs text-muted-foreground'>
          Cập nhật lần cuối: {new Date(status?.timestamp || Date.now()).toLocaleString()}
        </div>
        <Button variant='ghost' size='sm' onClick={onRefresh} className='h-8'>
          <RefreshCw className='h-3.5 w-3.5 mr-1' />
          Làm mới
        </Button>
      </CardFooter>
    </Card>
  )
}
