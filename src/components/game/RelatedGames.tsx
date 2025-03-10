// src/components/game/RelatedGames.tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { GameCard } from './GameCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { GameRound } from '@/types/database'

interface RelatedGamesProps {
  currentGameId: string
  status?: string
  limit?: number
}

export default function RelatedGames({
  currentGameId,
  status = 'active',
  limit = 3,
}: RelatedGamesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsToShow, setCardsToShow] = useState(3)

  // Fetch related games data
  const { data, isLoading, error } = useQuery({
    queryKey: ['games', 'related', currentGameId, status],
    queryFn: async () => {
      const response = await fetch(
        `/api/games/related?id=${currentGameId}&status=${status}&limit=${
          limit + 2
        }`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch related games')
      }
      return response.json()
    },
  })

  const relatedGames = data?.gameRounds || []
  const filteredGames = relatedGames.filter(
    (game: GameRound) => game.id !== currentGameId
  )

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1)
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2)
      } else {
        setCardsToShow(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, filteredGames.length - cardsToShow)

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Lượt chơi tương tự</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className='overflow-hidden h-[280px]'>
              <CardContent className='p-0 flex flex-col h-full'>
                <div className='h-40 bg-muted animate-pulse'></div>
                <div className='p-4 space-y-3 flex-1'>
                  <Skeleton className='h-5 w-3/4' />
                  <div className='flex justify-between'>
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-4 w-1/4' />
                  </div>
                  <div className='flex justify-between items-center mt-auto pt-2'>
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='h-8 w-16 rounded-md' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || filteredGames.length === 0) {
    return null // Hide component if error or no related games
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Lượt chơi tương tự</h3>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() =>
              setCurrentIndex(Math.min(maxIndex, currentIndex + 1))
            }
            disabled={currentIndex >= maxIndex}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='relative overflow-hidden'>
        <motion.div
          className='flex gap-4'
          initial={false}
          animate={{ x: `-${currentIndex * (100 / cardsToShow)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            width: `${(filteredGames.length / cardsToShow) * 100}%`,
            display: 'grid',
            gridTemplateColumns: `repeat(${filteredGames.length}, minmax(0, 1fr))`,
          }}>
          {filteredGames.map((game: GameRound) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className='transform transition-all duration-200'>
              <GameCard game={game} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
