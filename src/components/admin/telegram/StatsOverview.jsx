// src/components/admin/telegram/StatsOverview.jsx
'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Bell } from 'lucide-react'

export function StatsOverview({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-5 w-40' />
              <Skeleton className='h-4 w-full' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-16 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Ensure we have valid data with fallbacks
  const summary = stats?.summary || {
    total_notifications_sent: 0,
    total_new_connections: 0,
    total_disconnections: 0,
    total_bot_interactions: 0,
    connection_rate: 0
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle>Tỷ lệ kết nối</CardTitle>
          <CardDescription>Phần trăm người dùng đã kết nối Telegram</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold mb-2'>{parseFloat(summary.connection_rate).toFixed(1)}%</div>
          <Progress value={summary.connection_rate} className='h-2' />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle>Kết nối / Ngắt kết nối</CardTitle>
          <CardDescription>Số lượng kết nối mới và ngắt kết nối</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium flex items-center'>
              <Users className='h-4 w-4 mr-2 text-green-500' />
              Kết nối mới
            </span>
            <span className='text-2xl font-bold'>{summary.total_new_connections.toLocaleString()}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium flex items-center'>
              <Users className='h-4 w-4 mr-2 text-red-500' />
              Ngắt kết nối
            </span>
            <span className='text-2xl font-bold text-muted-foreground'>
              {summary.total_disconnections.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle>Tương tác</CardTitle>
          <CardDescription>Thống kê tương tác qua Telegram</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium flex items-center'>
              <Bell className='h-4 w-4 mr-2 text-blue-500' />
              Thông báo đã gửi
            </span>
            <span className='text-2xl font-bold'>{summary.total_notifications_sent.toLocaleString()}</span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium'>Tương tác với bot</span>
            <span className='text-2xl font-bold'>{summary.total_bot_interactions.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
