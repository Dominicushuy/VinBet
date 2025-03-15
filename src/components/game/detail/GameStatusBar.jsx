'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Users } from 'lucide-react'

export default function GameStatusBar({ game }) {
  // console.log('game', game)

  const [timeLeft, setTimeLeft] = useState('')
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isLive, setIsLive] = useState(false)

  // Calculate progress gradient based on percentage
  const getProgressGradient = useCallback(() => {
    if (progressPercentage < 30) {
      return 'from-green-500 to-green-400'
    } else if (progressPercentage < 70) {
      return 'from-yellow-500 to-amber-400'
    } else {
      return 'from-red-500 to-orange-400'
    }
  }, [progressPercentage])

  // Update time and progress
  // Update time and progress
  useEffect(() => {
    if (!game) return

    const updateTimeAndProgress = () => {
      const now = new Date()
      const startTime = new Date(game.start_time)
      const endTime = new Date(game.end_time)
      const totalDuration = endTime.getTime() - startTime.getTime()

      // Kiểm tra status và thời gian để xác định isLive
      if (game.status === 'active' && now < endTime) {
        setIsLive(true)
        const elapsed = now.getTime() - startTime.getTime()
        const progress = Math.min((elapsed / totalDuration) * 100, 100)
        setProgressPercentage(progress)

        const timeRemaining = formatDistanceToNow(endTime, {
          locale: vi,
          addSuffix: false
        })
        setTimeLeft(`Kết thúc trong ${timeRemaining}`)
      } else if (game.status === 'scheduled' && now < startTime) {
        setIsLive(false)
        setProgressPercentage(0)

        const timeToStart = formatDistanceToNow(startTime, {
          locale: vi,
          addSuffix: false
        })
        setTimeLeft(`Bắt đầu trong ${timeToStart}`)
      } else if (game.status === 'completed' || now >= endTime) {
        setIsLive(false)
        setProgressPercentage(100)
        setTimeLeft('Đã kết thúc')
      }
    }

    updateTimeAndProgress()
    const intervalId = setInterval(updateTimeAndProgress, 60000)

    return () => clearInterval(intervalId)
  }, [game])

  // Should not render if no game data
  if (!game) return null

  return (
    <>
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center'
          >
            <div className='flex items-center mb-2 sm:mb-0'>
              <span className='h-3 w-3 rounded-full bg-green-500 animate-pulse mr-3'></span>
              <span className='font-medium'>Lượt chơi đang diễn ra</span>
            </div>
            <div className='flex items-center'>
              <div className='flex gap-1 items-center text-sm text-muted-foreground'>
                <span className='ml-6 sm:ml-2'>{timeLeft}</span>
                <Users className='h-4 w-4 ml-3 mr-1' />
                <span>{game.bets_count[0]?.count || 0} lượt cược</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLive && (
        <div className='relative pt-1'>
          <div className='flex items-center justify-between mb-1'>
            <div className='text-xs text-muted-foreground'>Tiến độ: {progressPercentage.toFixed(0)}%</div>
            <div className='text-xs text-muted-foreground'>{timeLeft}</div>
          </div>
          <Progress
            value={progressPercentage}
            className='h-2'
            indicatorClassName={`bg-gradient-to-r ${getProgressGradient()}`}
          />
        </div>
      )}
    </>
  )
}
