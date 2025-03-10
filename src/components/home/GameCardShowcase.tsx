// src/components/home/GameCardShowcase.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Users } from 'lucide-react'
import { GameListSkeleton } from '@/components/game/GameListSkeleton'

interface Game {
  id: string
  title: string
  status: 'active' | 'upcoming' | 'completed' | 'cancelled'
  startTime: string
  endTime: string
  participants: number
  image: string
  isJackpot?: boolean
}

interface GameCardProps {
  game: Game
}

function GameCard({ game }: GameCardProps) {
  const timeLeft = getTimeLeft(new Date(game.endTime))

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

  return (
    <div className='group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-md'>
      {game.isJackpot && (
        <div className='absolute top-0 right-0 z-20 m-2'>
          <Badge variant='default' className='bg-amber-500 text-white'>
            Jackpot
          </Badge>
        </div>
      )}

      <div className='relative aspect-[2/1] overflow-hidden'>
        <img
          src={game.image || '/images/game-placeholder.webp'}
          alt={game.title}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'></div>

        <div className='absolute bottom-0 left-0 right-0 p-4'>
          <h3 className='text-lg font-semibold text-white truncate'>
            {game.title}
          </h3>

          <div className='flex items-center gap-3 mt-1'>
            <div className='flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full'>
              <Clock className='h-3 w-3' />
              <span>{timeLeft}</span>
            </div>

            <div className='flex items-center gap-1 bg-black/40 text-white text-xs px-2 py-1 rounded-full'>
              <Users className='h-3 w-3' />
              <span>{game.participants}</span>
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
  count?: number
}

export function GameCardShowcase({ type, count = 6 }: GameCardShowcaseProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    setLoading(true)
    setTimeout(() => {
      const mockGames: Game[] = Array.from({ length: count }).map(
        (_, index) => ({
          id: `game-${type}-${index}`,
          title: `${type === 'jackpot' ? 'Jackpot Lớn' : 'Lượt chơi'} #${
            10000 + index
          }`,
          status: type === 'upcoming' ? 'upcoming' : 'active',
          startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          endTime: new Date(
            Date.now() + 1000 * 60 * (30 + index * 10)
          ).toISOString(),
          participants: 10 + Math.floor(Math.random() * 100),
          image: `/images/game-${(index % 3) + 1}.webp`,
          isJackpot: type === 'jackpot' ? true : index % 5 === 0,
        })
      )

      setGames(mockGames)
      setLoading(false)
    }, 1000)
  }, [type, count])

  if (loading) {
    return <GameListSkeleton count={count} />
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
