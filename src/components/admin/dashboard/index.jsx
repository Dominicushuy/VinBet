'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from './StatsCard'
import { MetricsCharts } from './MetricsCharts'
import { QuickActions } from './QuickActions'
import { ActiveGamesList } from './ActiveGamesList'
import { RecentTransactions } from './RecentTransactions'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAdminDashboardQuery, useAdminMetricsQuery } from '@/hooks/queries/useAdminQueries'
import { formatCurrency } from '@/utils/formatUtils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, LineChart, CreditCard } from 'lucide-react'
import { useErrorHandling } from '@/hooks/useErrorHandling'

// Tách Dashboard Stats thành component riêng
const DashboardStats = React.memo(({ dashboardData, isLoading }) => {
  const userStats = dashboardData?.users || {}
  const gameStats = dashboardData?.games || {}
  const transactionStats = dashboardData?.transactions || {}
  const transactionSummary = dashboardData?.transactionSummary || {}

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <StatsCard
        title='Người dùng mới'
        value={userStats.new_users_week || 0}
        description='7 ngày qua'
        icon={<Users className='h-4 w-4' />}
        trend='up'
        trendValue={2.5}
        isLoading={isLoading}
      />

      <StatsCard
        title='Doanh thu'
        value={formatCurrency(transactionSummary.system_profit || 0)}
        description='7 ngày qua'
        icon={<DollarSign className='h-4 w-4' />}
        trend='up'
        trendValue={15.2}
        isLoading={isLoading}
      />

      <StatsCard
        title='Tỷ lệ thắng'
        value={`${(gameStats.win_rate || 0).toFixed(1)}%`}
        description='Tổng tỷ lệ thắng cược'
        icon={<LineChart className='h-4 w-4' />}
        trend='down'
        trendValue={1.8}
        isLoading={isLoading}
      />

      <StatsCard
        title='Thanh toán'
        value={transactionStats.pending_deposits || 0}
        description='Đang chờ xử lý'
        icon={<CreditCard className='h-4 w-4' />}
        trend='up'
        trendValue={12.4}
        isLoading={isLoading}
      />
    </div>
  )
})
DashboardStats.displayName = 'DashboardStats'

// Tách Dashboard Metrics thành component riêng
const DashboardMetrics = React.memo(({ timeRange, chartType, onTimeRangeChange, onChartTypeChange }) => {
  const { data: metricsData, isLoading } = useAdminMetricsQuery({
    interval: timeRange,
    visibleCharts: [chartType]
  })

  return (
    <Card>
      <CardContent className='p-4 md:p-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6'>
          <h3 className='text-base md:text-lg font-semibold mb-2 sm:mb-0'>Thống kê theo thời gian</h3>
          <div className='w-full sm:w-auto'>
            <Tabs value={chartType} onValueChange={onChartTypeChange} className='w-full'>
              <TabsList className='w-full sm:w-auto grid grid-cols-3 sm:flex'>
                <TabsTrigger value='revenue' className='text-xs md:text-sm'>
                  Doanh thu
                </TabsTrigger>
                <TabsTrigger value='users' className='text-xs md:text-sm'>
                  Người dùng
                </TabsTrigger>
                <TabsTrigger value='bets' className='text-xs md:text-sm'>
                  Đặt cược
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isLoading ? (
          <div className='h-[200px] md:h-[350px] flex items-center justify-center'>
            <Skeleton className='h-full w-full rounded-md' />
          </div>
        ) : (
          <div className='h-[200px] md:h-[350px]'>
            <ErrorBoundary>
              <MetricsCharts data={metricsData?.metrics || []} interval={timeRange} visibleCharts={[chartType]} />
            </ErrorBoundary>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
DashboardMetrics.displayName = 'DashboardMetrics'

// Component chính AdminDashboard
export function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week')
  const [chartType, setChartType] = useState('revenue')
  const { handleError } = useErrorHandling()

  // Sử dụng useCallback để tránh re-renders không cần thiết
  const handleTimeRangeChange = useCallback(value => {
    setTimeRange(value)
  }, [])

  const handleChartTypeChange = useCallback(value => {
    setChartType(value)
  }, [])

  // Fetch dữ liệu dashboard
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useAdminDashboardQuery()

  // Xử lý lỗi
  React.useEffect(() => {
    if (dashboardError) {
      handleError(dashboardError, 'Dashboard Summary')
    }
  }, [dashboardError, handleError])

  return (
    <ErrorBoundary>
      <div className='space-y-4 md:space-y-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
          <div>
            <h2 className='text-xl md:text-2xl font-bold tracking-tight'>Tổng quan hệ thống</h2>
            <p className='text-muted-foreground'>Thống kê và chỉ số hoạt động của VinBet</p>
          </div>

          <div className='flex gap-2 mt-2 md:mt-0 overflow-auto w-full md:w-auto'>
            <Tabs value={timeRange} onValueChange={handleTimeRangeChange}>
              <TabsList>
                <TabsTrigger value='day'>Ngày</TabsTrigger>
                <TabsTrigger value='week'>Tuần</TabsTrigger>
                <TabsTrigger value='month'>Tháng</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStats dashboardData={dashboardData} isLoading={isDashboardLoading} />

        {/* Charts and Actions */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
          <div className='lg:col-span-8'>
            <DashboardMetrics
              timeRange={timeRange}
              chartType={chartType}
              onTimeRangeChange={handleTimeRangeChange}
              onChartTypeChange={handleChartTypeChange}
            />
          </div>

          <div className='lg:col-span-4'>
            <Card>
              <CardContent className='p-4 md:p-6'>
                <h3 className='text-base md:text-lg font-semibold mb-4'>Thao tác nhanh</h3>
                <ErrorBoundary>
                  <QuickActions />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tables */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
          <div className='md:col-span-8'>
            <Card>
              <CardContent className='p-4 md:p-6'>
                <h3 className='text-base md:text-lg font-semibold mb-4'>Giao dịch gần đây</h3>
                <ErrorBoundary>
                  <RecentTransactions />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>

          <div className='md:col-span-4'>
            <Card>
              <CardContent className='p-4 md:p-6'>
                <h3 className='text-base md:text-lg font-semibold mb-4'>Lượt chơi đang diễn ra</h3>
                <ErrorBoundary>
                  <ActiveGamesList />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
