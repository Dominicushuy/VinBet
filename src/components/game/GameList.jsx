// src/app/(main)/games/components/GameList.jsx
import { memo } from 'react'
import { motion } from 'framer-motion'
import { GameListItem } from '@/components/game/GameListItem'

const GameList = memo(function GameList({ games }) {
  return (
    <div className='space-y-3'>
      {games.map(game => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className='hover:ring-1 hover:ring-primary/10 rounded-lg transition-all'
        >
          <GameListItem game={game} />
        </motion.div>
      ))}
    </div>
  )
})

export default GameList
