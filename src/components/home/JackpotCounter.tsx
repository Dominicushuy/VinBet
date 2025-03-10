// src/components/home/JackpotCounter.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface JackpotCounterProps {
  value: number
  className?: string
}

export function JackpotCounter({ value, className }: JackpotCounterProps) {
  const [jackpot, setJackpot] = useState(value)

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increase jackpot every few seconds
      setJackpot((prev) => prev + Math.floor(Math.random() * 10000))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const formattedValue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(jackpot)

  return <div className={cn('font-bold', className)}>{formattedValue}</div>
}
