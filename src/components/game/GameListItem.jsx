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
  Flame,
  ChevronRight,
  Star,
  CircleDollarSign,
  Award
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function GameListItem({ game, className }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const [timeState, setTimeState] = useState('') // 'urgent', 'soon', 'normal'

  // Format dates for display
  const formattedStartTime = format(new Date(game.start_time), 'HH:mm, dd/MM/yyyy', { locale: vi })
  const formattedEndTime = format(new Date(game.end_time), 'HH:mm, dd/MM/yyyy', { locale: vi })

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

        const timeToEnd = endTime.getTime() - now.getTime()
        // Set urgent flag if less than 30 minutes left
        if (timeToEnd < 30 * 60 * 1000) {
          setTimeState('urgent')
        } else if (timeToEnd < 60 * 60 * 1000) {
          setTimeState('soon')
        } else {
          setTimeState('normal')
        }

        setTimeLeft(
          `Kết thúc trong ${formatDistanceToNow(endTime, {
            locale: vi,
            addSuffix: false
          })}`
        )
      } else if (now < startTime) {
        // Game is upcoming
        setIsLive(false)
        setProgressPercentage(0)

        const timeToStart = startTime.getTime() - now.getTime()
        // Set soon flag if less than 30 minutes to start
        if (timeToStart < 30 * 60 * 1000) {
          setTimeState('soon')
        } else {
          setTimeState('normal')
        }

        setTimeLeft(
          `Bắt đầu trong ${formatDistanceToNow(startTime, {
            locale: vi,
            addSuffix: false
          })}`
        )
      } else {
        // Game is completed or cancelled
        setIsLive(false)
        setProgressPercentage(100)
        setTimeState('normal')
        setTimeLeft('Đã kết thúc')
      }
    }

    // Update ngay lập tức và sau đó thiết lập interval
    updateTimeAndProgress()
    const intervalId = setInterval(updateTimeAndProgress, 15000) // Update more frequently

    return () => clearInterval(intervalId)
  }, [game.start_time, game.end_time])

  // Get status badge with appropriate styling
  const getStatusBadge = () => {
    switch (game.status) {
      case 'active':
        return (
          <Badge variant='default' className='bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'>
            <span className='mr-1.5 h-2 w-2 rounded-full bg-white inline-block animate-pulse'></span>
            Đang diễn ra
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge
            variant='outline'
            className='border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 shadow-sm'
          >
            <Calendar className='mr-1.5 h-3 w-3' />
            Sắp diễn ra
          </Badge>
        )
      case 'completed':
        return (
          <Badge
            variant='secondary'
            className='bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm'
          >
            <Trophy className='mr-1.5 h-3 w-3' />
            Đã kết thúc
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='destructive' className='bg-red-500 text-white shadow-sm'>
            <Ban className='mr-1.5 h-3 w-3' />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant='outline'>{game.status}</Badge>
    }
  }

  // Kiểm tra nếu game là jackpot (để áp dụng style đặc biệt)
  const isJackpot = Boolean(
    game.is_jackpot || new Date(game.end_time).getTime() - new Date(game.start_time).getTime() > 24 * 60 * 60 * 1000
  )

  // Get pulse animation based on time state
  const getPulseAnimation = () => {
    if (timeState === 'urgent') {
      return 'animate-pulse'
    }
    return ''
  }

  // Get text color based on time state
  const getTimeTextColor = () => {
    if (timeState === 'urgent') {
      return 'text-red-600 dark:text-red-400 font-medium'
    }
    if (timeState === 'soon') {
      return 'text-amber-600 dark:text-amber-400 font-medium'
    }
    if (isLive) {
      return 'text-green-600 dark:text-green-400 font-medium'
    }
    return 'text-muted-foreground'
  }

  // Get progress bar color
  const getProgressColor = () => {
    if (progressPercentage > 80) {
      return 'bg-gradient-to-r from-amber-500 to-red-500'
    }
    if (progressPercentage > 50) {
      return 'bg-gradient-to-r from-blue-500 to-indigo-500'
    }
    return 'bg-gradient-to-r from-green-500 to-emerald-400'
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-lg group',
        isLive
          ? 'border-green-500/30 hover:border-green-500/50 shadow-sm shadow-green-500/5'
          : 'hover:border-primary/50',
        isJackpot
          ? 'border-amber-500/50 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/50 dark:to-transparent shadow-sm shadow-amber-500/10'
          : '',
        timeState === 'urgent' && isLive ? 'shadow-sm shadow-red-500/10' : '',
        className
      )}
    >
      <CardContent className='p-0'>
        <div className='relative w-full'>
          {isLive && (
            <Progress
              value={progressPercentage}
              className='h-1.5 rounded-none absolute top-0 left-0 right-0 z-10 bg-gray-100 dark:bg-gray-800'
              indicatorClassName={getProgressColor()}
            />
          )}

          <div className='p-4 md:p-5 flex flex-col sm:flex-row gap-4'>
            {/* Game visual indicator */}
            <div
              className={cn(
                'w-16 h-16 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 relative overflow-hidden',
                game.status === 'active'
                  ? 'bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/60 dark:to-emerald-800/60 text-green-600 dark:text-green-400'
                  : game.status === 'scheduled'
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/60 dark:to-indigo-800/60 text-blue-600 dark:text-blue-400'
                  : game.status === 'completed'
                  ? 'bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-900/60 dark:to-gray-800/60 text-slate-600 dark:text-slate-400'
                  : 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/60 dark:to-red-800/60 text-red-600 dark:text-red-400',
                'border border-muted shadow-sm transition-all duration-200 group-hover:shadow-md'
              )}
            >
              {/* Ripple effect for live games */}
              {isLive && (
                <>
                  <span className='absolute -top-10 -left-10 w-40 h-40 rounded-full bg-green-500/10 animate-ping-slow'></span>
                  <span className='absolute -top-5 -left-5 w-24 h-24 rounded-full bg-green-500/20 animate-ping-slow animation-delay-300'></span>
                </>
              )}

              {game.status === 'completed' && game.result ? (
                <span className='text-2xl font-bold z-10'>{game.result}</span>
              ) : (
                <span className='z-10'>#{game.id.substring(0, 2)}</span>
              )}

              {/* Jackpot indicator */}
              {isJackpot && (
                <div className='absolute -top-1 -right-1 z-20'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='bg-amber-500 text-white p-1 rounded-md shadow-md animate-pulse'>
                          <Trophy className='h-3.5 w-3.5' />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side='top'>
                        <p className='text-xs'>Game Jackpot</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {/* Game info */}
            <div className='flex-1 flex flex-col justify-center min-w-0'>
              {/* Game ID and status */}
              <div className='flex items-center justify-between mb-1.5'>
                <div className='text-sm font-medium flex items-center'>
                  {isJackpot && <Star className='h-3.5 w-3.5 text-amber-500 mr-1.5' />}
                  Lượt chơi #{game.id.substring(0, 8)}
                </div>
                {getStatusBadge()}
              </div>

              {/* Time information */}
              <div className={cn('flex items-center text-sm gap-1.5 mb-1.5', getPulseAnimation())}>
                {isLive ? (
                  timeState === 'urgent' ? (
                    <Flame className='h-4 w-4 text-red-500' />
                  ) : (
                    <Clock className='h-4 w-4 text-green-500' />
                  )
                ) : game.status === 'scheduled' ? (
                  <Timer className='h-4 w-4 text-blue-500' />
                ) : (
                  <Clock className='h-4 w-4 text-muted-foreground' />
                )}
                <span className={getTimeTextColor()}>{timeLeft}</span>
              </div>

              {/* Time details */}
              <div className='flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-1'>
                <div className='flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md'>
                  <Calendar className='h-3 w-3' />
                  <span>Bắt đầu: {formattedStartTime}</span>
                </div>
                <div className='flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md'>
                  <Clock className='h-3 w-3' />
                  <span>Kết thúc: {formattedEndTime}</span>
                </div>
                {game.bets_count?.length > 0 && (
                  <div className='flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md'>
                    <Users className='h-3 w-3' />
                    <span>{game.bets_count[0]?.count} người chơi</span>
                  </div>
                )}
                {/* Add statistics indicator if available */}
                {game.total_bet_amount && (
                  <div className='flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-md'>
                    <CircleDollarSign className='h-3 w-3' />
                    <span>Tổng cược: {new Intl.NumberFormat('vi-VN').format(game.total_bet_amount)}đ</span>
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
                    'whitespace-nowrap transition-all duration-300 font-medium',
                    isJackpot
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20'
                      : '',
                    game.status === 'completed' ? 'bg-secondary hover:bg-secondary/80' : '',
                    isLive && !isJackpot
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md shadow-green-500/20'
                      : '',
                    timeState === 'urgent' && isLive
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white animate-pulse shadow-md shadow-red-500/20'
                      : ''
                  )}
                >
                  {isLive ? (
                    timeState === 'urgent' ? (
                      <>
                        Tham gia ngay!
                        <Flame className='ml-2 h-4 w-4 animate-bounce' />
                      </>
                    ) : (
                      <>
                        Tham gia
                        <span className='ml-2 h-2 w-2 rounded-full bg-white inline-block animate-pulse'></span>
                      </>
                    )
                  ) : game.status === 'scheduled' ? (
                    <>
                      Chi tiết <ChevronRight className='ml-1 h-4 w-4' />
                    </>
                  ) : game.status === 'completed' ? (
                    <>
                      Kết quả <Award className='ml-1 h-4 w-4' />
                    </>
                  ) : (
                    <>
                      Chi tiết <ChevronRight className='ml-1 h-4 w-4' />
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
