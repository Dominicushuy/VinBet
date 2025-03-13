// src/app/(main)/games/components/GameGrid.jsx
import { memo } from 'react'
import { motion } from 'framer-motion'
import { GameCard } from '@/components/game/GameCard'

const GameGrid = memo(function GameGrid({ games }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {games.map(game => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className='transform transition-all duration-200'
        >
          <GameCard game={game} />
        </motion.div>
      ))}
    </div>
  )
})

export default GameGrid
