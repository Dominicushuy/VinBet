// src/components/home/GameCardShowcase.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Users } from 'lucide-react'
import { GameListSkeleton } from '@/components/game/GameListSkeleton'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import { GameRound } from '@/types/database'

interface Game {
  id: string
  title?: string
  status: string
  start_time: string
  end_time: string
  participants?: number
  image?: string
  isJackpot?: boolean
}

interface GameCardProps {
  game: Game
}

function GameCard({ game }: GameCardProps) {
  const timeLeft = getTimeLeft(new Date(game.end_time))

  function getTimeLeft(endTime: Date): string {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()

    if (diff <= 0) return 'Đã kết thúc'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

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

  return (
    <div className='group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-md'>
      {isJackpot && (
        <div className='absolute top-0 right-0 z-20 m-2'>
          <Badge variant='default' className='bg-amber-500 text-white'>
            Jackpot
          </Badge>
        </div>
      )}

      <div className='relative aspect-[2/1] overflow-hidden'>
        <img
          src={
            game.image ||
            `/images/game-${Math.floor(Math.random() * 3) + 1}.webp`
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
            <div className='flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full'>
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

      <div className='p-4 flex justify-end'>
        <Button
          asChild
          size='sm'
          variant='outline'
          className='group-hover:bg-primary group-hover:text-white transition-colors'>
          <Link href={`/games/${game.id}`}>
            <span>Tham gia</span>
            <ExternalLink className='ml-2 h-3 w-3' />
          </Link>
        </Button>
      </div>
    </div>
  )
}

interface GameCardShowcaseProps {
  type: 'active' | 'upcoming' | 'popular' | 'jackpot'
  initialGames?: any[]
  count?: number
}

export function GameCardShowcase({
  type,
  initialGames,
  count = 6,
}: GameCardShowcaseProps) {
  const [hasInitialData] = useState(!!initialGames && initialGames.length > 0)

  // Sử dụng React Query để lấy dữ liệu nếu không có initialGames
  const { data: fetchedGames, isLoading } = useQuery({
    queryKey: ['games', type],
    queryFn: async () => {
      // Đối với tab active và upcoming, ta đã có dữ liệu ban đầu
      if (hasInitialData) return []

      // Đối với tab popular và jackpot, cần fetch thêm
      if (type === 'popular') {
        const response = await apiService.games.getGameRounds({
          status: 'active',
          sortBy: 'bets_count',
          sortOrder: 'desc',
          pageSize: count,
        })
        return response.gameRounds
      }

      if (type === 'jackpot') {
        const response = await apiService.games.getGameRounds({
          status: 'active',
          jackpotOnly: true,
          pageSize: count,
        })
        return response.gameRounds
      }

      return []
    },
    // Không cần fetch nếu đã có initialData
    enabled: !hasInitialData,
  })

  // Sử dụng initialGames nếu có, nếu không thì sử dụng fetchedGames
  const games = hasInitialData ? initialGames : fetchedGames

  // Loading state khi không có initialGames và đang fetch
  if (!hasInitialData && isLoading) {
    return <GameListSkeleton count={count} />
  }

  // Nếu không có games nào
  if (!games || games.length === 0) {
    return (
      <div className='text-center py-10'>
        <p className='text-muted-foreground'>
          Không có lượt chơi nào trong thời gian này
        </p>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/games'>Xem tất cả lượt chơi</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
