// src/components/referrals/ReferralStatistics.jsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Award, Clock, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useReferralStatsQuery } from '@/hooks/queries/useReferralQueries'

export function ReferralStatistics() {
  const { data, isLoading } = useReferralStatsQuery()

  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
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
        <div className='grid grid-cols-2 gap-4'>
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

        {stats.recentRewards.length > 0 && (
          <div>
            <h3 className='font-medium mb-2'>Thưởng gần đây</h3>
            <div className='space-y-2'>
              {stats.recentRewards.map((reward, index) => (
                <div key={index} className='flex justify-between items-center p-2 border rounded-md'>
                  <div className='text-sm'>
                    {format(new Date(reward.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: vi
                    })}
                  </div>
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
