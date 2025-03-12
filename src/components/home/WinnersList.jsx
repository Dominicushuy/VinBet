// src/components/home/WinnersList.jsx
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentWinnersQuery } from '@/hooks/queries/useHomeQueries'

export function WinnersList({ initialWinners }) {
  const [hasInitialData] = useState(!!initialWinners && initialWinners.length > 0)

  // Use custom hook instead of direct API call
  const { data: fetchedWinners, isLoading } = useRecentWinnersQuery(initialWinners)

  // Sử dụng initialWinners nếu có, nếu không thì sử dụng fetchedWinners
  const winners = hasInitialData ? initialWinners : fetchedWinners

  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatTimeAgo = dateString => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return diffInSeconds <= 5 ? 'Vừa xong' : `${diffInSeconds} giây trước`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      if (days < 7) {
        return `${days} ngày trước`
      } else if (days < 30) {
        return `${Math.floor(days / 7)} tuần trước`
      } else {
        return new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(date)
      }
    }
  }

  // Loading skeleton khi không có initialWinners và đang fetch
  if (!hasInitialData && isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardContent className='p-4'>
              <div className='flex items-center space-x-4'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='text-right'>
                  <Skeleton className='h-5 w-20 ml-auto' />
                  <Skeleton className='h-4 w-16 ml-auto mt-2' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Nếu không có winners nào
  if (!winners || winners.length === 0) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <p className='text-muted-foreground'>Chưa có người thắng cuộc nào. Hãy là người đầu tiên!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {winners.map(winner => (
        <Card key={winner.id} className='transition-all hover:shadow-md'>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-4'>
              <Avatar>
                <AvatarImage src={winner.profiles.avatar_url || ''} alt={winner.profiles.username} />
                <AvatarFallback>
                  {(winner.profiles.display_name || winner.profiles.username).substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <p className='font-medium'>{winner.profiles.display_name || winner.profiles.username}</p>
                <p className='text-sm text-muted-foreground'>Lượt chơi #{winner.game_rounds.id.substring(0, 8)}</p>
              </div>

              <div className='text-right'>
                <p className='font-bold text-green-600'>{formatCurrency(winner.potential_win)}</p>
                <p className='text-xs text-muted-foreground'>{formatTimeAgo(winner.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
