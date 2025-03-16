'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  Trophy,
  Users,
  Timer,
  Ban,
  Calendar,
  Flame,
  CircleDollarSign,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function GameCard({ game, className }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isLive, setIsLive] = useState(false)
  const [timeState, setTimeState] = useState('normal') // 'urgent', 'soon', 'normal'

  // Format thời gian hiển thị
  const formattedStartTime = format(new Date(game.start_time), 'HH:mm, dd/MM/yyyy', { locale: vi })
  const formattedEndTime = format(new Date(game.end_time), 'HH:mm, dd/MM/yyyy', { locale: vi })

  // Cập nhật thời gian còn lại và tiến độ
  useEffect(() => {
    const updateTimeAndProgress = () => {
      const now = new Date()
      const startTime = new Date(game.start_time)
      const endTime = new Date(game.end_time)
      const totalDuration = endTime.getTime() - startTime.getTime()

      // Check status first
      if (game.status === 'cancelled') {
        setIsLive(false)
        setProgressPercentage(0)
        setTimeState('normal')
        setTimeLeft('Đã hủy')
        return
      }

      if (game.status === 'completed') {
        setIsLive(false)
        setProgressPercentage(100)
        setTimeState('normal')
        setTimeLeft('Đã kết thúc')
        return
      }

      if (game.status === 'active' && now < endTime) {
        // Trò chơi đang hoạt động
        setIsLive(true)
        const elapsed = now.getTime() - startTime.getTime()
        const progress = Math.min((elapsed / totalDuration) * 100, 100)
        setProgressPercentage(progress)

        const timeToEnd = endTime.getTime() - now.getTime()

        // Set urgent flag if less than 30 minutes left
        if (timeToEnd < 15 * 60 * 1000) {
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
      } else if (game.status === 'scheduled' && now < startTime) {
        // Trò chơi sắp bắt đầu
        setIsLive(false)
        setProgressPercentage(0)

        const timeToStart = startTime.getTime() - now.getTime()

        // Set soon flag if less than 30 minutes to start
        if (timeToStart < 15 * 60 * 1000) {
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
        // Fallback for any other case
        setIsLive(false)
        setProgressPercentage(game.status === 'completed' ? 100 : 0)
        setTimeState('normal')
        setTimeLeft(game.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy')
      }
    }

    updateTimeAndProgress()
    const intervalId = setInterval(updateTimeAndProgress, 15000) // Update more frequently for better UX
    return () => clearInterval(intervalId)
  }, [game.start_time, game.end_time, game.status])

  // Lấy badge trạng thái với kiểu hiển thị phù hợp
  const getStatusBadge = () => {
    switch (game.status) {
      case 'active':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant='default'
              className='bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-0'
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className='mr-1.5 h-2 w-2 rounded-full bg-white inline-block'
              />
              Đang diễn ra
            </Badge>
          </motion.div>
        )
      case 'scheduled':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant='outline'
              className='border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 shadow-sm'
            >
              <Calendar className='mr-1.5 h-3 w-3' />
              Sắp diễn ra
            </Badge>
          </motion.div>
        )
      case 'completed':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge
              variant='secondary'
              className='bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm'
            >
              <Trophy className='mr-1.5 h-3 w-3' />
              Đã kết thúc
            </Badge>
          </motion.div>
        )
      case 'cancelled':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge variant='destructive' className='bg-red-500 text-white shadow-sm'>
              <Ban className='mr-1.5 h-3 w-3' />
              Đã hủy
            </Badge>
          </motion.div>
        )
      default:
        return <Badge variant='outline'>{game.status}</Badge>
    }
  }

  // Tạo gradient background dựa trên trạng thái của trò chơi
  const getCardBackground = () => {
    switch (game.status) {
      case 'active':
        return 'bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-900/10 dark:to-emerald-900/10'
      case 'scheduled':
        return 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-900/10 dark:to-indigo-900/10'
      case 'completed':
        return 'bg-gradient-to-br from-slate-300/10 to-slate-400/5 dark:from-slate-800/10 dark:to-slate-700/5'
      case 'cancelled':
        return 'bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-950/10 dark:to-rose-950/5'
      default:
        return ''
    }
  }

  // Get border style based on status
  const getCardBorder = () => {
    switch (game.status) {
      case 'active':
        return timeState === 'urgent'
          ? 'border-red-500/50 dark:border-red-500/30'
          : 'border-green-500/30 dark:border-green-500/20'
      case 'scheduled':
        return timeState === 'soon'
          ? 'border-amber-500/30 dark:border-amber-500/20'
          : 'border-blue-500/20 dark:border-blue-500/10'
      case 'completed':
        return 'border-slate-300/50 dark:border-slate-700/30'
      case 'cancelled':
        return 'border-red-300/50 dark:border-red-900/30'
      default:
        return ''
    }
  }

  // Get progress bar style
  const getProgressStyle = () => {
    if (game.status === 'active') {
      if (timeState === 'urgent') {
        return {
          bgClass: 'bg-red-500/20 dark:bg-red-800/20',
          indicatorClass: 'bg-gradient-to-r from-red-500 to-rose-500'
        }
      }
      return {
        bgClass: 'bg-green-500/20 dark:bg-green-800/20',
        indicatorClass: 'bg-gradient-to-r from-green-500 to-emerald-500'
      }
    }

    if (game.status === 'completed') {
      return {
        bgClass: 'bg-slate-300/20 dark:bg-slate-800/20',
        indicatorClass: 'bg-gradient-to-r from-slate-400 to-slate-500'
      }
    }

    return {
      bgClass: 'bg-gray-200 dark:bg-gray-800',
      indicatorClass: 'bg-gradient-to-r from-gray-300 to-gray-400'
    }
  }

  // Kiểm tra xem trò chơi có jackpot hay không (để áp dụng style đặc biệt)
  const isJackpot = Boolean(
    game.is_jackpot || new Date(game.end_time).getTime() - new Date(game.start_time).getTime() > 24 * 60 * 60 * 1000
  )

  const progressStyle = getProgressStyle()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card
        className={cn(
          'overflow-hidden h-full transition-all duration-300 group',
          'hover:translate-y-1', // Removed hover:shadow-lg for cleaner hover effect
          getCardBackground(),
          getCardBorder(),
          isJackpot ? 'border-amber-500/40 dark:border-amber-600/30' : '',
          className
        )}
      >
        <div className='relative'>
          {/* Card Header with Gradient Overlay */}
          <div
            className={cn(
              'relative h-44 overflow-hidden',
              'bg-gradient-to-br from-primary/5 to-secondary/5',
              isJackpot ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5' : ''
            )}
          >
            {/* Visual Elements - Dynamic Background */}
            <div className='absolute inset-0 overflow-hidden'>
              {/* Dynamic background patterns based on status */}
              <AnimatePresence>
                {game.status === 'active' && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.3 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className='absolute h-64 w-64 rounded-full bg-green-500/10 -top-20 -right-20'
                    />
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: [0.5, 0.6, 0.5],
                        opacity: 0.2,
                        x: [0, 5, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className='absolute h-32 w-32 rounded-full bg-green-400/10 bottom-10 left-10'
                    />
                  </>
                )}

                {game.status === 'scheduled' && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.15 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className='absolute h-64 w-64 rounded-full bg-blue-500/10 -top-20 -right-20'
                    />
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: [0.5, 0.6, 0.5],
                        opacity: 0.1,
                        x: [0, 5, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className='absolute h-32 w-32 rounded-full bg-indigo-400/10 bottom-10 left-10'
                    />
                  </>
                )}

                {game.status === 'completed' && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className='absolute h-64 w-64 rounded-full bg-slate-500/10 -top-20 -right-20'
                    />
                  </>
                )}

                {game.status === 'cancelled' && (
                  <>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className='absolute h-64 w-64 rounded-full bg-red-500/10 -top-20 -right-20'
                    />
                  </>
                )}

                {/* Jackpot special effects */}
                {isJackpot && (
                  <>
                    <motion.div
                      animate={{
                        opacity: [0.2, 0.3, 0.2],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5'
                    />
                    <motion.div
                      animate={{
                        opacity: [0, 0.3, 0],
                        y: [0, -10, 0],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                      className='absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-amber-300/40'
                    />
                    <motion.div
                      animate={{
                        opacity: [0, 0.3, 0],
                        y: [0, -15, 0],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                      className='absolute top-1/3 right-1/3 h-3 w-3 rounded-full bg-amber-400/40'
                    />
                    <motion.div
                      animate={{
                        opacity: [0, 0.3, 0],
                        y: [0, -8, 0],
                        scale: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 3, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
                      className='absolute bottom-1/4 right-1/4 h-5 w-5 rounded-full bg-yellow-300/40'
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Game ID */}
            <div className='absolute top-3 left-3 text-xs font-medium bg-black/20 text-white px-2 py-1 rounded-md backdrop-blur-sm'>
              #{game.id.substring(0, 8)}
            </div>

            {/* Status Badge */}
            <div className='absolute top-3 right-3 z-10'>{getStatusBadge()}</div>

            {/* Jackpot Indicator */}
            {isJackpot && (
              <motion.div
                className='absolute bottom-3 left-3 z-10'
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge className='bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md border-0'>
                  <Sparkles className='mr-1.5 h-3 w-3 text-white' />
                  JACKPOT
                </Badge>
              </motion.div>
            )}

            {/* Center Content - Game Info */}
            <div className='absolute inset-0 flex items-center justify-center'>
              {game.status === 'completed' && game.result ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className='bg-black/40 backdrop-blur-md rounded-lg p-4 text-center shadow-lg'
                >
                  <div className='text-xs font-medium text-white/90 mb-1'>Kết quả</div>
                  <div className='text-4xl font-bold text-white'>{game.result}</div>
                </motion.div>
              ) : game.status === 'cancelled' ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className='bg-black/40 backdrop-blur-md rounded-lg p-4 text-center shadow-lg'
                >
                  <Ban className='mx-auto mb-2 h-8 w-8 text-red-400' />
                  <div className='text-sm font-medium text-white'>Trò chơi đã bị hủy</div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'bg-white/5 backdrop-blur-[2px] rounded-full w-24 h-24 flex items-center justify-center',
                    'border border-white/10 shadow-xl'
                  )}
                >
                  <div className='text-center'>
                    {isLive ? (
                      <motion.div
                        animate={timeState === 'urgent' ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Clock
                          className={cn(
                            'mx-auto mb-1 h-6 w-6',
                            timeState === 'urgent' ? 'text-red-400' : 'text-green-400'
                          )}
                        />
                        <div
                          className={cn(
                            'text-xs font-medium',
                            timeState === 'urgent' ? 'text-red-300' : 'text-green-300'
                          )}
                        >
                          LIVE
                        </div>
                      </motion.div>
                    ) : game.status === 'scheduled' ? (
                      <>
                        <Calendar className='mx-auto mb-1 h-6 w-6 text-blue-400' />
                        <div className='text-xs font-medium text-blue-300'>Sắp tới</div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Participants Count */}
            {game.bets_count?.length > 0 && (
              <div className='absolute bottom-3 right-3 bg-black/30 text-white rounded-md px-2 py-1 text-xs flex items-center backdrop-blur-sm'>
                <Users className='mr-1.5 h-3 w-3' />
                {(game.bets_count && game.bets_count[0]?.count) || 0} người chơi
              </div>
            )}
          </div>

          {/* Progress Bar cho thời gian đã trôi qua */}
          {(game.status === 'active' || game.status === 'completed') && (
            <div className='w-full'>
              <Progress
                value={progressPercentage}
                className={cn('h-1.5 rounded-none', progressStyle.bgClass)}
                indicatorClassName={progressStyle.indicatorClass}
              />
            </div>
          )}
        </div>

        <CardContent className='p-4 space-y-3 mt-2'>
          {/* Thông tin thời gian */}
          <div
            className={cn(
              'flex items-center text-sm gap-1.5',
              timeState === 'urgent' && game.status === 'active' ? 'animate-pulse' : ''
            )}
          >
            {game.status === 'active' ? (
              timeState === 'urgent' ? (
                <Flame className='h-4 w-4 text-red-500' />
              ) : (
                <Clock className='h-4 w-4 text-green-500' />
              )
            ) : game.status === 'scheduled' ? (
              <Timer className='h-4 w-4 text-blue-500' />
            ) : game.status === 'cancelled' ? (
              <Ban className='h-4 w-4 text-red-500' />
            ) : (
              <Trophy className='h-4 w-4 text-slate-500' />
            )}

            <span
              className={cn(
                'font-medium',
                game.status === 'active' && timeState === 'urgent'
                  ? 'text-red-600 dark:text-red-400'
                  : game.status === 'active'
                  ? 'text-green-600 dark:text-green-400'
                  : game.status === 'scheduled'
                  ? 'text-blue-600 dark:text-blue-400'
                  : game.status === 'cancelled'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-muted-foreground'
              )}
            >
              {timeLeft}
            </span>
          </div>

          {/* Thông tin chi tiết thời gian */}
          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='bg-muted/30 rounded-md p-2'>
              <p className='text-muted-foreground mb-0.5'>Bắt đầu:</p>
              <p className='font-medium text-foreground'>{formattedStartTime}</p>
            </div>
            <div className='bg-muted/30 rounded-md p-2'>
              <p className='text-muted-foreground mb-0.5'>Kết thúc:</p>
              <p className='font-medium text-foreground'>{formattedEndTime}</p>
            </div>
          </div>

          {/* Additional game info if available */}
          {game.total_bet_amount && (
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground mt-1'>
              <CircleDollarSign className='h-3.5 w-3.5' />
              <span>Tổng cược: {new Intl.NumberFormat('vi-VN').format(game.total_bet_amount)}đ</span>
            </div>
          )}
        </CardContent>

        <CardFooter className='p-4 pt-0 mt-auto'>
          <Link href={`/games/${game.id}`} className='w-full'>
            <Button
              variant={isLive ? 'default' : 'outline'}
              className={cn(
                'w-full transition-all duration-300 font-medium',
                isJackpot
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm'
                  : '',
                game.status === 'completed' ? 'bg-secondary hover:bg-secondary/80' : '',
                game.status === 'cancelled'
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-400 border-red-200 dark:border-red-800/50'
                  : '',
                isLive && !isJackpot
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm'
                  : '',
                timeState === 'urgent' && isLive
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white animate-pulse shadow-sm'
                  : ''
              )}
            >
              {game.status === 'active' ? (
                timeState === 'urgent' ? (
                  <>
                    Tham gia ngay!
                    <Flame className='ml-2 h-4 w-4 animate-bounce' />
                  </>
                ) : (
                  <>
                    Tham gia
                    <motion.span
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className='ml-2 h-2 w-2 rounded-full bg-white inline-block'
                    />
                  </>
                )
              ) : game.status === 'scheduled' ? (
                <>
                  Chi tiết <ChevronRight className='ml-1.5 h-4 w-4' />
                </>
              ) : game.status === 'completed' ? (
                <>
                  Xem kết quả <Trophy className='ml-1.5 h-4 w-4' />
                </>
              ) : (
                <>
                  Chi tiết <Ban className='ml-1.5 h-4 w-4' />
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
