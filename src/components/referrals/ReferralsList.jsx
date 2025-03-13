// src/components/referrals/ReferralsList.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { formatDistanceToNow, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useReferralsListQuery } from '@/hooks/queries/useReferralQueries'
import { AlertCircle, Loader2 } from 'lucide-react'

export function ReferralsList() {
  const [status, setStatus] = useState(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [isChangingPage, setIsChangingPage] = useState(false)

  const { data, isLoading, error, refetch, isFetching } = useReferralsListQuery({
    status,
    page,
    pageSize
  })

  // Reset loading state when data changes
  useEffect(() => {
    if (!isFetching) {
      setIsChangingPage(false)
    }
  }, [isFetching])

  const formatMoney = amount => {
    if (amount === null || amount === undefined || isNaN(amount)) return '-'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Format date safely with fallback
  const formatDate = dateString => {
    try {
      const date = new Date(dateString)
      if (!isValid(date)) return 'Ngày không hợp lệ'

      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: vi
      })
    } catch (err) {
      return 'Ngày không hợp lệ'
    }
  }

  const getInitial = user => {
    if (!user) return '?'
    const name = user.display_name || user.username || '?'
    return name[0].toUpperCase()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giới thiệu</CardTitle>
          <CardDescription>Những người bạn đã giới thiệu</CardDescription>
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
          <CardTitle>Danh sách giới thiệu</CardTitle>
          <CardDescription>Những người bạn đã giới thiệu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center py-6 space-y-4'>
            <AlertCircle className='h-8 w-8 text-destructive' />
            <p className='text-center text-muted-foreground'>
              Không thể tải danh sách giới thiệu. Vui lòng thử lại sau.
            </p>
            <Button onClick={() => refetch()} variant='outline' size='sm'>
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const referrals = data?.referrals || []
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 0
  }

  const getStatusBadge = status => {
    switch (status) {
      case 'pending':
        return <Badge variant='outline'>Đang chờ</Badge>
      case 'completed':
        return (
          <Badge variant='default' className='bg-green-500'>
            Hoàn thành
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status || 'Không xác định'}</Badge>
    }
  }

  const handlePageChange = newPage => {
    setIsChangingPage(true)
    setPage(newPage)
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
          <div>
            <CardTitle>Danh sách giới thiệu</CardTitle>
            <CardDescription>Những người bạn đã giới thiệu</CardDescription>
          </div>
          <div className='w-full sm:w-32'>
            <Select
              value={status || 'all'}
              onValueChange={value => {
                setStatus(value === 'all' ? undefined : value)
                setPage(1)
              }}
              disabled={isFetching}
            >
              <SelectTrigger>
                <SelectValue placeholder='Tất cả' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả</SelectItem>
                <SelectItem value='pending'>Đang chờ</SelectItem>
                <SelectItem value='completed'>Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isFetching && isChangingPage ? (
          <div className='flex justify-center py-6'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : referrals.length === 0 ? (
          <div className='text-center py-6 text-muted-foreground'>Bạn chưa giới thiệu ai.</div>
        ) : (
          <div className='space-y-4'>
            {referrals.map(referral => (
              <div
                key={referral.id}
                className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4'
              >
                <div className='flex items-center space-x-4'>
                  <Avatar>
                    <AvatarImage src={referral.referred?.avatar_url || ''} alt='Avatar' />
                    <AvatarFallback>{getInitial(referral.referred)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='font-medium'>
                      {referral.referred?.display_name || referral.referred?.username || 'Người dùng'}
                    </div>
                    <div className='text-sm text-muted-foreground'>Đăng ký {formatDate(referral.created_at)}</div>
                  </div>
                </div>
                <div className='flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start'>
                  <div className='mb-0 sm:mb-1'>{getStatusBadge(referral.status)}</div>
                  <div className='text-sm'>
                    {referral.status === 'completed' ? (
                      <span className='text-green-600'>+{formatMoney(referral.reward_amount)}</span>
                    ) : (
                      <span className='text-muted-foreground'>Chưa hoàn thành</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pagination.totalPages > 1 && (
              <div className='flex justify-center mt-4'>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  disabled={isFetching}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
