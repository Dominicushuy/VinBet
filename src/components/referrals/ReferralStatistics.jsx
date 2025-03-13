// src/components/referrals/ReferralStatistics.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Award, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { format, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useReferralStatsQuery } from '@/hooks/queries/useReferralQueries'
import { Button } from '@/components/ui/button'

export function ReferralStatistics() {
  const { data, isLoading, error, refetch } = useReferralStatsQuery()

  const formatMoney = amount => {
    // Handle edge cases
    if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫'

    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    } catch (err) {
      console.error('Error formatting currency:', err)
      return `${amount} ₫`
    }
  }

  // Format date safely
  const formatDate = dateString => {
    try {
      const date = new Date(dateString)
      return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm', { locale: vi }) : 'Ngày không hợp lệ'
    } catch (err) {
      return 'Ngày không hợp lệ'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê giới thiệu</CardTitle>
          <CardDescription>Số liệu về giới thiệu và phần thưởng</CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center py-6'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê giới thiệu</CardTitle>
          <CardDescription>Số liệu về giới thiệu và phần thưởng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center py-6 space-y-4'>
            <AlertCircle className='h-8 w-8 text-destructive' />
            <p className='text-center text-muted-foreground'>Không thể tải thống kê. Vui lòng thử lại sau.</p>
            <Button onClick={() => refetch()} variant='outline' size='sm'>
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = data?.stats || {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    recentRewards: []
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê giới thiệu</CardTitle>
        <CardDescription>Số liệu về giới thiệu và phần thưởng</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='flex flex-col items-center p-4 bg-muted rounded-lg'>
            <Users className='h-8 w-8 text-primary mb-2' />
            <div className='text-2xl font-bold'>{stats.totalReferrals}</div>
            <div className='text-sm text-muted-foreground'>Tổng giới thiệu</div>
          </div>

          <div className='flex flex-col items-center p-4 bg-muted rounded-lg'>
            <Award className='h-8 w-8 text-primary mb-2' />
            <div className='text-2xl font-bold'>{stats.completedReferrals}</div>
            <div className='text-sm text-muted-foreground'>Đã hoàn thành</div>
          </div>

          <div className='flex flex-col items-center p-4 bg-muted rounded-lg'>
            <Clock className='h-8 w-8 text-primary mb-2' />
            <div className='text-2xl font-bold'>{stats.pendingReferrals}</div>
            <div className='text-sm text-muted-foreground'>Đang chờ</div>
          </div>

          <div className='flex flex-col items-center p-4 bg-muted rounded-lg'>
            <DollarSign className='h-8 w-8 text-primary mb-2' />
            <div className='text-2xl font-bold'>{formatMoney(stats.totalRewards)}</div>
            <div className='text-sm text-muted-foreground'>Tổng thưởng</div>
          </div>
        </div>

        {Array.isArray(stats.recentRewards) && stats.recentRewards.length > 0 && (
          <div>
            <h3 className='font-medium mb-2'>Thưởng gần đây</h3>
            <div className='space-y-2'>
              {stats.recentRewards.map((reward, index) => (
                <div
                  key={`reward-${reward.created_at || ''}-${index}`}
                  className='flex justify-between items-center p-2 border rounded-md'
                >
                  <div className='text-sm'>{formatDate(reward.created_at)}</div>
                  <div className='font-medium text-green-600'>+{formatMoney(reward.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
