// src/components/home/JackpotCounter.tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'

interface JackpotCounterProps {
  initialValue: number
  className?: string
}

export function JackpotCounter({
  initialValue,
  className,
}: JackpotCounterProps) {
  const [jackpot, setJackpot] = useState(initialValue)

  // Lấy jackpot mới mỗi phút
  const { data } = useQuery({
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
  })

  useEffect(() => {
    // Cập nhật giá trị jackpot khi có dữ liệu mới
    if (data) {
      setJackpot(data)
    }
  }, [data])

  useEffect(() => {
    // Animation tăng jackpot nhẹ mỗi 3 giây để tạo cảm giác
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 5000))
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
