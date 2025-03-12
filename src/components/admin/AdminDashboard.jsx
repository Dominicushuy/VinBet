'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from './dashboard/StatsCard'
import { MetricsCharts } from './dashboard/MetricsCharts'
import { QuickActions } from './dashboard/QuickActions'
import { ActiveGamesList } from './dashboard/ActiveGamesList'
import { RecentTransactions } from './dashboard/RecentTransactions'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useAdminDashboardQuery, useAdminMetricsQuery } from '@/hooks/queries/useAdminQueries'
import { formatCurrency } from '@/utils/formatUtils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, LineChart, CreditCard } from 'lucide-react'

export function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week')
  const [chartType, setChartType] = useState('revenue')

  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboardQuery()

  const { data: metricsData, isLoading: isMetricsLoading } = useAdminMetricsQuery({
    interval: timeRange,
    visibleCharts: [chartType]
  })

  const userStats = dashboardData?.users || {}
  const gameStats = dashboardData?.games || {}
  const transactionStats = dashboardData?.transactions || {}
  const transactionSummary = dashboardData?.transactionSummary || {}

  return (
    <ErrorBoundary>
      <div className='space-y-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tổng quan hệ thống</h2>
            <p className='text-muted-foreground'>Thống kê và chỉ số hoạt động của VinBet</p>
          </div>

          <div className='flex gap-2 mt-2 md:mt-0'>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value='day'>Ngày</TabsTrigger>
                <TabsTrigger value='week'>Tuần</TabsTrigger>
                <TabsTrigger value='month'>Tháng</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatsCard
            title='Người dùng mới'
            value={userStats.new_users_week || 0}
            description='7 ngày qua'
            icon={<Users className='h-4 w-4' />}
            trend='up'
            trendValue={2.5}
            isLoading={isDashboardLoading}
          />

          <StatsCard
            title='Doanh thu'
            value={formatCurrency(transactionSummary.system_profit || 0)}
            description='7 ngày qua'
            icon={<DollarSign className='h-4 w-4' />}
            trend='up'
            trendValue={15.2}
            isLoading={isDashboardLoading}
          />

          <StatsCard
            title='Tỷ lệ thắng'
            value={`${(gameStats.win_rate || 0).toFixed(1)}%`}
            description='Tổng tỷ lệ thắng cược'
            icon={<LineChart className='h-4 w-4' />}
            trend='down'
            trendValue={1.8}
            isLoading={isDashboardLoading}
          />

          <StatsCard
            title='Thanh toán'
            value={transactionStats.pending_deposits || 0}
            description='Đang chờ xử lý'
            icon={<CreditCard className='h-4 w-4' />}
            trend='up'
            trendValue={12.4}
            isLoading={isDashboardLoading}
          />
        </div>

        {/* Charts and Actions */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
          <div className='lg:col-span-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
                  <h3 className='text-lg font-semibold mb-2 sm:mb-0'>Thống kê theo thời gian</h3>
                  <Tabs value={chartType} onValueChange={setChartType}>
                    <TabsList>
                      <TabsTrigger value='revenue'>Doanh thu</TabsTrigger>
                      <TabsTrigger value='users'>Người dùng</TabsTrigger>
                      <TabsTrigger value='bets'>Đặt cược</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {isMetricsLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <Skeleton className='h-full w-full rounded-md' />
                  </div>
                ) : (
                  <div className='h-[350px]'>
                    <MetricsCharts data={metricsData?.metrics || []} interval={timeRange} visibleCharts={[chartType]} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-4'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Thao tác nhanh</h3>
                <QuickActions />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tables */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
          <div className='md:col-span-8'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Giao dịch gần đây</h3>
                <RecentTransactions />
              </CardContent>
            </Card>
          </div>

          <div className='md:col-span-4'>
            <Card>
              <CardContent className='p-6'>
                <h3 className='text-lg font-semibold mb-4'>Lượt chơi đang diễn ra</h3>
                <ActiveGamesList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
