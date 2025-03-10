// src/components/bet/BetSuccessAnimation.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Share2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BetSuccessAnimationProps {
  betId: string
  amount: number
  potentialWin: number
  chosenNumber: string
  onDismiss: () => void
  gameId: string
}

export default function BetSuccessAnimation({
  betId,
  amount,
  potentialWin,
  chosenNumber,
  onDismiss,
  gameId,
}: BetSuccessAnimationProps) {
  const [showCard, setShowCard] = useState(false)

  useEffect(() => {
    // Show card after a small delay
    const timer = setTimeout(() => {
      setShowCard(true)
    }, 300)

    // Auto dismiss after 6 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss()
    }, 6000)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [])

  const handleDismiss = () => {
    setShowCard(false)
    // Wait for exit animation before calling onDismiss
    setTimeout(onDismiss, 300)
  }

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tôi vừa đặt cược trên VinBet!',
        text: `Tôi vừa đặt cược ${formatCurrency(
          amount
        )} vào số ${chosenNumber}. Chơi cùng tôi!`,
        url: `/games/${gameId}`,
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)
  }

  return (
    <AnimatePresence>
      {showCard && (
        <motion.div
          className='fixed inset-0 flex items-center justify-center z-50 px-4 bg-black/50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}>
          <motion.div
            className='bg-card border rounded-lg shadow-xl w-full max-w-md overflow-hidden'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}>
            {/* Success animation */}
            <div className='p-6 bg-gradient-to-br from-primary/20 to-green-500/10'>
              <div className='text-center'>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                  className='inline-flex rounded-full bg-green-100 p-3 text-green-600 mb-4'>
                  <CheckCircle className='h-10 w-10' />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className='text-xl font-semibold mb-1'>
                  Đặt cược thành công!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className='text-sm text-muted-foreground'>
                  Cược của bạn đã được ghi nhận thành công
                </motion.p>
              </div>
            </div>

            {/* Bet details */}
            <div className='p-6'>
              <div className='mb-4 space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Mã cược:
                  </span>
                  <span className='font-medium'>#{betId.substring(0, 8)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Số đã chọn:
                  </span>
                  <span className='font-bold text-primary text-lg'>
                    {chosenNumber}
                  </span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Số tiền cược:
                  </span>
                  <span className='font-medium'>{formatCurrency(amount)}</span>
                </div>

                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Tiền thưởng tiềm năng:
                  </span>
                  <span className='font-bold text-green-600'>
                    {formatCurrency(potentialWin)}
                  </span>
                </div>
              </div>

              <div className='pt-2 flex gap-2'>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={shareResult}>
                  <Share2 className='mr-2 h-4 w-4' />
                  Chia sẻ
                </Button>
                <Button className='flex-1' onClick={handleDismiss}>
                  Tiếp tục
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
