// src/components/home/WinnersList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'

interface Winner {
  id: string
  profiles: {
    username: string
    display_name?: string
    avatar_url?: string
  }
  game_rounds: {
    id: string
  }
  amount: number
  potential_win: number
  created_at: string
}

export function WinnersList({ initialWinners }: { initialWinners?: any[] }) {
  const [hasInitialData] = useState(
    !!initialWinners && initialWinners.length > 0
  )

  // Sử dụng React Query để lấy dữ liệu nếu không có initialWinners
  const { data: fetchedWinners, isLoading } = useQuery({
    queryKey: ['winners', 'recent'],
    queryFn: async () => {
      if (hasInitialData) return []

      try {
        const response = await apiService.games.getRecentWinners()
        return response.winners
      } catch (error) {
        console.error('Error fetching winners:', error)
        return []
      }
    },
    enabled: !hasInitialData,
    refetchInterval: 300000, // Refetch mỗi 5 phút
  })

  // Sử dụng initialWinners nếu có, nếu không thì sử dụng fetchedWinners
  const winners = hasInitialData ? initialWinners : fetchedWinners

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} ngày trước`
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
          <p className='text-muted-foreground'>
            Chưa có người thắng cuộc nào. Hãy là người đầu tiên!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {winners.map((winner: Winner) => (
        <Card key={winner.id} className='transition-all hover:shadow-md'>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-4'>
              <Avatar>
                <AvatarImage
                  src={winner.profiles.avatar_url || ''}
                  alt={winner.profiles.username}
                />
                <AvatarFallback>
                  {(winner.profiles.display_name || winner.profiles.username)
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <p className='font-medium'>
                  {winner.profiles.display_name || winner.profiles.username}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Lượt chơi #{winner.game_rounds.id.substring(0, 8)}
                </p>
              </div>

              <div className='text-right'>
                <p className='font-bold text-green-600'>
                  {formatCurrency(winner.potential_win)}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {formatTimeAgo(winner.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
