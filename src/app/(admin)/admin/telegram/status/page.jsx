'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  RefreshCw,
  AlertTriangle,
  Server,
  Link,
  Copy,
  Check,
  Power,
  Terminal,
  Zap,
  MessageSquare,
  Command
} from 'lucide-react'
import { fetchData, postData } from '@/utils/fetchUtils'
import { cn } from '@/lib/utils'

// Bot Info Tab Component
const BotInfoTab = ({ botInfo, onCopyToken, copied }) => {
  if (!botInfo?.success) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>Không thể kết nối đến bot. Vui lòng kiểm tra cấu hình.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border p-4'>
        <h3 className='text-sm font-medium mb-2'>Thông tin Bot Token</h3>
        <div className='flex items-center space-x-2'>
          <div className='bg-muted p-2 rounded-md flex-1 text-sm'>
            {botInfo.token_configured ? (
              <>
                <span>{'*'.repeat(Math.max(0, (botInfo.token_length || 45) - 8))}</span>
                <span className='font-mono'>{botInfo.bot_info?.id?.toString().slice(-8) || 'XXXXXXXX'}</span>
              </>
            ) : (
              <span className='text-red-500'>Token chưa được cấu hình!</span>
            )}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onCopyToken(botInfo.bot_info?.id || '')}
            disabled={!botInfo.token_configured}
          >
            {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Thông tin chi tiết Bot</h3>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className='font-medium'>Bot ID</TableCell>
              <TableCell>{botInfo.bot?.id ?? 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Username</TableCell>
              <TableCell>@{botInfo.bot?.username ?? 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Tên hiển thị</TableCell>
              <TableCell>{botInfo.bot?.first_name ?? 'N/A'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Môi trường</TableCell>
              <TableCell>{botInfo.environment ?? 'development'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Chế độ vận hành</TableCell>
              <TableCell>{botInfo.mode ?? 'Long Polling'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Trạng thái</TableCell>
              <TableCell>
                <Badge variant={botInfo.success ? 'success' : 'destructive'}>
                  {botInfo.success ? 'Online' : 'Offline'}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className='font-medium'>Token đã cấu hình</TableCell>
              <TableCell>
                <Badge variant={botInfo.token_configured ? 'success' : 'destructive'}>
                  {botInfo.token_configured ? 'Có' : 'Không'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Commands Tab Component
const CommandsTab = ({ commandsData, loadingCommands, onUpdateCommands, isUpdating }) => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-sm font-medium'>Bot Commands</h3>
        <Button variant='outline' size='sm' onClick={onUpdateCommands} disabled={isUpdating}>
          {isUpdating ? <RefreshCw className='h-4 w-4 mr-2 animate-spin' /> : <Command className='h-4 w-4 mr-2' />}
          Cập nhật Commands
        </Button>
      </div>

      {loadingCommands ? (
        <div className='space-y-3'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Command</TableHead>
              <TableHead>Mô tả</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!commandsData?.commands || commandsData.commands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className='text-center py-4'>
                  Không có commands nào được cấu hình
                </TableCell>
              </TableRow>
            ) : (
              commandsData.commands.map((cmd, index) => (
                <TableRow key={index}>
                  <TableCell className='font-mono'>/{cmd.command}</TableCell>
                  <TableCell>{cmd.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// Handlers Tab Component
const HandlersTab = ({ onUpdateHandlers, isUpdating }) => {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-sm font-medium'>Bot Handlers</h3>
        <Button variant='outline' size='sm' onClick={onUpdateHandlers} disabled={isUpdating}>
          {isUpdating ? <RefreshCw className='h-4 w-4 mr-2 animate-spin' /> : <Terminal className='h-4 w-4 mr-2' />}
          Cập nhật Handlers
        </Button>
      </div>

      <div className='space-y-3'>
        <div className='border rounded-md p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <MessageSquare className='h-4 w-4 text-primary' />
            <h4 className='font-medium text-sm'>Command Handlers</h4>
          </div>
          <ul className='text-sm space-y-1 ml-6 list-disc'>
            <li>
              <span className='font-mono'>/start</span> - Khởi động bot và chào mừng
            </li>
            <li>
              <span className='font-mono'>/help</span> - Hiển thị trợ giúp
            </li>
            <li>
              <span className='font-mono'>/status</span> - Kiểm tra trạng thái kết nối
            </li>
            <li>
              <span className='font-mono'>/verify_CODE</span> - Xác thực tài khoản
            </li>
            <li>
              <span className='font-mono'>/disconnect</span> - Ngắt kết nối tài khoản
            </li>
            <li>
              <span className='font-mono'>/ping</span> - Kiểm tra bot còn hoạt động không
            </li>
          </ul>
        </div>

        <div className='border rounded-md p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Terminal className='h-4 w-4 text-primary' />
            <h4 className='font-medium text-sm'>Chat Handlers</h4>
          </div>
          <p className='text-sm text-muted-foreground'>
            Bot xử lý các lệnh đặc biệt và tạo thông báo, như xác thực tài khoản và cập nhật trạng thái.
          </p>
        </div>
      </div>
    </div>
  )
}

// Webhook Form Component
const WebhookForm = ({
  webhookUrl,
  setWebhookUrl,
  onUpdateWebhook,
  onClearWebhook,
  onSetupProduction,
  isUpdating,
  isClearing,
  isSettingUp,
  environment
}) => {
  return (
    <div className='space-y-3'>
      <div className='grid gap-2'>
        <Label htmlFor='webhookUrl'>URL Webhook</Label>
        <div className='flex gap-2'>
          <Input
            id='webhookUrl'
            placeholder='https://yourdomain.com/api/telegram/webhook'
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
          />
          <Button variant='outline' onClick={onUpdateWebhook} disabled={isUpdating} aria-label='Update webhook'>
            {isUpdating ? <RefreshCw className='h-4 w-4' /> : <Link className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-2'>
        <Button variant='outline' size='sm' onClick={onClearWebhook} disabled={isClearing} className='w-full sm:w-auto'>
          {isClearing ? <RefreshCw className='h-4 w-4 mr-2 animate-spin' /> : <Zap className='h-4 w-4 mr-2' />}
          Xóa Webhook
        </Button>

        {environment === 'production' && (
          <Button
            variant='default'
            size='sm'
            onClick={onSetupProduction}
            disabled={isSettingUp}
            className='w-full sm:w-auto'
          >
            {isSettingUp ? <RefreshCw className='h-4 w-4 mr-2 animate-spin' /> : <Server className='h-4 w-4 mr-2' />}
            Thiết lập cho Production
          </Button>
        )}
      </div>
    </div>
  )
}

export default function TelegramStatusPage() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [activeTab, setActiveTab] = useState('info')
  const [copied, setCopied] = useState(false)

  // Fetch Bot Status
  const {
    data: botInfo,
    isLoading: loadingBotInfo,
    refetch: refetchBotInfo
  } = useQuery({
    queryKey: ['telegram', 'health'],
    queryFn: () => fetchData('/api/telegram/health'),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 55000
  })

  // Webhook Info
  const {
    data: webhookInfo,
    isLoading: loadingWebhookInfo,
    refetch: refetchWebhookInfo
  } = useQuery({
    queryKey: ['telegram', 'webhook-info'],
    queryFn: () => fetchData('/api/telegram/webhook'),
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 110000
  })

  // Commands List
  const {
    data: commandsData,
    isLoading: loadingCommands,
    refetch: refetchCommands
  } = useQuery({
    queryKey: ['telegram', 'commands'],
    queryFn: () => fetchData('/api/telegram/commands'),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Mutations
  const restartMutation = useMutation({
    mutationFn: () => postData('/api/telegram/restart', {}),
    onSuccess: () => {
      toast.success('Bot đã được khởi động lại thành công')
      setTimeout(() => {
        refetchBotInfo()
        refetchWebhookInfo()
      }, 3000)
    },
    onError: error => {
      toast.error(`Không thể khởi động lại bot: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const updateWebhookMutation = useMutation({
    mutationFn: url => postData('/api/telegram/update-webhook', { webhookUrl: url }),
    onSuccess: () => {
      toast.success('Webhook đã được cập nhật thành công')
      setWebhookUrl('') // Reset input after success
      refetchWebhookInfo()
    },
    onError: error => {
      toast.error(`Không thể cập nhật webhook: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const clearWebhookMutation = useMutation({
    mutationFn: () => postData('/api/telegram/clear-webhook', {}),
    onSuccess: () => {
      toast.success('Webhook đã được xóa thành công')
      refetchWebhookInfo()
    },
    onError: error => {
      toast.error(`Không thể xóa webhook: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const updateCommandsMutation = useMutation({
    mutationFn: () => postData('/api/telegram/update-commands', {}),
    onSuccess: () => {
      toast.success('Commands đã được cập nhật thành công')
      refetchCommands()
    },
    onError: error => {
      toast.error(`Không thể cập nhật commands: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const updateHandlersMutation = useMutation({
    mutationFn: () => postData('/api/telegram/update-handlers', {}),
    onSuccess: () => {
      toast.success('Handlers đã được cập nhật thành công')
      setTimeout(() => refetchBotInfo(), 3000)
    },
    onError: error => {
      toast.error(`Không thể cập nhật handlers: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  const setupProductionMutation = useMutation({
    mutationFn: () => postData('/api/telegram/setup-production', {}),
    onSuccess: () => {
      toast.success('Cấu hình production đã được thiết lập thành công')
      setTimeout(() => {
        refetchBotInfo()
        refetchWebhookInfo()
      }, 3000)
    },
    onError: error => {
      toast.error(`Không thể thiết lập cấu hình production: ${error.message || 'Lỗi không xác định'}`)
    }
  })

  // Handle copy token to clipboard
  const handleCopyToken = useCallback(async text => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Đã sao chép token vào clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Lỗi khi sao chép:', err)
      toast.error('Không thể sao chép token')
    }
  }, [])

  // Handle update webhook
  const handleUpdateWebhook = useCallback(() => {
    if (!webhookUrl) {
      toast.error('Vui lòng nhập URL webhook')
      return
    }
    updateWebhookMutation.mutate(webhookUrl)
  }, [webhookUrl, updateWebhookMutation])

  // Format webhook info with memoization
  const formattedWebhookInfo = useMemo(() => {
    if (!webhookInfo?.webhook_info) return 'Không có thông tin'

    const info = webhookInfo.webhook_info
    return (
      <div className='space-y-2 text-sm'>
        <div>
          <strong>URL:</strong> {info.url || 'Không có'}
        </div>
        <div>
          <strong>Pending updates:</strong> {info.pending_update_count || 0}
        </div>
        <div>
          <strong>Max connections:</strong> {info.max_connections || 'N/A'}
        </div>
        <div>
          <strong>Last error:</strong> {info.last_error_message || 'Không có'}
        </div>
        <div>
          <strong>Last error date:</strong>{' '}
          {info.last_error_date ? new Date(info.last_error_date * 1000).toLocaleString() : 'Không có'}
        </div>
      </div>
    )
  }, [webhookInfo])

  // Loading states for Overview Cards
  if (loadingBotInfo && loadingWebhookInfo) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>Quản lý Telegram</h1>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý Telegram</h1>
      </div> */}

      {/* <div className='flex items-center space-x-1 border-b'>
        <div
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          )}
        >
          Trạng thái Bot
        </div>
      </div> */}

      <div className='grid gap-4 md:grid-cols-2'>
        {/* Bot Status Card */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle>Trạng thái Bot</CardTitle>
              {loadingBotInfo ? (
                <Skeleton className='h-6 w-20' />
              ) : (
                <Badge variant={botInfo?.success ? 'success' : 'destructive'}>
                  {botInfo?.success ? 'Online' : 'Offline'}
                </Badge>
              )}
            </div>
            <CardDescription>Thông tin và trạng thái của bot Telegram</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBotInfo ? (
              <div className='space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-5/6' />
              </div>
            ) : !botInfo ? (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>Không thể kết nối đến bot. Vui lòng kiểm tra cấu hình.</AlertDescription>
              </Alert>
            ) : (
              <div className='space-y-4'>
                <div className='rounded-md bg-muted p-3'>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div className='text-muted-foreground'>Username:</div>
                    <div className='font-medium'>@{botInfo?.bot?.username ?? 'N/A'}</div>

                    <div className='text-muted-foreground'>Bot ID:</div>
                    <div className='font-medium'>{botInfo?.bot?.id ?? 'N/A'}</div>

                    <div className='text-muted-foreground'>Tên:</div>
                    <div className='font-medium'>{botInfo?.bot?.first_name ?? 'N/A'}</div>

                    <div className='text-muted-foreground'>Môi trường:</div>
                    <div className='font-medium'>{botInfo?.environment ?? 'development'}</div>

                    <div className='text-muted-foreground'>Chế độ:</div>
                    <div className='font-medium'>{botInfo?.mode ?? 'N/A'}</div>
                  </div>
                </div>

                <div className='flex flex-col gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => restartMutation.mutate()}
                    disabled={restartMutation.isPending}
                  >
                    {restartMutation.isPending ? (
                      <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    ) : (
                      <Power className='h-4 w-4 mr-2' />
                    )}
                    Khởi động lại Bot
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => updateHandlersMutation.mutate()}
                    disabled={updateHandlersMutation.isPending}
                  >
                    {updateHandlersMutation.isPending ? (
                      <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    ) : (
                      <Terminal className='h-4 w-4 mr-2' />
                    )}
                    Cập nhật Handlers
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className='text-xs text-muted-foreground border-t pt-4'>
            Cập nhật: {botInfo?.timestamp ? new Date(botInfo.timestamp).toLocaleString() : 'Chưa có dữ liệu'}
          </CardFooter>
        </Card>

        {/* Webhook Card */}
        <Card>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle>Cấu hình Webhook</CardTitle>
              {loadingWebhookInfo ? (
                <Skeleton className='h-6 w-20' />
              ) : (
                <Badge variant={webhookInfo?.webhook_info?.url ? 'success' : 'outline'}>
                  {webhookInfo?.webhook_info?.url ? 'Đã cấu hình' : 'Chưa cấu hình'}
                </Badge>
              )}
            </div>
            <CardDescription>Cấu hình và quản lý webhook cho bot</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingWebhookInfo ? (
              <div className='space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-10 w-full' />
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='rounded-md bg-muted p-3'>
                  {webhookInfo?.webhook_info ? (
                    formattedWebhookInfo
                  ) : (
                    <div className='text-sm text-muted-foreground'>
                      Webhook chưa được cấu hình. Sử dụng chế độ Long Polling.
                    </div>
                  )}
                </div>

                <WebhookForm
                  webhookUrl={webhookUrl}
                  setWebhookUrl={setWebhookUrl}
                  onUpdateWebhook={handleUpdateWebhook}
                  onClearWebhook={() => clearWebhookMutation.mutate()}
                  onSetupProduction={() => setupProductionMutation.mutate()}
                  isUpdating={updateWebhookMutation.isPending}
                  isClearing={clearWebhookMutation.isPending}
                  isSettingUp={setupProductionMutation.isPending}
                  environment={botInfo?.environment}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className='text-xs text-muted-foreground border-t pt-4'>
            Cập nhật:{' '}
            {webhookInfo?.current_time ? new Date(webhookInfo.current_time).toLocaleString() : 'Chưa có dữ liệu'}
          </CardFooter>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình chi tiết</CardTitle>
          <CardDescription>Quản lý cấu hình nâng cao cho Telegram Bot</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='mb-4'>
              <TabsTrigger value='info'>Thông tin Bot</TabsTrigger>
              <TabsTrigger value='commands'>Bot Commands</TabsTrigger>
              <TabsTrigger value='handlers'>Handlers</TabsTrigger>
            </TabsList>

            <TabsContent value='info' className='space-y-4'>
              <BotInfoTab botInfo={botInfo} onCopyToken={handleCopyToken} copied={copied} />
            </TabsContent>

            <TabsContent value='commands' className='space-y-4'>
              <CommandsTab
                commandsData={commandsData}
                loadingCommands={loadingCommands}
                onUpdateCommands={() => updateCommandsMutation.mutate()}
                isUpdating={updateCommandsMutation.isPending}
              />
            </TabsContent>

            <TabsContent value='handlers' className='space-y-4'>
              <HandlersTab
                onUpdateHandlers={() => updateHandlersMutation.mutate()}
                isUpdating={updateHandlersMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
