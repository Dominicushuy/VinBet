import { useMemo } from 'react'
import { useUpdateGameRoundMutation, useSetGameResultMutation } from '@/hooks/queries/useGameQueries'
import { formatDistance, isAfter } from 'date-fns'
import { vi } from 'date-fns/locale'

export function useGameMutations(game) {
  const updateGameMutation = useUpdateGameRoundMutation()
  const setResultMutation = useSetGameResultMutation()

  // Calculate time remaining or time until start
  const timeInfo = useMemo(() => {
    if (!game) return { text: '', isExpired: false, canStart: false }

    const now = new Date()

    if (game.status === 'active') {
      const endTime = new Date(game.end_time)
      const isExpired = isAfter(now, endTime)

      return {
        text: isExpired
          ? 'Đã hết thời gian'
          : `Kết thúc ${formatDistance(endTime, now, { locale: vi, addSuffix: true })}`,
        isExpired,
        canStart: false
      }
    }

    if (game.status === 'scheduled') {
      const startTime = new Date(game.start_time)
      const canStart = isAfter(now, startTime)

      return {
        text: canStart
          ? 'Có thể bắt đầu ngay'
          : `Bắt đầu ${formatDistance(startTime, now, { locale: vi, addSuffix: true })}`,
        isExpired: false,
        canStart
      }
    }

    return { text: '', isExpired: false, canStart: false }
  }, [game])

  return {
    updateGameMutation,
    setResultMutation,
    timeInfo
  }
}
