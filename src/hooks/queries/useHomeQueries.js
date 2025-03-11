// src/hooks/queries/useHomeQueries.js
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/utils/fetchUtils'

// Query hook cho danh sách game đang hoạt động
export function useActiveGamesQuery() {
  return useQuery({
    queryKey: ['games', 'active'],
    queryFn: async () => {
      const response = await fetchData('/api/game-rounds/active')
      return response.active || []
    },
    refetchInterval: 30000 // Auto refresh mỗi 30 giây
  })
}

// Query hook cho danh sách game sắp diễn ra
export function useUpcomingGamesQuery() {
  return useQuery({
    queryKey: ['games', 'upcoming'],
    queryFn: async () => {
      const response = await fetchData('/api/games/upcoming')
      return response.gameRounds || []
    }
  })
}

// Query hook cho danh sách game phổ biến
export function usePopularGamesQuery() {
  return useQuery({
    queryKey: ['games', 'popular'],
    queryFn: async () => {
      const response = await fetchData('/api/games/popular')
      return response.gameRounds || []
    }
  })
}

// Query hook cho danh sách game jackpot
export function useJackpotGamesQuery() {
  return useQuery({
    queryKey: ['games', 'jackpot'],
    queryFn: async () => {
      const response = await fetchData('/api/games/jackpot-games')
      return response.gameRounds || []
    }
  })
}

// Query hook cho jackpot amount
export function useJackpotQuery(initialValue) {
  return useQuery({
    queryKey: ['jackpot'],
    queryFn: async () => {
      try {
        const response = await fetchData('/api/games/jackpot')
        return response.jackpotAmount
      } catch (error) {
        console.error('Error fetching jackpot:', error)
        return initialValue || 100000000
      }
    },
    refetchInterval: 60000, // Refetch mỗi phút
    initialData: initialValue
  })
}

// Query hook cho danh sách người thắng gần đây
export function useRecentWinnersQuery(initialWinners) {
  const hasInitialData = !!initialWinners && initialWinners.length > 0

  return useQuery({
    queryKey: ['winners', 'recent'],
    queryFn: async () => {
      if (hasInitialData) return initialWinners
      try {
        const response = await fetchData('/api/games/winners/recent')
        return response.winners || []
      } catch (error) {
        console.error('Error fetching winners:', error)
        return []
      }
    },
    enabled: !hasInitialData,
    refetchInterval: 300000, // Refetch mỗi 5 phút
    initialData: initialWinners
  })
}

// Hook tổng hợp để truy vấn game theo loại
export function useGamesByTypeQuery(type) {
  return useQuery({
    queryKey: ['games', type],
    queryFn: async () => {
      switch (type) {
        case 'active': {
          const response = await fetchData('/api/game-rounds/active')
          return response.active || []
        }
        case 'upcoming': {
          const response = await fetchData('/api/games/upcoming')
          return response.gameRounds || []
        }
        case 'popular': {
          const response = await fetchData('/api/games/popular')
          return response.gameRounds || []
        }
        case 'jackpot': {
          const response = await fetchData('/api/games/jackpot-games')
          return response.gameRounds || []
        }
        default:
          return []
      }
    },
    refetchInterval: type === 'active' ? 30000 : false // Auto refresh cho active games
  })
}
