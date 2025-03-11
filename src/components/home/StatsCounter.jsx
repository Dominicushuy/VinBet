'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function StatsCounter({ icon, label, value, prefix = '', suffix = '', isMonetary = false }) {
  const [count, setCount] = useState(0)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  const startValueRef = useRef(0)
  const endValueRef = useRef(value)

  useEffect(() => {
    startValueRef.current = count
    endValueRef.current = value
    startTimeRef.current = null

    const animate = timestamp => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = timestamp - startTimeRef.current
      const duration = 2000 // 2 seconds

      if (elapsed < duration) {
        const progress = elapsed / duration
        // Easing function for smoother animation
        const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

        const currentValue = startValueRef.current + (endValueRef.current - startValueRef.current) * easedProgress

        setCount(Math.floor(currentValue))
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCount(endValueRef.current)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value])

  const formattedValue = isMonetary
    ? new Intl.NumberFormat('vi-VN').format(count)
    : new Intl.NumberFormat().format(count)

  return (
    <Card className='bg-card/50 transition-all hover:translate-y-[-5px]'>
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
