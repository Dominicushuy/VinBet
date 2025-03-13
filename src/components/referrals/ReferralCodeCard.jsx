// src/components/referrals/ReferralCodeCard.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Copy, RefreshCw, Link2, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useReferralCodeQuery } from '@/hooks/queries/useReferralQueries'

export function ReferralCodeCard() {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const copyTimeoutRef = useRef(null)
  const { data, isLoading, error, refetch, isFetching } = useReferralCodeQuery()

  // Cleanup timeouts when unmounting
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const copyToClipboard = async (text, isCode = true) => {
    // Check if Clipboard API is supported
    if (!navigator.clipboard) {
      toast.error('Trình duyệt của bạn không hỗ trợ sao chép')
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      if (isCode) {
        setCopiedCode(true)
        toast.success('Đã sao chép mã giới thiệu!')
      } else {
        setCopiedLink(true)
        toast.success('Đã sao chép liên kết giới thiệu!')
      }

      // Clear previous timeout if exists
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      // Set new timeout
      copyTimeoutRef.current = setTimeout(() => {
        if (isCode) setCopiedCode(false)
        else setCopiedLink(false)
        copyTimeoutRef.current = null
      }, 2000)
    } catch (err) {
      toast.error(isCode ? 'Không thể sao chép mã giới thiệu' : 'Không thể sao chép liên kết')
    }
  }

  const refreshReferralCode = async () => {
    try {
      await refetch()
      toast.success('Đã làm mới mã giới thiệu')
    } catch (err) {
      toast.error('Không thể làm mới mã giới thiệu')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mã giới thiệu của bạn</CardTitle>
          <CardDescription>Chia sẻ mã này để nhận thưởng</CardDescription>
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
          <CardTitle>Mã giới thiệu của bạn</CardTitle>
          <CardDescription>Chia sẻ mã này để nhận thưởng</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-center text-sm text-destructive'>
            {error instanceof Error ? error.message : 'Không thể tải mã giới thiệu'}
          </p>
          <Button onClick={refreshReferralCode} variant='outline' className='mt-4 w-full'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mã giới thiệu của bạn</CardTitle>
        <CardDescription>Chia sẻ mã này để nhận thưởng khi bạn bè đăng ký và nạp tiền</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <div className='grid flex-1 gap-2'>
            <div className='font-semibold'>Mã giới thiệu</div>
            <div className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'>
              <span className='flex-1 leading-loose'>{data?.referralCode || 'N/A'}</span>
            </div>
          </div>
          <Button
            size='icon'
            onClick={() => copyToClipboard(data?.referralCode || '', true)}
            variant='outline'
            className='shrink-0'
            disabled={!data?.referralCode || isFetching}
          >
            {isFetching ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : copiedCode ? (
              <Check className='h-4 w-4' />
            ) : (
              <Copy className='h-4 w-4' />
            )}
          </Button>
        </div>

        <div className='flex items-center space-x-2'>
          <div className='grid flex-1 gap-2'>
            <div className='font-semibold'>Liên kết giới thiệu</div>
            <div className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm truncate'>
              <span className='flex-1 leading-loose overflow-hidden text-ellipsis'>{data?.shareUrl || 'N/A'}</span>
            </div>
          </div>
          <Button
            size='icon'
            onClick={() => copyToClipboard(data?.shareUrl || '', false)}
            variant='outline'
            className='shrink-0'
            disabled={!data?.shareUrl || isFetching}
          >
            {isFetching ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : copiedLink ? (
              <Check className='h-4 w-4' />
            ) : (
              <Link2 className='h-4 w-4' />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
