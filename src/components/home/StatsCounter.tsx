// src/components/home/StatsCounter.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCounterProps {
  icon: React.ReactNode
  label: string
  value: number
  prefix?: string
  suffix?: string
  isMonetary?: boolean
}

export function StatsCounter({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  isMonetary = false,
}: StatsCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const frameRate = 30
    const frames = duration / (1000 / frameRate)
    const increment = value / frames
    let currentCount = 0

    const timer = setInterval(() => {
      currentCount += increment
      if (currentCount >= value) {
        clearInterval(timer)
        setCount(value)
      } else {
        setCount(Math.floor(currentCount))
      }
    }, 1000 / frameRate)

    return () => clearInterval(timer)
  }, [value])

  const formattedValue = isMonetary
    ? new Intl.NumberFormat('vi-VN').format(count)
    : new Intl.NumberFormat().format(count)

  return (
    <Card className='bg-card/50 transition-transform hover:translate-y-[-5px]'>
      <CardContent className='p-6'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-3 p-3 bg-primary/10 rounded-full'>{icon}</div>
          <h3 className='text-2xl sm:text-3xl font-bold mb-1'>
            {prefix}
            {formattedValue}
            {suffix}
          </h3>
          <p className='text-muted-foreground'>{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
