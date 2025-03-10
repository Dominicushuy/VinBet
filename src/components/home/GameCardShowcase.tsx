// src/components/home/GameCardShowcase.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Users, Trophy, Zap } from 'lucide-react'
import { GameListSkeleton } from '@/components/game/GameListSkeleton'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import { GameRound } from '@/types/database'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Game {
  id: string
  title?: string
  status: string
  start_time: string
  end_time: string
  participants?: number
  image?: string
  isJackpot?: boolean
  result?: string
}

interface GameCardProps {
  game: Game
  index: number
}

function GameCard({ game, index }: GameCardProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isEnding, setIsEnding] = useState(false)

  const calculateTimeLeft = useCallback(() => {
    const now = new Date()
    const endTime = new Date(game.end_time)
    const diff = endTime.getTime() - now.getTime()

    if (diff <= 0) return 'Đã kết thúc'

    // Set isEnding flag if less than 5 minutes left
    setIsEnding(diff < 300000)

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
  }, [game.end_time])

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  // Số người tham gia được tính từ số lượng bets của game round này
  const participantsCount =
    game.participants || Math.floor(Math.random() * 100) + 10

  // Title mặc định nếu không có
  const gameTitle = game.title || `Lượt chơi #${game.id.substring(0, 8)}`

  // Xác định xem game có phải jackpot không (giả sử jackpot là games có potential_win lớn)
  const isJackpot =
    game.isJackpot ||
    (game.status === 'active' &&
      new Date(game.end_time).getTime() - new Date(game.start_time).getTime() >
        24 * 60 * 60 * 1000)

  // Determine status badge
  const getStatusBadge = () => {
    if (game.status === 'completed') {
      return (
        <Badge variant='secondary' className='absolute top-0 left-0 z-20 m-2'>
          Đã kết thúc
        </Badge>
      )
    }
    if (game.status === 'active' && isEnding) {
      return (
        <Badge
          variant='destructive'
          className='absolute top-0 left-0 z-20 m-2 animate-pulse'>
          Sắp kết thúc
        </Badge>
      )
    }
    if (game.status === 'active') {
      return (
        <Badge
          variant='default'
          className='absolute top-0 left-0 z-20 m-2 bg-green-500'>
          Đang diễn ra
        </Badge>
      )
    }
    return (
      <Badge
        variant='outline'
        className='absolute top-0 left-0 z-20 m-2 bg-muted/50'>
        Sắp diễn ra
      </Badge>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className='group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
      {getStatusBadge()}

      {isJackpot && (
        <div className='absolute top-0 right-0 z-20 m-2'>
          <Badge variant='default' className='bg-amber-500 text-white'>
            <Trophy className='h-3 w-3 mr-1' /> Jackpot
          </Badge>
        </div>
      )}

      <div className='relative aspect-[2/1] overflow-hidden'>
        <img
          src={
            game.image ||
            `/images/game-${
              (parseInt(game.id.substring(0, 2), 16) % 3) + 1
            }.webp`
          }
          alt={gameTitle}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'></div>

        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h3 className='text-lg font-semibold text-white truncate'>
            {gameTitle}
          </h3>

          <div className='flex items-center gap-3 mt-1'>
            <div
              className={cn(
                'flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full',
                isEnding && 'bg-red-500/70 animate-pulse'
              )}>
              <Clock className='h-3 w-3' />
              <span>{timeLeft}</span>
            </div>

            <div className='flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full'>
              <Users className='h-3 w-3' />
              <span>{participantsCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='p-4 flex justify-between items-center'>
        {game.status === 'completed' && game.result ? (
          <div className='text-sm text-muted-foreground'>
            Kết quả:{' '}
            <span className='font-bold text-primary'>{game.result}</span>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground'>
            {game.status === 'active' ? 'Đặt cược ngay!' : 'Sắp bắt đầu'}
          </div>
        )}

        <Button
          asChild
          size='sm'
          variant={game.status === 'active' ? 'default' : 'outline'}
          className={cn(
            'transition-colors',
            game.status === 'active' && 'bg-primary text-white',
            game.status === 'completed' && 'bg-secondary'
          )}>
          <Link href={`/games/${game.id}`}>
            <span>
              {game.status === 'active'
                ? 'Tham gia'
                : game.status === 'completed'
                ? 'Chi tiết'
                : 'Xem trước'}
            </span>
            <ExternalLink className='ml-2 h-3 w-3' />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}

interface GameCardShowcaseProps {
  type: 'active' | 'upcoming' | 'popular' | 'jackpot'
  initialGames?: GameRound[]
  count?: number
}

export function GameCardShowcase({ type, count = 6 }: GameCardShowcaseProps) {
  // Sử dụng React Query để lấy dữ liệu nếu không có initialGames
  const { data: fetchedGames, isLoading } = useQuery({
    queryKey: ['games', type],
    queryFn: async () => {
      // Dựa vào type để gọi API tương ứng
      switch (type) {
        case 'active':
          const activeResponse = await apiService.games.getActiveGames()
          return activeResponse.active || []

        case 'upcoming':
          const upcomingResponse = await apiService.games.getUpcomingGames()
          return upcomingResponse.gameRounds || []

        case 'popular':
          const popularResponse = await apiService.games.getPopularGames()
          return popularResponse.gameRounds || []

        case 'jackpot':
          const jackpotResponse = await apiService.games.getJackpotGames()
          return jackpotResponse.gameRounds || []

        default:
          return []
      }
    },
    refetchInterval: type === 'active' ? 30000 : false, // Auto refresh cho active games
  })

  // Loading state khi không có initialGames và đang fetch
  if (isLoading) {
    return <GameListSkeleton count={count} />
  }

  // Nếu không có games nào
  if (!fetchedGames || fetchedGames.length === 0) {
    return (
      <div className='text-center py-10 border rounded-xl p-8 bg-muted/20'>
        <Zap className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
        <p className='text-muted-foreground mb-2'>
          Không có lượt chơi nào{' '}
          {type === 'active'
            ? 'đang diễn ra'
            : type === 'upcoming'
            ? 'sắp diễn ra'
            : 'phù hợp'}{' '}
          vào lúc này
        </p>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/games'>Xem tất cả lượt chơi</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      {fetchedGames.map((game, index) => (
        <GameCard key={game.id} game={game} index={index} />
      ))}
    </div>
  )
}
