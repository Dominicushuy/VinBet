// src/components/game/GameResultAnimation.jsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'

export default function GameResultAnimation({ result, onComplete, autoPlay = true }) {
  const [currentNumber, setCurrentNumber] = useState(null)
  const [showFinalResult, setShowFinalResult] = useState(false)
  const [animationPlayed, setAnimationPlayed] = useState(false)

  // Effect for confetti animation
  useEffect(() => {
    if (showFinalResult && !animationPlayed) {
      setAnimationPlayed(true)

      // Call onComplete after animation finishes
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 3000)
    }
  }, [showFinalResult, animationPlayed, onComplete])

  // Start animation automatically
  useEffect(() => {
    if (!autoPlay || animationPlayed) return

    let counter = 0
    const maxTicks = 15

    const interval = setInterval(() => {
      // Random numbers 0-9
      setCurrentNumber(Math.floor(Math.random() * 10).toString())

      counter++

      if (counter >= maxTicks) {
        clearInterval(interval)
        setCurrentNumber(result)
        setTimeout(() => {
          setShowFinalResult(true)
        }, 300)
      }
    }, 120)

    return () => clearInterval(interval)
  }, [result, autoPlay, animationPlayed])

  // Function to manually play animation
  const playAnimation = () => {
    setAnimationPlayed(false)
    setShowFinalResult(false)
    setCurrentNumber(null)

    let counter = 0
    const maxTicks = 15

    const interval = setInterval(() => {
      // Random numbers 0-9
      setCurrentNumber(Math.floor(Math.random() * 10).toString())

      counter++

      if (counter >= maxTicks) {
        clearInterval(interval)
        setCurrentNumber(result)
        setTimeout(() => {
          setShowFinalResult(true)
        }, 300)
      }
    }, 120)
  }

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center'>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='absolute inset-0 bg-primary/10 rounded-full'
        />

        <AnimatePresence mode='wait'>
          {currentNumber !== null && (
            <motion.div
              key={currentNumber}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='text-4xl sm:text-6xl font-bold'
            >
              {currentNumber}
            </motion.div>
          )}
        </AnimatePresence>

        {showFinalResult && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.5, 1] }}
              className='absolute inset-0 border-4 border-primary rounded-full'
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className='absolute -top-3 -right-3'
            >
              <Trophy className='h-8 w-8 text-amber-500' />
            </motion.div>
          </>
        )}
      </div>

      {!autoPlay && (
        <motion.button
          onClick={playAnimation}
          className='mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Xem lại kết quả
        </motion.button>
      )}
    </div>
  )
}
