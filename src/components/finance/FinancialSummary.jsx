// src/components/finance/FinancialSummary.jsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, RefreshCcw } from 'lucide-react'
import { useTransactionSummaryQuery } from '@/hooks/queries/useTransactionQueries'
import { Skeleton } from '@/components/ui/skeleton'
import { format, subDays } from 'date-fns'

export function FinancialSummary({ summaryData, balance }) {
  const [mounted, setMounted] = useState(false)

  // Get last 30 days data
  const thirty_days_ago = format(subDays(new Date(), 30), 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')

  // Fetch summary data using React Query
  const { data, isLoading } = useTransactionSummaryQuery({
    startDate: thirty_days_ago,
    endDate: today
  })

  // Format money
  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Use the initialized data or fetched data
  const summary = (data && data.summary) ||
    summaryData || {
      total_deposit: 0,
      total_withdrawal: 0,
      total_bet: 0,
      total_win: 0,
      total_referral_reward: 0,
      net_balance: 0
    }

  // Set mounted after client-side execution
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-32 w-full' />
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      {/* Balance Card */}
      <Card className='bg-primary/5 border-primary/20'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-muted-foreground'>Số dư hiện tại</h3>
            <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center'>
              <RefreshCcw className='h-4 w-4 text-primary' />
            </div>
          </div>
          <div className='text-2xl font-bold text-foreground'>{formatMoney(balance)}</div>
          <div className='mt-2 text-xs text-muted-foreground'>Cập nhật theo thời gian thực</div>
        </CardContent>
      </Card>

      {/* Deposits Card */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-muted-foreground'>Tổng nạp tiền</h3>
            <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center'>
              <ArrowUp className='h-4 w-4 text-green-600' />
            </div>
          </div>
          <div className='text-2xl font-bold text-green-600'>
            {isLoading ? <Skeleton className='h-7 w-24' /> : formatMoney(summary.total_deposit)}
          </div>
          <div className='mt-2 text-xs text-muted-foreground'>30 ngày qua</div>
        </CardContent>
      </Card>

      {/* Withdrawals Card */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-muted-foreground'>Tổng rút tiền</h3>
            <div className='w-8 h-8 rounded-full bg-red-100 flex items-center justify-center'>
              <ArrowDown className='h-4 w-4 text-red-600' />
            </div>
          </div>
          <div className='text-2xl font-bold text-red-600'>
            {isLoading ? <Skeleton className='h-7 w-24' /> : formatMoney(summary.total_withdrawal)}
          </div>
          <div className='mt-2 text-xs text-muted-foreground'>30 ngày qua</div>
        </CardContent>
      </Card>

      {/* Profit/Loss Card */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-muted-foreground'>Lời/Lỗ cá cược</h3>
            <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
              {summary.total_win - summary.total_bet >= 0 ? (
                <TrendingUp className='h-4 w-4 text-blue-600' />
              ) : (
                <TrendingDown className='h-4 w-4 text-blue-600' />
              )}
            </div>
          </div>
          <div
            className={`text-2xl font-bold ${
              summary.total_win - summary.total_bet >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isLoading ? <Skeleton className='h-7 w-24' /> : formatMoney(summary.total_win - summary.total_bet)}
          </div>
          <div className='mt-2 text-xs text-muted-foreground'>30 ngày qua</div>
        </CardContent>
      </Card>
    </div>
  )
}
