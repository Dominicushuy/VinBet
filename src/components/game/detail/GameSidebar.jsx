'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BetForm } from '@/components/bet/BetForm'
import { BetList } from '@/components/bet/BetList'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function GameSidebar({ game, activeTab, setActiveTab }) {
  // Status badge component
  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>Đang diễn ra</Badge>
      case 'scheduled':
        return (
          <Badge variant='outline' className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
            Sắp diễn ra
          </Badge>
        )
      case 'completed':
        return <Badge variant='secondary'>Đã kết thúc</Badge>
      case 'cancelled':
        return <Badge variant='destructive'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Calculate time remaining
  const timeLeft = useMemo(() => {
    if (!game) return ''

    const now = new Date()
    const startTime = new Date(game.start_time)
    const endTime = new Date(game.end_time)

    if (now >= startTime && now < endTime) {
      return `Kết thúc trong ${formatDistanceToNow(endTime, {
        locale: vi,
        addSuffix: false
      })}`
    } else if (now < startTime) {
      return `Bắt đầu trong ${formatDistanceToNow(startTime, {
        locale: vi,
        addSuffix: false
      })}`
    } else {
      return 'Đã kết thúc'
    }
  }, [game?.start_time, game?.end_time])

  // Check if game is active
  const isActive = useMemo(() => {
    if (!game) return false

    const now = new Date()
    const startTime = new Date(game.start_time)
    const endTime = new Date(game.end_time)

    return now >= startTime && now < endTime
  }, [game?.start_time, game?.end_time])

  return (
    <div className='space-y-6'>
      {/* Bet form in sidebar for active games */}
      {game.status === 'active' && (
        <div className='block md:hidden'>
          <BetForm gameRound={game} />
        </div>
      )}

      {/* Game status card */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Trạng thái:</span>
              <div>{getStatusBadge(game.status)}</div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Người tham gia:</span>
              <div className='font-medium'>{(game.bets_count && game.bets_count[0]?.count) || 0}</div>
            </div>
            {isActive && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Thời gian còn lại:</span>
                <div className='font-medium text-green-600 dark:text-green-400'>{timeLeft}</div>
              </div>
            )}
            {game.status === 'completed' && game.result && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Kết quả:</span>
                <div className='font-bold text-xl'>{game.result}</div>
              </div>
            )}
          </div>

          {/* Call to action */}
          {game.status === 'active' && (
            <div className='pt-2'>
              <Button className='w-full' onClick={() => setActiveTab('bets')}>
                Đặt cược ngay
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User's bets */}
      <div className='hidden md:block'>
        <BetList gameRoundId={game?.id} />
      </div>
    </div>
  )
}
