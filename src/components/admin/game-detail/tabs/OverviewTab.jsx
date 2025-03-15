import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Trophy,
  Timer,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart2,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function OverviewTab({ game, betStats, timeInfo, onSetResult }) {
  const formatDate = date => format(new Date(date), 'dd/MM/yyyy HH:mm')
  const [countdown, setCountdown] = useState('')
  const [countdownColor, setCountdownColor] = useState('text-blue-500')
  const [progressValue, setProgressValue] = useState(0)

  // Update countdown timer
  useEffect(() => {
    if (game.status !== 'active') return

    const updateCountdown = () => {
      const now = new Date()
      const endTime = new Date(game.end_time)
      const timeLeft = endTime - now

      if (timeLeft <= 0) {
        setCountdown('Đã hết thời gian')
        setCountdownColor('text-red-500')
        setProgressValue(100)
        return
      }

      // Calculate progress
      const startTime = new Date(game.start_time)
      const totalDuration = endTime - startTime
      const elapsed = now - startTime
      const progress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgressValue(progress)

      // Format countdown
      const hours = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

      const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':')

      setCountdown(formattedTime)

      // Set color based on time remaining
      if (timeLeft < 5 * 60 * 1000) {
        // less than 5 minutes
        setCountdownColor('text-red-500')
      } else if (timeLeft < 30 * 60 * 1000) {
        // less than 30 minutes
        setCountdownColor('text-amber-500')
      } else {
        setCountdownColor('text-green-500')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [game.status, game.end_time, game.start_time])

  // Calculate stats based on betStats
  const stats = useMemo(() => {
    return {
      winRate: betStats.total_bets > 0 ? ((betStats.winning_bets / betStats.total_bets) * 100).toFixed(1) : 0,
      averageBet: betStats.total_bets > 0 ? betStats.total_bet_amount / betStats.total_bets : 0,
      profit: betStats.total_bet_amount - betStats.total_win_amount
    }
  }, [betStats])

  // Calculate relative profit percentage
  const profitPercentage = useMemo(() => {
    if (betStats.total_bet_amount === 0) return 0
    return ((stats.profit / betStats.total_bet_amount) * 100).toFixed(1)
  }, [betStats.total_bet_amount, stats.profit])

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: custom => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: 'easeOut' }
    })
  }

  return (
    <div className='space-y-5'>
      {/* Time Status Card */}
      <motion.div variants={cardVariants} initial='hidden' animate='visible' custom={0}>
        <Card className='overflow-hidden border-2'>
          <CardContent className='p-0'>
            <div className='relative'>
              {game.status === 'active' && (
                <Progress
                  value={progressValue}
                  className='h-1 absolute top-0 left-0 right-0 bg-slate-200 dark:bg-slate-800 rounded-none'
                  indicatorClassName={`${
                    progressValue > 80 ? 'bg-red-500' : progressValue > 50 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                />
              )}

              <div className='p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div className='flex items-center'>
                  <div className='bg-primary/10 p-3 rounded-full mr-4'>
                    <Calendar className='h-6 w-6 text-primary' />
                  </div>
                  <div>
                    <h3 className='text-base font-medium mb-1'>Thời gian lượt chơi</h3>
                    <p className='text-sm text-muted-foreground'>
                      {formatDate(game.start_time)} - {formatDate(game.end_time)}
                    </p>
                  </div>
                </div>

                <div className='w-full sm:w-auto flex flex-col items-start sm:items-end'>
                  {game.status === 'active' && (
                    <>
                      <div className={`text-lg font-bold ${countdownColor} mb-1 font-mono`}>{countdown}</div>
                      <div className='flex items-center'>
                        <Timer className={`h-4 w-4 mr-1.5 ${countdownColor}`} />
                        <span className='text-sm text-muted-foreground'>{timeInfo.text}</span>
                      </div>
                    </>
                  )}
                  {game.status === 'scheduled' && (
                    <div className='flex items-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1'>
                      <Clock className='h-4 w-4 mr-2' />
                      <span className='text-sm font-medium'>{timeInfo.text}</span>
                    </div>
                  )}
                  {game.status === 'completed' && (
                    <div className='flex items-center rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1'>
                      <CheckCircle className='h-4 w-4 mr-2' />
                      <span className='text-sm font-medium'>Đã hoàn thành</span>
                    </div>
                  )}
                  {game.status === 'cancelled' && (
                    <div className='flex items-center rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1'>
                      <XCircle className='h-4 w-4 mr-2' />
                      <span className='text-sm font-medium'>Đã hủy</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <motion.div variants={cardVariants} initial='hidden' animate='visible' custom={1}>
          <Card className='border-2 shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base flex items-center'>
                <Users className='h-4 w-4 mr-2 text-blue-500' />
                Thống kê cược
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                  <p className='text-xs text-blue-600 dark:text-blue-400'>Tổng số cược</p>
                  <p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>{betStats.total_bets}</p>
                </div>
                <div className='space-y-1 p-3 bg-green-50 dark:bg-green-950 rounded-lg'>
                  <p className='text-xs text-green-600 dark:text-green-400'>Cược thắng</p>
                  <p className='text-2xl font-bold text-green-700 dark:text-green-300'>
                    {betStats.winning_bets}
                    <span className='text-xs ml-1 font-normal'>({stats.winRate}%)</span>
                  </p>
                </div>
                <div className='space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg col-span-2'>
                  <div className='flex justify-between items-center'>
                    <p className='text-xs text-slate-600 dark:text-slate-400'>Tỷ lệ thắng</p>
                    <p className='text-xs text-slate-600 dark:text-slate-400 font-medium'>{stats.winRate}%</p>
                  </div>
                  <div className='h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-blue-500 rounded-full'
                      style={{ width: `${Math.max(stats.winRate, 3)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial='hidden' animate='visible' custom={2}>
          <Card className='border-2 shadow-sm hover:shadow-md transition-shadow'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base flex items-center'>
                <BarChart2 className='h-4 w-4 mr-2 text-green-500' />
                Thống kê tài chính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg'>
                  <p className='text-xs text-slate-600 dark:text-slate-400'>Tổng cược</p>
                  <p className='text-xl font-bold'>{formatCurrency(betStats.total_bet_amount)}</p>
                </div>
                <div className='space-y-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg'>
                  <p className='text-xs text-slate-600 dark:text-slate-400'>Tổng thắng</p>
                  <p className='text-xl font-bold'>{formatCurrency(betStats.total_win_amount)}</p>
                </div>
                <div className='space-y-1 p-3 rounded-lg col-span-2 border bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950 dark:to-transparent'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <DollarSign className='h-4 w-4 text-slate-600 dark:text-slate-400 mr-1' />
                      <p className='text-sm text-slate-600 dark:text-slate-400'>Lợi nhuận</p>
                    </div>
                    <Badge
                      className={`font-medium ${
                        stats.profit >= 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}
                    >
                      {stats.profit >= 0 ? (
                        <ArrowUp className='h-3 w-3 mr-1' />
                      ) : (
                        <ArrowDown className='h-3 w-3 mr-1' />
                      )}
                      {profitPercentage}%
                    </Badge>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      stats.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(Math.abs(stats.profit))}
                    <span className='text-xs ml-2 font-normal text-muted-foreground'>
                      {stats.profit >= 0 ? 'lợi nhuận' : 'lỗ'}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Result Section */}
      <motion.div variants={cardVariants} initial='hidden' animate='visible' custom={3}>
        <Card className='border-2 shadow-md'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Kết quả lượt chơi</CardTitle>
            <CardDescription>
              {game.status === 'completed' ? 'Lượt chơi đã kết thúc với kết quả bên dưới' : 'Lượt chơi chưa có kết quả'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {game.status === 'completed' ? (
              <div className='flex flex-col items-center py-6'>
                <div className='relative mb-6'>
                  <div className='absolute -inset-1 rounded-full bg-green-500/20 blur-lg'></div>
                  <div className='w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center relative'>
                    <Sparkles className='absolute h-6 w-6 text-yellow-300 -top-2 -right-2 animate-pulse' />
                    <div className='text-6xl font-bold text-white'>{game.result}</div>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-2'>
                  <div className='flex items-center px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/50'>
                    <Trophy className='h-5 w-5 mr-2 text-amber-500' />
                    <span className='text-amber-800 dark:text-amber-300 font-medium'>
                      {betStats.winning_bets} người thắng
                    </span>
                  </div>
                  <div className='flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/50'>
                    <DollarSign className='h-5 w-5 mr-2 text-green-500' />
                    <span className='text-green-800 dark:text-green-300 font-medium'>
                      Tổng thưởng: {formatCurrency(betStats.total_win_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : game.status === 'cancelled' ? (
              <div className='flex flex-col items-center justify-center py-8'>
                <div className='w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mb-4'>
                  <AlertTriangle className='h-10 w-10 text-red-500' />
                </div>
                <p className='text-xl font-medium mb-2'>Lượt chơi đã bị hủy</p>
                <p className='text-sm text-muted-foreground max-w-md text-center'>
                  Tất cả các cược đã được hoàn tiền. Không có người thắng hoặc người thua trong lượt chơi này.
                </p>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-8'>
                {timeInfo.isExpired && game.status === 'active' ? (
                  <div className='w-full max-w-md space-y-4'>
                    <div className='flex items-center p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800'>
                      <AlertCircle className='h-10 w-10 text-amber-500 mr-4 flex-shrink-0' />
                      <div>
                        <p className='font-medium text-amber-800 dark:text-amber-300'>Lượt chơi đã hết thời gian</p>
                        <p className='text-sm text-amber-600 dark:text-amber-400'>
                          Vui lòng nhập kết quả để hoàn tất lượt chơi
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={onSetResult}
                      variant='default'
                      className='w-full py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg shadow-lg shadow-green-500/20'
                    >
                      <Trophy className='mr-2 h-5 w-5' />
                      Nhập kết quả ngay
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className='w-20 h-20 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center mb-4 relative'>
                      <div className='absolute inset-0 rounded-full bg-blue-200 dark:bg-blue-900 animate-ping opacity-60'></div>
                      <Clock className='h-10 w-10 text-blue-500 relative' />
                    </div>
                    <p className='text-xl font-medium mb-2'>Đang chờ kết quả</p>
                    <p className='text-sm text-muted-foreground max-w-md text-center'>
                      {game.status === 'active'
                        ? 'Kết quả sẽ được công bố sau khi lượt chơi kết thúc. Vui lòng chờ trong giây lát.'
                        : 'Lượt chơi chưa bắt đầu. Vui lòng quay lại sau khi lượt chơi bắt đầu.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
