// src/components/home/JackpotCounter.jsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useJackpotQuery } from '@/hooks/queries/useHomeQueries'
import { Skeleton } from '@/components/ui/skeleton'

export function JackpotCounter({ initialValue, className, animationSpeed = 'normal' }) {
  const [displayedValue, setDisplayedValue] = useState(initialValue || 10000000)
  const actualValueRef = useRef(initialValue || 10000000)
  const animationFrameRef = useRef(null)
  const lastUpdateTimeRef = useRef(0)

  // Xác định tốc độ cập nhật dựa vào animation speed
  const getUpdateInterval = useCallback(() => {
    switch (animationSpeed) {
      case 'slow':
        return 100 // 10 FPS
      case 'fast':
        return 16 // 60 FPS
      default:
        return 33 // 30 FPS
    }
  }, [animationSpeed])

  // Xác định mức tăng dựa vào giá trị hiện tại
  const getIncrementAmount = useCallback(() => {
    const value = actualValueRef.current
    if (value < 1000000) return Math.floor(Math.random() * 100) + 50
    if (value < 10000000) return Math.floor(Math.random() * 1000) + 500
    if (value < 100000000) return Math.floor(Math.random() * 5000) + 1000
    return Math.floor(Math.random() * 10000) + 5000
  }, [])

  // Use custom hook instead of direct API call
  const { data, isLoading, isError } = useJackpotQuery(initialValue)

  // Cập nhật giá trị thật khi có dữ liệu mới từ API
  useEffect(() => {
    if (data && data !== actualValueRef.current) {
      actualValueRef.current = data
    }
  }, [data])

  // Animation loop tối ưu với requestAnimationFrame
  useEffect(() => {
    const updateValue = timestamp => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastUpdateTimeRef.current
      const interval = getUpdateInterval()

      if (elapsed >= interval) {
        lastUpdateTimeRef.current = timestamp

        const currentValue = actualValueRef.current
        setDisplayedValue(prev => {
          // Logic tương tự như trước
          if (Math.abs(prev - currentValue) < 10000) {
            return currentValue + getIncrementAmount()
          }

          if (prev < currentValue) {
            return prev + Math.ceil((currentValue - prev) / 10)
          }

          return prev - Math.ceil((prev - currentValue) / 20) + getIncrementAmount()
        })
      }

      animationFrameRef.current = requestAnimationFrame(updateValue)
    }

    animationFrameRef.current = requestAnimationFrame(updateValue)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [getUpdateInterval, getIncrementAmount])

  // Hiển thị skeleton khi đang loading lần đầu
  if (isLoading && !initialValue) {
    return <Skeleton className={cn('h-8 w-40', className)} />
  }

  const formattedValue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(displayedValue)

  return (
    <div
      className={cn('font-bold transition-all', className, {
        'animate-pulse': isError
      })}
    >
      {formattedValue}
    </div>
  )
}
