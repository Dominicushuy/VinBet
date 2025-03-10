'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Trophy,
  Users,
  ExternalLink,
  Calendar,
  Timer,
  Ban,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { GameRound } from '@/types/database'
import { cn } from '@/lib/utils'

interface GameListItemProps {
  game: GameRound
  className?: string
}

export function GameListItem({ game, className }: GameListItemProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [progressPercentage, setProgressPercentage] = useState<number>(0)
  const [isLive, setIsLive] = useState<boolean>(false)

  // Format dates for display
  const formattedStartTime = format(
    new Date(game.start_time),
    'HH:mm, dd/MM/yyyy',
    { locale: vi }
  )

  const formattedEndTime = format(
    new Date(game.end_time),
    'HH:mm, dd/MM/yyyy',
    { locale: vi }
  )

  // Update time remaining and progress
  useEffect(() => {
    const updateTimeAndProgress = () => {
      const now = new Date()
      const startTime = new Date(game.start_time)
      const endTime = new Date(game.end_time)
      const totalDuration = endTime.getTime() - startTime.getTime()

      if (now >= startTime && now < endTime) {
        // Game is active
        setIsLive(true)
        const elapsed = now.getTime() - startTime.getTime()
        const progress = Math.min((elapsed / totalDuration) * 100, 100)
        setProgressPercentage(progress)

        setTimeLeft(
          `Kết thúc trong ${formatDistanceToNow(endTime, {
            locale: vi,
            addSuffix: false,
          })}`
        )
      } else if (now < startTime) {
        // Game is upcoming
        setIsLive(false)
        setProgressPercentage(0)

        setTimeLeft(
          `Bắt đầu trong ${formatDistanceToNow(startTime, {
            locale: vi,
            addSuffix: false,
          })}`
        )
      } else {
        // Game is completed or cancelled
        setIsLive(false)
        setProgressPercentage(100)

        setTimeLeft('Đã kết thúc')
      }
    }

    // Update immediately and then set interval
    updateTimeAndProgress()
    const intervalId = setInterval(updateTimeAndProgress, 60000)

    return () => clearInterval(intervalId)
  }, [game.start_time, game.end_time])

  // Get status badge with appropriate styling
  const getStatusBadge = () => {
    switch (game.status) {
      case 'active':
        return (
          <Badge variant='default' className='bg-green-500'>
            <span className='mr-1 h-2 w-2 rounded-full bg-white inline-block animate-pulse'></span>
            Đang diễn ra
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant='outline' className='border-blue-500 text-blue-500'>
            <Calendar className='mr-1 h-3 w-3' />
            Sắp diễn ra
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant='secondary'>
            <Trophy className='mr-1 h-3 w-3' />
            Đã kết thúc
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='destructive'>
            <Ban className='mr-1 h-3 w-3' />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant='outline'>{game.status}</Badge>
    }
  }

  // Check if game is jackpot (for special styling)
  const isJackpot = Boolean(
    game.is_jackpot ||
      new Date(game.end_time).getTime() - new Date(game.start_time).getTime() >
        24 * 60 * 60 * 1000
  )

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-md',
        isLive ? 'border-green-500/30' : '',
        isJackpot ? 'border-amber-500/50' : '',
        className
      )}>
      <CardContent className='p-0'>
        <div className='relative w-full'>
          {isLive && (
            <Progress
              value={progressPercentage}
              className='h-1 rounded-none absolute top-0 left-0 right-0 z-10 bg-green-500/20'
              indicatorClassName='bg-gradient-to-r from-green-500 to-emerald-400'
            />
          )}

          <div className='p-4 flex flex-col sm:flex-row gap-4'>
            {/* Game visual indicator */}
            <div
              className={cn(
                'w-16 h-16 rounded-md flex items-center justify-center text-lg font-bold shrink-0',
                game.status === 'active'
                  ? 'bg-gradient-to-br from-green-500/10 to-blue-500/10 text-green-600'
                  : game.status === 'scheduled'
                  ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600'
                  : 'bg-gradient-to-br from-gray-500/10 to-slate-500/10 text-gray-600',
                'border border-muted'
              )}>
              {game.status === 'completed' && game.result ? (
                <span className='text-2xl'>{game.result}</span>
              ) : (
                <span>#{game.id.substring(0, 2)}</span>
              )}

              {/* Jackpot indicator */}
              {isJackpot && (
                <div className='absolute -top-2 -left-2'>
                  <Badge className='bg-amber-500 text-white px-1'>
                    <Trophy className='h-3 w-3' />
                  </Badge>
                </div>
              )}
            </div>

            {/* Game info */}
            <div className='flex-1 flex flex-col justify-center min-w-0'>
              {/* Game ID and status */}
              <div className='flex items-center justify-between mb-1'>
                <div className='text-sm font-medium'>
                  Lượt chơi #{game.id.substring(0, 8)}
                </div>
                {getStatusBadge()}
              </div>

              {/* Time information */}
              <div className='flex items-center text-sm gap-1 text-muted-foreground mb-1'>
                {isLive ? (
                  <Clock className='h-4 w-4 text-green-500' />
                ) : game.status === 'scheduled' ? (
                  <Timer className='h-4 w-4 text-blue-500' />
                ) : (
                  <Clock className='h-4 w-4' />
                )}
                <span
                  className={cn(
                    'font-medium',
                    isLive ? 'text-green-600 dark:text-green-400' : ''
                  )}>
                  {timeLeft}
                </span>
              </div>

              {/* Time details */}
              <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  <span>Bắt đầu: {formattedStartTime}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  <span>Kết thúc: {formattedEndTime}</span>
                </div>
                {(game.bets_count as any) > 0 && (
                  <div className='flex items-center gap-1'>
                    <Users className='h-3 w-3' />
                    <span>{game.bets_count as any} người chơi</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className='flex items-center'>
              <Link href={`/games/${game.id}`}>
                <Button
                  variant={isLive ? 'default' : 'outline'}
                  className={cn(
                    'whitespace-nowrap',
                    isJackpot
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : '',
                    game.status === 'completed'
                      ? 'bg-secondary hover:bg-secondary/80'
                      : ''
                  )}>
                  {isLive ? (
                    <>
                      Tham gia
                      <span className='ml-2 h-2 w-2 rounded-full bg-white inline-block animate-pulse'></span>
                    </>
                  ) : game.status === 'scheduled' ? (
                    <>Chi tiết</>
                  ) : game.status === 'completed' ? (
                    <>Kết quả</>
                  ) : (
                    <>Chi tiết</>
                  )}
                  <ExternalLink className='ml-2 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
