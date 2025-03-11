'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpIcon, Users, Activity, BadgeDollarSign, Wallet, Gamepad2, BarChart3 } from 'lucide-react'

export function AdminStats({ summary, isLoading }) {
  // Format tiền Việt Nam
  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format số lượng người dùng
  const formatNumber = num => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                <Skeleton className='h-4 w-[150px]' />
              </CardTitle>
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-[120px]' />
              <Skeleton className='mt-2 h-4 w-[80px]' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Lấy dữ liệu từ summary
  const users = summary?.users || {}
  const games = summary?.games || {}
  const transactions = summary?.transactions || {}
  const betting = summary?.betting || {}
  const txSummary = summary?.transactionSummary || {}

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {/* Total Users */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tổng người dùng</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatNumber(users.total_users || 0)}</div>
          <p className='text-xs text-muted-foreground'>
            <span className='text-green-500 flex items-center'>
              +{formatNumber(users.new_users_week || 0)}
              <ArrowUpIcon className='h-4 w-4 ml-1' />
            </span>
            trong 7 ngày qua
          </p>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Người dùng hoạt động</CardTitle>
          <Activity className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatNumber(users.active_users || 0)}</div>
          <p className='text-xs text-muted-foreground'>
            {users.active_users && users.total_users ? Math.round((users.active_users / users.total_users) * 100) : 0}%
            tổng người dùng
          </p>
        </CardContent>
      </Card>

      {/* System Revenue */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Doanh thu</CardTitle>
          <BadgeDollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatCurrency(txSummary.system_profit || 0)}</div>
          <p className='text-xs text-muted-foreground'>Tính trên bets - winnings</p>
        </CardContent>
      </Card>

      {/* Total Deposits */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tổng nạp tiền</CardTitle>
          <Wallet className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatCurrency(transactions.total_deposits || 0)}</div>
          <p className='text-xs text-muted-foreground'>{formatCurrency(transactions.deposits_today || 0)} hôm nay</p>
        </CardContent>
      </Card>

      {/* Total Bets */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tổng đặt cược</CardTitle>
          <Gamepad2 className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatNumber(betting.total_bets || 0)}</div>
          <p className='text-xs text-muted-foreground'>{formatCurrency(betting.total_bet_amount || 0)} giá trị</p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tỉ lệ thắng</CardTitle>
          <BarChart3 className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{Number(betting.win_rate || 0).toFixed(1)}%</div>
          <p className='text-xs text-muted-foreground'>{formatCurrency(betting.total_winnings || 0)} tiền thưởng</p>
        </CardContent>
      </Card>
    </div>
  )
}
