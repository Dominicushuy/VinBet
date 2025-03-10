'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  Trophy,
  Users,
  ExternalLink,
  Timer,
  Ban,
  Calendar,
} from 'lucide-react'
import { GameRound } from '@/types/database'
import { cn } from '@/lib/utils'

interface GameCardProps {
  game: GameRound
  className?: string
}

export function GameCard({ game, className }: GameCardProps) {
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

    updateTimeAndProgress()
    const intervalId = setInterval(updateTimeAndProgress, 60000)
    return () => clearInterval(intervalId)
  }, [game.start_time, game.end_time])

  // Get status badge with appropriate styling and animation for active status
  const getStatusBadge = () => {
    switch (game.status) {
      case 'active':
        return (
          <Badge variant='default' className='bg-green-500'>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className='mr-1 h-2 w-2 rounded-full bg-white inline-block'
            />
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

  // Generate a gradient background based on game status
  const getCardBackground = () => {
    if (game.status === 'active') {
      return 'bg-gradient-to-br from-green-500/5 to-blue-500/5'
    } else if (game.status === 'scheduled') {
      return 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5'
    } else if (game.status === 'completed') {
      return 'bg-gradient-to-br from-gray-500/5 to-slate-500/5'
    } else {
      return ''
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
        'overflow-hidden h-full transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1',
        isLive ? 'border-green-500/30' : '',
        isJackpot ? 'border-amber-500/50' : '',
        getCardBackground(),
        className
      )}>
      <div className='relative'>
        {/* Card Header with Gradient Overlay */}
        <div className='relative h-40 bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden'>
          {/* Visual Elements */}
          <div className='absolute inset-0 overflow-hidden'>
            <div
              className={`absolute h-64 w-64 rounded-full ${
                isLive ? 'bg-primary/10' : 'bg-accent/5'
              } -top-20 -right-20 opacity-30`}></div>
            <div
              className={`absolute h-32 w-32 rounded-full ${
                isLive ? 'bg-green-500/10' : 'bg-blue-500/5'
              } bottom-10 left-10 opacity-20`}></div>
          </div>

          {/* Game ID */}
          <div className='absolute top-3 left-3 text-xs font-medium bg-black/20 text-white px-2 py-1 rounded-md backdrop-blur-sm'>
            #{game.id.substring(0, 8)}
          </div>

          {/* Status Badge */}
          <div className='absolute top-3 right-3 z-10'>{getStatusBadge()}</div>

          {/* Jackpot Indicator */}
          {isJackpot && (
            <div className='absolute bottom-3 left-3'>
              <Badge className='bg-amber-500 text-white animate-pulse'>
                <Trophy className='mr-1 h-3 w-3' />
                JACKPOT
              </Badge>
            </div>
          )}

          {/* Game Result (if completed) */}
          {game.status === 'completed' && game.result && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]'>
              <div className='bg-white/10 backdrop-blur-md rounded-lg p-3 text-center'>
                <div className='text-xs font-medium text-white/80 mb-1'>
                  Kết quả
                </div>
                <div className='text-3xl font-bold text-white'>
                  {game.result}
                </div>
              </div>
            </div>
          )}

          {/* Participants Count */}
          {(game.bets_count as any) > 0 && (
            <div className='absolute bottom-3 right-3 bg-black/30 text-white rounded-md px-2 py-1 text-xs flex items-center backdrop-blur-sm'>
              <Users className='mr-1 h-3 w-3' />
              {game.bets_count as any} người chơi
            </div>
          )}
        </div>

        {/* Progress Bar for Time Passed */}
        {game.status === 'active' && (
          <div className='absolute bottom-0 left-0 right-0'>
            <Progress
              value={progressPercentage}
              className='h-1 rounded-none bg-green-500/20'
              indicatorClassName='bg-gradient-to-r from-green-500 to-emerald-400'
            />
          </div>
        )}
      </div>

      <CardContent className='p-4 space-y-3'>
        {/* Time information */}
        <div className='flex items-center text-sm gap-1 text-muted-foreground'>
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
        <div className='grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
          <div>
            <p>Bắt đầu:</p>
            <p className='font-medium text-foreground'>{formattedStartTime}</p>
          </div>
          <div>
            <p>Kết thúc:</p>
            <p className='font-medium text-foreground'>{formattedEndTime}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className='p-4 pt-0 mt-auto'>
        <Link href={`/games/${game.id}`} className='w-full'>
          <Button
            variant={isLive ? 'default' : 'outline'}
            className={cn(
              'w-full transition-all duration-200',
              isJackpot ? 'bg-amber-500 hover:bg-amber-600 text-white' : '',
              game.status === 'completed'
                ? 'bg-secondary hover:bg-secondary/80'
                : ''
            )}>
            {isLive ? (
              <>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className='mr-2 h-2 w-2 rounded-full bg-white inline-block'
                />
                Tham gia ngay
              </>
            ) : game.status === 'scheduled' ? (
              <>Xem chi tiết</>
            ) : game.status === 'completed' ? (
              <>Xem kết quả</>
            ) : (
              <>Xem chi tiết</>
            )}
            <ExternalLink className='ml-2 h-3 w-3' />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
