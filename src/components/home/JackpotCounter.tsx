// src/components/home/JackpotCounter.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import { Skeleton } from '@/components/ui/skeleton'

interface JackpotCounterProps {
  initialValue: number
  className?: string
  animationSpeed?: 'slow' | 'normal' | 'fast'
}

export function JackpotCounter({
  initialValue,
  className,
  animationSpeed = 'normal',
}: JackpotCounterProps) {
  const [displayedValue, setDisplayedValue] = useState(initialValue || 10000000)
  const actualValueRef = useRef(initialValue || 10000000)
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Xác định tốc độ cập nhật giá trị hiển thị dựa vào animation speed
  const getAnimationInterval = () => {
    switch (animationSpeed) {
      case 'slow':
        return 5000
      case 'fast':
        return 1000
      default:
        return 3000
    }
  }

  // Xác định mức tăng dựa vào giá trị hiện tại
  const getIncrementAmount = () => {
    const value = actualValueRef.current
    if (value < 1000000) return Math.floor(Math.random() * 100) + 50
    if (value < 10000000) return Math.floor(Math.random() * 1000) + 500
    if (value < 100000000) return Math.floor(Math.random() * 5000) + 1000
    return Math.floor(Math.random() * 10000) + 5000
  }

  // Lấy jackpot mới mỗi phút
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jackpot'],
    queryFn: async () => {
      try {
        const response = await apiService.games.getJackpotAmount()
        return response.jackpotAmount
      } catch (error) {
        console.error('Error fetching jackpot:', error)
        return null
      }
    },
    refetchInterval: 60000, // Refetch mỗi phút
    enabled: true,
    // Không cập nhật state ngay lập tức, để có thể xử lý animation
    notifyOnChangeProps: ['data'],
  })

  // Cập nhật giá trị thật khi có dữ liệu mới từ API
  useEffect(() => {
    if (data && data !== actualValueRef.current) {
      actualValueRef.current = data
    }
  }, [data])

  // Thiết lập animation tăng dần để tạo cảm giác sống động
  useEffect(() => {
    // Hàm cập nhật giá trị hiển thị
    const updateDisplayValue = () => {
      const currentValue = actualValueRef.current
      setDisplayedValue((prev) => {
        // Nếu giá trị hiển thị gần bằng giá trị thật, thêm một chút
        if (Math.abs(prev - currentValue) < 10000) {
          return currentValue + getIncrementAmount()
        }

        // Nếu giá trị hiển thị nhỏ hơn giá trị thật, tăng dần lên
        if (prev < currentValue) {
          return prev + Math.ceil((currentValue - prev) / 10)
        }

        // Nếu giá trị hiển thị lớn hơn giá trị thật, giảm dần xuống
        return (
          prev - Math.ceil((prev - currentValue) / 20) + getIncrementAmount()
        )
      })
    }

    // Thiết lập interval để chạy animation
    animationIntervalRef.current = setInterval(
      updateDisplayValue,
      getAnimationInterval()
    )

    // Cleanup khi component unmount
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
  }, [animationSpeed])

  // Hiển thị skeleton khi đang loading lần đầu
  if (isLoading && !initialValue) {
    return <Skeleton className={cn('h-8 w-40', className)} />
  }

  // Format tiền Việt Nam
  const formattedValue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(displayedValue)

  return (
    <div
      className={cn('font-bold transition-all', className, {
        'animate-pulse': isError,
      })}>
      {formattedValue}
    </div>
  )
}
