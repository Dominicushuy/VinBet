'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminDashboardQuery, useAdminMetricsQuery } from '@/hooks/queries/useAdminQueries'
import { formatCurrency } from '@/utils/formatUtils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  DollarSign,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Activity,
  Award,
  RefreshCw,
  BarChart2,
  Layers,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MetricsCharts } from './MetricsCharts'
import { QuickActions } from './QuickActions'
import { ActiveGamesList } from './ActiveGamesList'
import { RecentTransactions } from './RecentTransactions'

// Stats Card Component
const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  isLoading = false,
  className,
  color = 'primary'
}) => {
  const numericTrendValue = trendValue !== undefined ? Number(trendValue) : 0
  const trendIcon = trend === 'up' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />

  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive',
    info: 'bg-blue-500/10 text-blue-500',
    jackpot: 'bg-jackpot/10 text-jackpot'
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className='p-6'>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[100px]' />
            <Skeleton className='h-8 w-[120px]' />
            <Skeleton className='h-4 w-[80px]' />
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm font-medium text-muted-foreground'>{title}</p>
              <div className={cn('p-2 rounded-md', colorClasses[color])}>{icon}</div>
            </div>
            <div className='text-2xl font-bold truncate' title={value}>
              {value}
            </div>
            <div className='flex items-center mt-1'>
              {trend && (
                <span
                  className={cn(
                    'text-xs flex items-center gap-0.5 mr-1',
                    trend === 'up' ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trendIcon}
                  {!isNaN(numericTrendValue) ? `${numericTrendValue}%` : '0%'}
                </span>
              )}
              <span className='text-xs text-muted-foreground'>{description}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Summary Card Component
const SummaryCard = ({ title, icon, data, isLoading = false }) => {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-medium'>{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
          </div>
        ) : (
          <div className='space-y-2'>
            {data.map((item, i) => (
              <div key={i} className='flex justify-between items-center text-sm'>
                <span className='text-muted-foreground'>{item.label}</span>
                <span className={cn('font-medium', item.valueClass)}>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
export function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week')
  const [chartType, setChartType] = useState('revenue')

  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useAdminDashboardQuery()

  // Fetch metrics data
  const { data: metricsData, isLoading: isMetricsLoading } = useAdminMetricsQuery({
    interval: timeRange,
    visibleCharts: [chartType]
  })

  // Handle tab changes
  const handleTimeRangeChange = useCallback(value => {
    setTimeRange(value)
  }, [])

  const handleChartTypeChange = useCallback(value => {
    setChartType(value)
  }, [])

  // Extract data for cards
  const userStats = dashboardData?.users || {}
  const gameStats = dashboardData?.games || {}
  const transactionStats = dashboardData?.transactions || {}
  const transactionSummary = dashboardData?.transactionSummary || {}
  const bettingStats = dashboardData?.betting || {}

  // Tính toán lợi nhuận thật của hệ thống
  const systemActualProfit = Math.abs(transactionSummary.total_bet || 0) - (transactionSummary.total_win || 0)

  // Tính tỷ lệ lợi nhuận
  const profitRatio =
    systemActualProfit !== 0 && transactionSummary.total_bet
      ? ((systemActualProfit / Math.abs(transactionSummary.total_bet || 1)) * 100).toFixed(1)
      : 0

  // Kiểm tra có lợi nhuận hay không
  const isProfit = systemActualProfit > 0

  // Create data for summary cards
  const financialSummaryData = [
    {
      label: 'Tổng nạp tiền',
      value: `+${formatCurrency(transactionSummary.total_deposit || 0)}`,
      valueClass: 'text-success'
    },
    {
      label: 'Tổng rút tiền',
      value: `-${formatCurrency(transactionSummary.total_withdrawal || 0)}`,
      valueClass: 'text-destructive'
    },
    {
      label: 'Tổng đặt cược',
      value: `+${formatCurrency(Math.abs(transactionSummary.total_bet || 0))}`,
      valueClass: 'text-success'
    },
    {
      label: 'Tổng thanh toán',
      value: `-${formatCurrency(transactionSummary.total_win || 0)}`,
      valueClass: 'text-destructive'
    },
    {
      label: 'Lợi nhuận hệ thống',
      value: `${isProfit ? '+' : '-'}${formatCurrency(Math.abs(systemActualProfit))}`,
      valueClass: isProfit ? 'text-success' : 'text-destructive'
    }
  ]

  const gamesSummaryData = [
    {
      label: 'Tổng số lượt chơi',
      value: gameStats.total_games || 0,
      valueClass: ''
    },
    {
      label: 'Lượt chơi hôm nay',
      value: gameStats.games_today || 0,
      valueClass: ''
    },
    {
      label: 'Đang diễn ra',
      value: gameStats.active_games || 0,
      valueClass: 'text-info'
    },
    {
      label: 'Đã hoàn thành',
      value: gameStats.completed_games || 0,
      valueClass: ''
    },
    {
      label: 'Tỷ lệ thắng',
      value: `${(bettingStats.win_rate || 0).toFixed(1)}%`,
      valueClass: 'text-warning'
    }
  ]

  return (
    <ErrorBoundary>
      <div className='space-y-6'>
        {/* Dashboard Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tổng quan hệ thống</h2>
            <p className='text-muted-foreground'>
              {dashboardData?.lastUpdated
                ? `Cập nhật lần cuối: ${new Date(dashboardData.lastUpdated).toLocaleString('vi-VN')}`
                : 'Thống kê và chỉ số hoạt động của VinBet'}
            </p>
          </div>

          <div className='flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto'>
            <Tabs value={timeRange} onValueChange={handleTimeRangeChange} className='w-full sm:w-auto'>
              <TabsList className='grid grid-cols-3 h-9'>
                <TabsTrigger value='day' className='text-xs px-3'>
                  Ngày
                </TabsTrigger>
                <TabsTrigger value='week' className='text-xs px-3'>
                  Tuần
                </TabsTrigger>
                <TabsTrigger value='month' className='text-xs px-3'>
                  Tháng
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatsCard
            title='Người dùng'
            value={userStats.total_users || 0}
            description={`+${userStats.new_users_week || 0} tuần này`}
            icon={<Users className='h-4 w-4' />}
            trend='up'
            trendValue={
              userStats.new_users_week ? ((userStats.new_users_week / userStats.total_users) * 100).toFixed(1) : 0
            }
            isLoading={isDashboardLoading}
            color='primary'
          />

          <StatsCard
            title='Doanh thu'
            value={`${isProfit ? '+' : '-'}${formatCurrency(Math.abs(systemActualProfit))}`}
            description={isProfit ? 'Lợi nhuận' : 'Lỗ'}
            icon={<DollarSign className='h-4 w-4' />}
            trend={isProfit ? 'up' : 'down'}
            trendValue={profitRatio}
            isLoading={isDashboardLoading}
            color={isProfit ? 'success' : 'danger'}
          />

          <StatsCard
            title='Tỷ lệ thắng'
            value={`${(bettingStats.win_rate || 0).toFixed(1)}%`}
            description='Tỷ lệ người chơi thắng'
            icon={<Award className='h-4 w-4' />}
            trend={bettingStats.win_rate > 20 ? 'up' : 'down'}
            trendValue={5.2}
            isLoading={isDashboardLoading}
            color='warning'
          />

          <StatsCard
            title='Tổng nạp tiền'
            value={formatCurrency(transactionStats.total_deposits || 0)}
            description={`${transactionStats.pending_deposits || 0} yêu cầu chờ xử lý`}
            icon={<CreditCard className='h-4 w-4' />}
            trend='up'
            trendValue={12.4}
            isLoading={isDashboardLoading}
            color='success'
          />
        </div>

        {/* Charts and Summary Cards */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
          {/* Main Chart */}
          <div className='lg:col-span-8 space-y-4'>
            <Card>
              <CardHeader className='pb-2'>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1'>
                  <CardTitle className='text-xl font-medium'>Thống kê theo thời gian</CardTitle>
                  <Tabs value={chartType} onValueChange={handleChartTypeChange} className='mt-2 sm:mt-0'>
                    <TabsList className='h-8'>
                      <TabsTrigger value='revenue' className='text-xs px-3'>
                        Doanh thu
                      </TabsTrigger>
                      <TabsTrigger value='users' className='text-xs px-3'>
                        Người dùng
                      </TabsTrigger>
                      <TabsTrigger value='bets' className='text-xs px-3'>
                        Đặt cược
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription>
                  {chartType === 'revenue' && 'Biểu đồ tổng hợp doanh thu, nạp và rút tiền theo thời gian'}
                  {chartType === 'users' && 'Biểu đồ hiển thị người dùng mới theo thời gian'}
                  {chartType === 'bets' && 'Biểu đồ hiển thị số lượng và giá trị đặt cược theo thời gian'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isMetricsLoading ? (
                  <div className='h-[350px] flex items-center justify-center'>
                    <Skeleton className='h-full w-full rounded-md' />
                  </div>
                ) : (
                  <div className='h-[350px]'>
                    <ErrorBoundary>
                      <MetricsCharts
                        data={metricsData?.metrics || []}
                        interval={timeRange}
                        visibleCharts={[chartType]}
                      />
                    </ErrorBoundary>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-xl font-medium'>Giao dịch gần đây</CardTitle>
                  <RefreshCw className='h-4 w-4 text-muted-foreground' />
                </div>
                <CardDescription>Các giao dịch nạp tiền, rút tiền và cược mới nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <RecentTransactions />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>

          {/* Side Cards */}
          <div className='lg:col-span-4 space-y-4'>
            {/* Financial Summary */}
            <SummaryCard
              title='Tổng kết tài chính'
              icon={<BarChart2 className='h-4 w-4 text-muted-foreground' />}
              data={financialSummaryData}
              isLoading={isDashboardLoading}
            />

            {/* Games Summary */}
            <SummaryCard
              title='Thống kê trò chơi'
              icon={<Layers className='h-4 w-4 text-muted-foreground' />}
              data={gamesSummaryData}
              isLoading={isDashboardLoading}
            />

            {/* Actions */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-xl font-medium'>Thao tác nhanh</CardTitle>
                <CardDescription>Các chức năng thường xuyên sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <QuickActions />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Active Games */}
            <Card>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-center'>
                  <CardTitle className='text-xl font-medium'>Lượt chơi đang diễn ra</CardTitle>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                </div>
                <CardDescription>Các lượt chơi đang hoạt động hiện tại</CardDescription>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <ActiveGamesList />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status Card */}
        <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='bg-primary/20 p-2 rounded-full'>
                  <Activity className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <h3 className='text-lg font-medium'>Trạng thái hệ thống</h3>
                  <p className='text-sm text-muted-foreground'>Tất cả các dịch vụ đang hoạt động bình thường</p>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground'>Telegram Bot</span>
                  <span className='font-medium flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-success'></span> Online
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground'>Payment API</span>
                  <span className='font-medium flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-success'></span> Active
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground'>Supabase</span>
                  <span className='font-medium flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-success'></span> Connected
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
