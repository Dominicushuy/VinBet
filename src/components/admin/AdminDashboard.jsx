'use client'

import { useState, useCallback } from 'react'
import { useAdminDashboardQuery, useAdminMetricsQuery } from '@/hooks/queries/useAdminQueries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { AdminStats } from './AdminStats'
import { AdminCharts } from './AdminCharts'

export function AdminDashboard() {
  const [metricsInterval, setMetricsInterval] = useState('day')

  const [dateRange] = useState(() => {
    const endDate = new Date().toISOString()
    const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
    return { startDate, endDate }
  })

  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error: dashboardError,
    refetch: refetchDashboard
  } = useAdminDashboardQuery()

  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useAdminMetricsQuery({
    interval: metricsInterval,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  })

  const handleIntervalChange = useCallback(value => {
    setMetricsInterval(value)
  }, [])

  const handleRefresh = useCallback(() => {
    refetchDashboard()
    refetchMetrics()
  }, [refetchDashboard, refetchMetrics])

  const hasError = dashboardError || metricsError

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Tabs value={metricsInterval} onValueChange={handleIntervalChange} className='w-[400px]'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='day'>Theo ngày</TabsTrigger>
              <TabsTrigger value='week'>Theo tuần</TabsTrigger>
              <TabsTrigger value='month'>Theo tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button variant='outline' onClick={handleRefresh}>
          <RefreshCw className='h-4 w-4 mr-2' />
          Làm mới dữ liệu
        </Button>
      </div>

      {hasError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{dashboardError ? dashboardError.message : metricsError.message}</AlertDescription>
        </Alert>
      )}

      <AdminStats summary={dashboardData} isLoading={isLoadingDashboard} />

      <AdminCharts metrics={(metricsData && metricsData.metrics) || []} isLoading={isLoadingMetrics} />

      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <h3 className='mb-2 text-lg font-semibold'>Người dùng</h3>
              <ul className='space-y-1 text-sm'>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Tổng người dùng:</span>
                  <span>{(dashboardData && dashboardData.users && dashboardData.users.total_users) || 0}</span>
                </li>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Người dùng mới hôm nay:</span>
                  <span>{(dashboardData && dashboardData.users && dashboardData.users.new_users_today) || 0}</span>
                </li>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Người dùng mới tuần này:</span>
                  <span>{(dashboardData && dashboardData.users && dashboardData.users.new_users_week) || 0}</span>
                </li>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Người dùng đang hoạt động:</span>
                  <span>{(dashboardData && dashboardData.users && dashboardData.users.active_users) || 0}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='mb-2 text-lg font-semibold'>Thanh toán</h3>
              <ul className='space-y-1 text-sm'>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Đang chờ nạp tiền:</span>
                  <span>
                    {(dashboardData && dashboardData.transactions && dashboardData.transactions.pending_deposits) || 0}
                  </span>
                </li>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Đang chờ rút tiền:</span>
                  <span>
                    {(dashboardData && dashboardData.transactions && dashboardData.transactions.pending_withdrawals) ||
                      0}
                  </span>
                </li>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Tổng người dùng tham gia:</span>
                  <span>
                    {(dashboardData &&
                      dashboardData.transactionSummary &&
                      dashboardData.transactionSummary.total_users_count) ||
                      0}
                  </span>
                </li>
                <li className='flex justify-between'>
                  <span className='text-muted-foreground'>Người dùng active (30 ngày):</span>
                  <span>
                    {(dashboardData &&
                      dashboardData.transactionSummary &&
                      dashboardData.transactionSummary.active_users_count) ||
                      0}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
