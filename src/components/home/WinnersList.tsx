// src/components/home/WinnersList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Winner {
  id: string
  username: string
  avatar: string
  game: string
  amount: number
  date: string
}

export function WinnersList() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    setLoading(true)
    setTimeout(() => {
      const mockWinners: Winner[] = [
        {
          id: '1',
          username: 'hung_player',
          avatar: '/images/avatar-1.webp',
          game: 'Lượt chơi #10254',
          amount: 12500000,
          date: '2023-10-15T10:30:00Z',
        },
        {
          id: '2',
          username: 'thanhnn',
          avatar: '/images/avatar-2.webp',
          game: 'Lượt chơi #10248',
          amount: 8750000,
          date: '2023-10-15T08:15:00Z',
        },
        {
          id: '3',
          username: 'minh_vu',
          avatar: '/images/avatar-3.webp',
          game: 'Lượt chơi #10245',
          amount: 150000000,
          date: '2023-10-14T22:45:00Z',
        },
        {
          id: '4',
          username: 'linh_nguyen',
          avatar: '/images/avatar-4.webp',
          game: 'Lượt chơi #10242',
          amount: 5250000,
          date: '2023-10-14T19:20:00Z',
        },
        {
          id: '5',
          username: 'tuan_tran',
          avatar: '/images/avatar-5.webp',
          game: 'Lượt chơi #10237',
          amount: 14750000,
          date: '2023-10-14T15:10:00Z',
        },
      ]

      setWinners(mockWinners)
      setLoading(false)
    }, 1500)
  }, [])

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

  if (loading) {
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

  return (
    <div className='space-y-4'>
      {winners.map((winner) => (
        <Card key={winner.id} className='transition-all hover:shadow-md'>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-4'>
              <Avatar>
                <AvatarImage src={winner.avatar} alt={winner.username} />
                <AvatarFallback>
                  {winner.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <p className='font-medium'>{winner.username}</p>
                <p className='text-sm text-muted-foreground'>{winner.game}</p>
              </div>

              <div className='text-right'>
                <p className='font-bold text-green-600'>
                  {formatCurrency(winner.amount)}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {formatTimeAgo(winner.date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
