// src/app/(admin)/admin/telegram/page.jsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsOverview } from '@/components/admin/telegram/StatsOverview'
import { BotStatusCard } from '@/components/admin/telegram/BotStatusCard'
import { StatsChart } from '@/components/admin/telegram/StatsChart'
import { fetchData } from '@/utils/fetchUtils'

export default function TelegramAdminPage() {
  const { data: telegramStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'telegram-stats'],
    queryFn: () => fetchData('/api/admin/telegram-stats'),
    refetchInterval: 60000
  })

  const {
    data: botStatus,
    isLoading: botLoading,
    refetch: refetchBotStatus
  } = useQuery({
    queryKey: ['admin', 'telegram-bot-status'],
    queryFn: () => fetchData('/api/telegram/status'),
    refetchInterval: 30000
  })

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Người dùng kết nối</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {statsLoading ? '...' : telegramStats?.summary?.connection_rate || '0'}%
            </div>
            <p className='text-xs text-muted-foreground'>Tỷ lệ người dùng đã kết nối</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Kết nối mới</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {statsLoading ? '...' : telegramStats?.summary?.total_connections || '0'}
            </div>
            <p className='text-xs text-muted-foreground'>Tổng số kết nối</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Thông báo đã gửi</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {statsLoading ? '...' : telegramStats?.summary?.total_notifications || '0'}
            </div>
            <p className='text-xs text-muted-foreground'>Tổng thông báo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Trạng thái Bot</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {botLoading ? (
                '...'
              ) : botStatus?.initialized ? (
                <span className='text-green-500'>Online</span>
              ) : (
                <span className='text-red-500'>Offline</span>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>{botStatus?.mode || 'Unknown mode'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
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
          <StatsChart data={telegramStats?.daily} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
