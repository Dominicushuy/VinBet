'use client'

import { useState, useEffect } from 'react'
import { useAdminDashboardQuery, useAdminMetricsQuery } from '@/hooks/queries/useAdminQueries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard,
  Award,
  BarChart2,
  PieChart,
  LineChart
} from 'lucide-react'
import { StatsCard } from './dashboard/StatsCard'
import { MetricsCharts } from './dashboard/MetricsCharts'
import { ActiveGamesList } from './dashboard/ActiveGamesList'
import { RecentTransactions } from './dashboard/RecentTransactions'
import { QuickActions } from './dashboard/QuickActions'

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  })
  const [metricsInterval, setMetricsInterval] = useState('day')
  const [visibleCharts, setVisibleCharts] = useState(['revenue', 'users'])

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useAdminDashboardQuery()

  const {
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useAdminMetricsQuery({
    interval: metricsInterval,
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString()
  })

  const handleRefresh = () => {
    refetchDashboard()
    refetchMetrics()
  }

  const hasError = dashboardError || metricsError

  // Format currency for display
  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format numbers for display
  const formatNumber = num => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  // Calculate percent change
  const getPercentChange = (current, previous) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  const summary = dashboardData || {
    users: {},
    games: {},
    transactions: {},
    betting: {},
    transactionSummary: {}
  }

  const metrics = (metricsData && metricsData.metrics) || []

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <p className='text-muted-foreground'>Tổng quan hoạt động hệ thống VinBet</p>
        </div>

        <div className='flex flex-col sm:flex-row gap-3'>
          <DateRangePicker initialDateFrom={dateRange.from} initialDateTo={dateRange.to} onUpdate={setDateRange} />
          <Button variant='outline' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Làm mới
          </Button>
        </div>
      </div>

      {hasError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {dashboardError?.message || metricsError?.message || 'Đã xảy ra lỗi khi tải dữ liệu'}
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatsCard
          title='Tổng người dùng'
          value={formatNumber(summary.users?.total_users || 0)}
          description={`+${formatNumber(summary.users?.new_users_week || 0)} tuần này`}
          icon={<Users className='h-5 w-5 text-blue-500' />}
          trend={summary.users?.new_users_week > (summary.users?.new_users_week_previous || 0) ? 'up' : 'down'}
          trendValue={getPercentChange(summary.users?.new_users_week || 0, summary.users?.new_users_week_previous || 0)}
          isLoading={isDashboardLoading}
        />

        <StatsCard
          title='Doanh thu hệ thống'
          value={formatCurrency(summary.transactionSummary?.system_profit || 0)}
          description='Từ cược trừ thắng'
          icon={<DollarSign className='h-5 w-5 text-green-500' />}
          trend='up'
          trendValue={10.5}
          isLoading={isDashboardLoading}
        />

        <StatsCard
          title='Tổng đặt cược'
          value={formatNumber(summary.betting?.total_bets || 0)}
          description={formatCurrency(summary.betting?.total_bet_amount || 0)}
          icon={<Activity className='h-5 w-5 text-orange-500' />}
          trend={summary.betting?.total_bet_amount > (summary.betting?.previous_bet_amount || 0) ? 'up' : 'down'}
          trendValue={8.2}
          isLoading={isDashboardLoading}
        />

        <StatsCard
          title='Tỷ lệ thắng'
          value={`${(summary.betting?.win_rate || 0).toFixed(1)}%`}
          description={formatCurrency(summary.betting?.total_winnings || 0)}
          icon={<Award className='h-5 w-5 text-purple-500' />}
          trend='up'
          trendValue={2.1}
          isLoading={isDashboardLoading}
        />
      </div>

      <div className='grid grid-cols-12 gap-4'>
        <Card className='col-span-12 lg:col-span-8'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <div>
              <CardTitle>Phân tích theo thời gian</CardTitle>
              <CardDescription>Xu hướng số liệu qua các giai đoạn</CardDescription>
            </div>
            <div className='flex items-center space-x-2'>
              <Tabs value={metricsInterval} onValueChange={setMetricsInterval}>
                <TabsList>
                  <TabsTrigger value='day'>Ngày</TabsTrigger>
                  <TabsTrigger value='week'>Tuần</TabsTrigger>
                  <TabsTrigger value='month'>Tháng</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className='flex space-x-1'>
                <Button
                  variant={visibleCharts.includes('revenue') ? 'default' : 'outline'}
                  size='sm'
                  onClick={() =>
                    setVisibleCharts(prev =>
                      prev.includes('revenue') ? prev.filter(c => c !== 'revenue') : [...prev, 'revenue']
                    )
                  }
                >
                  <BarChart2 className='h-4 w-4 mr-1' />
                  Doanh thu
                </Button>
                <Button
                  variant={visibleCharts.includes('users') ? 'default' : 'outline'}
                  size='sm'
                  onClick={() =>
                    setVisibleCharts(prev =>
                      prev.includes('users') ? prev.filter(c => c !== 'users') : [...prev, 'users']
                    )
                  }
                >
                  <LineChart className='h-4 w-4 mr-1' />
                  Người dùng
                </Button>
                <Button
                  variant={visibleCharts.includes('bets') ? 'default' : 'outline'}
                  size='sm'
                  onClick={() =>
                    setVisibleCharts(prev =>
                      prev.includes('bets') ? prev.filter(c => c !== 'bets') : [...prev, 'bets']
                    )
                  }
                >
                  <PieChart className='h-4 w-4 mr-1' />
                  Cược
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-[400px]'>
              {isMetricsLoading ? (
                <Skeleton className='w-full h-full' />
              ) : (
                <MetricsCharts data={metrics} interval={metricsInterval} visibleCharts={visibleCharts} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-12 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Lượt chơi đang diễn ra</CardTitle>
            <CardDescription>Các lượt đang chạy và sắp kết thúc</CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveGamesList />
          </CardContent>
        </Card>

        <Card className='col-span-12 md:col-span-8'>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>10 giao dịch mới nhất trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>

        <Card className='col-span-12 md:col-span-4'>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng quản trị thường dùng</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
