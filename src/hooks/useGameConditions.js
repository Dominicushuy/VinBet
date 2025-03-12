import { useMemo } from 'react'

export function useGameConditions(game, timeInfo) {
  // Kiểm tra các điều kiện tương tác với game
  const canSetResult = useMemo(
    () => game?.status === 'active' && timeInfo.isExpired,
    [game?.status, timeInfo.isExpired]
  )

  const canActivate = useMemo(
    () => game?.status === 'scheduled' && timeInfo.canStart,
    [game?.status, timeInfo.canStart]
  )

  const canCancel = useMemo(() => game?.status !== 'completed' && game?.status !== 'cancelled', [game?.status])

  return {
    canSetResult,
    canActivate,
    canCancel
  }
}
