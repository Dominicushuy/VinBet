'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsOverview } from '@/components/admin/telegram/StatsOverview'
import { BotStatusCard } from '@/components/admin/telegram/BotStatusCard'
import { StatsChart } from '@/components/admin/telegram/StatsChart'
import { fetchData } from '@/utils/fetchUtils'
import { Users, Bell, MessageSquare, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Tách thành component riêng để tái sử dụng theo DRY principle
const StatCard = ({ title, value, icon, subtitle, isLoading, textColor }) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className='h-6 w-20' />
      ) : (
        <div className={`text-2xl font-bold ${textColor || ''}`}>{value}</div>
      )}
      <p className='text-xs text-muted-foreground'>{subtitle}</p>
    </CardContent>
  </Card>
)

export default function TelegramAdminPage() {
  const {
    data: telegramStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin', 'telegram-stats'],
    queryFn: () => fetchData('/api/admin/telegram-stats'),
    refetchInterval: 60000,
    staleTime: 55000, // Tối ưu để tránh re-fetch không cần thiết
    retry: 2
  })

  const {
    data: botStatus,
    isLoading: botLoading,
    error: botError,
    refetch: refetchBotStatus
  } = useQuery({
    queryKey: ['admin', 'telegram-bot-status'],
    queryFn: () => fetchData('/api/telegram/status'),
    refetchInterval: 30000,
    staleTime: 25000,
    retry: 2
  })

  // Xử lý lỗi API - trước đây thiếu
  const hasErrors = statsError || botError

  // Hàm để refresh tất cả data
  const refreshAllData = () => {
    refetchStats()
    refetchBotStatus()
  }

  return (
    <div className='space-y-6'>
      {/* Header với refresh button */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Quản lý Telegram</h1>
          <p className='text-muted-foreground'>Theo dõi và quản lý kênh thông báo Telegram</p>
        </div>
        <Button variant='outline' size='sm' onClick={refreshAllData}>
          <RefreshCw className='h-4 w-4 mr-2' />
          Làm mới
        </Button>
      </div>

      {hasErrors && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4 mr-2' />
          <AlertDescription>
            {statsError ? 'Không thể tải thống kê Telegram. ' : ''}
            {botError ? 'Không thể tải trạng thái bot Telegram.' : ''}
            Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}

      {/* Cải thiện responsive */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 sm:grid-cols-1'>
        <StatCard
          title='Người dùng kết nối'
          value={`${telegramStats?.summary?.connection_rate?.toFixed(1) || '0'}%`}
          icon={<Users className='h-4 w-4 text-muted-foreground' />}
          subtitle='Tỷ lệ người dùng đã kết nối'
          isLoading={statsLoading}
        />

        <StatCard
          title='Kết nối mới'
          value={telegramStats?.summary?.total_new_connections?.toLocaleString() || '0'}
          icon={<Users className='h-4 w-4 text-muted-foreground' />}
          subtitle='Tổng số kết nối mới'
          isLoading={statsLoading}
        />

        <StatCard
          title='Thông báo đã gửi'
          value={telegramStats?.summary?.total_notifications_sent?.toLocaleString() || '0'}
          icon={<Bell className='h-4 w-4 text-muted-foreground' />}
          subtitle='Tổng thông báo'
          isLoading={statsLoading}
        />

        <StatCard
          title='Trạng thái Bot'
          value={botLoading ? '...' : botStatus?.initialized ? 'Online' : 'Offline'}
          icon={<MessageSquare className='h-4 w-4 text-muted-foreground' />}
          subtitle={botStatus?.mode || 'Unknown mode'}
          isLoading={botLoading}
          textColor={botStatus?.initialized ? 'text-green-500' : 'text-red-500'}
        />
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='w-full sm:w-auto'>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='bot'>Bot Telegram</TabsTrigger>
          <TabsTrigger value='activity'>Hoạt động</TabsTrigger>
        </TabsList>
        <TabsContent value='overview' className='space-y-4'>
          <StatsOverview stats={telegramStats} isLoading={statsLoading} />
        </TabsContent>
        <TabsContent value='bot' className='space-y-4'>
          <BotStatusCard status={botStatus} isLoading={botLoading} onRefresh={refetchBotStatus} />
        </TabsContent>
        <TabsContent value='activity' className='space-y-4'>
          {/* Điều chỉnh từ daily sang stats để phù hợp với API response */}
          <StatsChart data={telegramStats?.stats || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
