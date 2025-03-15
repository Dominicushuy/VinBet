// src/app/(main)/games/components/GameGrid.jsx
import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCard } from '@/components/game/GameCard'
import { Button } from '@/components/ui/button'
import { ChevronDown, Layout } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton for GameCard
const GameCardSkeleton = () => (
  <div className='rounded-lg border shadow overflow-hidden h-64'>
    <Skeleton className='h-1 w-full' />
    <div className='p-4 space-y-4'>
      <div className='flex justify-between'>
        <Skeleton className='h-10 w-10 rounded-md' />
        <Skeleton className='h-6 w-24' />
      </div>
      <Skeleton className='h-5 w-3/4' />
      <Skeleton className='h-4 w-2/3' />
      <div className='space-y-2 pt-4'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
      </div>
      <Skeleton className='h-9 w-full mt-4' />
    </div>
  </div>
)

const GameGrid = memo(function GameGrid({ games, isLoading = false, initialCount = 8 }) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [sortedGames, setSortedGames] = useState([])

  // Sort games - active first, then scheduled, then others
  useEffect(() => {
    if (!games || isLoading) return

    const sorted = [...games].sort((a, b) => {
      // Active games first
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1

      // Then scheduled games
      if (a.status === 'scheduled' && b.status !== 'scheduled') return -1
      if (a.status !== 'scheduled' && b.status === 'scheduled') return 1

      // Sort by start time for same status
      return new Date(b.start_time) - new Date(a.start_time)
    })

    setSortedGames(sorted)
  }, [games, isLoading])

  const showMoreGames = () => {
    setVisibleCount(prevCount => prevCount + 8)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {[...Array(8)].map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2 mb-2'>
        <Layout className='h-4 w-4 text-primary' />
        <span className='text-sm font-medium text-primary'>Bố cục lưới</span>
        <div className='h-px bg-gradient-to-r from-primary/50 to-transparent flex-grow'></div>
      </div>

      <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        variants={container}
        initial='hidden'
        animate='show'
      >
        <AnimatePresence>
          {sortedGames.slice(0, visibleCount).map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              className='transform transition-all duration-300'
            >
              <GameCard game={game} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load more button */}
      {sortedGames.length > visibleCount && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex justify-center mt-6'>
          <Button
            onClick={showMoreGames}
            className='px-6 py-2 group bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
          >
            Xem thêm game
            <ChevronDown className='ml-2 h-4 w-4 group-hover:animate-bounce' />
          </Button>
        </motion.div>
      )}
    </div>
  )
})

export default GameGrid
