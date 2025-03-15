// src/app/(main)/games/components/GameList.jsx
import { memo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameListItem } from '@/components/game/GameListItem'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, List } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton for GameListItem
const GameListItemSkeleton = () => (
  <div className='rounded-lg border shadow p-4 flex flex-col sm:flex-row gap-4'>
    <Skeleton className='w-16 h-16 rounded-md' />
    <div className='flex-1 space-y-2'>
      <div className='flex justify-between'>
        <Skeleton className='h-5 w-1/3' />
        <Skeleton className='h-5 w-20' />
      </div>
      <Skeleton className='h-4 w-2/5' />
      <div className='flex flex-wrap gap-2 pt-1'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-4 w-20' />
      </div>
    </div>
    <div className='flex items-center'>
      <Skeleton className='h-9 w-24' />
    </div>
  </div>
)

const GameList = memo(function GameList({ games, isLoading = false, initialCount = 5 }) {
  const [visibleCount, setVisibleCount] = useState(initialCount)
  const [pinnedGames, setPinnedGames] = useState([])
  const [regularGames, setRegularGames] = useState([])

  // Sort games to show active games first, then scheduled, then others
  useEffect(() => {
    if (!games || isLoading) return

    // Find jackpot or active games to pin at top
    const pinned = games.filter(
      game =>
        game.is_jackpot ||
        (game.status === 'active' && new Date(game.end_time).getTime() - new Date().getTime() < 30 * 60 * 1000)
    )

    const regular = games.filter(game => !pinned.some(pg => pg.id === game.id))

    setPinnedGames(pinned)
    setRegularGames(regular)
  }, [games, isLoading])

  const showMoreGames = () => {
    setVisibleCount(prevCount => prevCount + 5)
  }

  const showLessGames = () => {
    setVisibleCount(initialCount)
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[...Array(3)].map((_, i) => (
          <GameListItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Pinned games section */}
      {pinnedGames.length > 0 && (
        <div className='space-y-3 relative'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='h-px bg-gradient-to-r from-primary to-transparent flex-grow'></div>
            <span className='text-sm font-medium text-primary flex items-center gap-1'>
              <List className='h-4 w-4' />
              Game đặc biệt
            </span>
            <div className='h-px bg-gradient-to-l from-primary to-transparent flex-grow'></div>
          </div>

          <AnimatePresence>
            {pinnedGames.map(game => (
              <motion.div
                key={`pinned-${game.id}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className='relative'
              >
                <div className='absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-16 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full'></div>
                <GameListItem game={game} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Regular games */}
      <div className='space-y-3'>
        {regularGames.length > 0 && pinnedGames.length > 0 && (
          <div className='flex items-center gap-2 mb-2'>
            <div className='h-px bg-muted flex-grow'></div>
            <span className='text-sm font-medium text-muted-foreground'>Các game khác</span>
            <div className='h-px bg-muted flex-grow'></div>
          </div>
        )}

        <AnimatePresence>
          {regularGames.slice(0, visibleCount).map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className='hover:ring-1 hover:ring-primary/10 rounded-lg transition-all'
            >
              <GameListItem game={game} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load more button */}
      {regularGames.length > visibleCount ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex justify-center mt-4'>
          <Button variant='outline' onClick={showMoreGames} className='group'>
            Xem thêm
            <ChevronDown className='ml-2 h-4 w-4 group-hover:animate-bounce' />
          </Button>
        </motion.div>
      ) : regularGames.length > initialCount ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex justify-center mt-4'>
          <Button variant='outline' onClick={showLessGames} className='group'>
            Thu gọn
            <ChevronUp className='ml-2 h-4 w-4 group-hover:animate-bounce' />
          </Button>
        </motion.div>
      ) : null}
    </div>
  )
})

export default GameList
