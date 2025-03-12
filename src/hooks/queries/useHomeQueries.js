// src/hooks/queries/useHomeQueries.js
import { useQuery } from '@tanstack/react-query'
import { fetchData, buildQueryString } from '@/utils/fetchUtils'

// Query keys
export const HOME_QUERY_KEYS = {
  upcomingGames: ['games', 'upcoming'],
  popularGames: ['games', 'popular'],
  jackpotGames: ['games', 'jackpot-games'],
  jackpotAmount: ['jackpot'],
  recentWinners: ['winners', 'recent'],
  gamesByType: type => ['games', type]
}

// API functions
const homeApi = {
  // Get upcoming games
  getUpcomingGames: async () => {
    return fetchData('/api/games/upcoming')
  },

  // Get popular games
  getPopularGames: async () => {
    return fetchData('/api/games/popular')
  },

  // Get jackpot games
  getJackpotGames: async () => {
    return fetchData('/api/games/jackpot-games')
  },

  // Get jackpot amount
  getJackpotAmount: async () => {
    return fetchData('/api/games/jackpot')
  },

  // Get recent winners
  getRecentWinners: async () => {
    return fetchData('/api/games/winners/recent')
  },

  // Get active games
  getActiveGames: async () => {
    return fetchData('/api/game-rounds/active')
  },

  // Get games by type
  getGamesByType: async type => {
    switch (type) {
      case 'active':
        return fetchData('/api/game-rounds/active')
      case 'upcoming':
        return fetchData('/api/games/upcoming')
      case 'popular':
        return fetchData('/api/games/popular')
      case 'jackpot':
        return fetchData('/api/games/jackpot-games')
      default:
        return { gameRounds: [] }
    }
  }
}

// Query hooks
export function useUpcomingGamesQuery() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.upcomingGames,
    queryFn: async () => {
      const response = await homeApi.getUpcomingGames()
      return response.gameRounds || []
    }
  })
}

export function usePopularGamesQuery() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.popularGames,
    queryFn: async () => {
      const response = await homeApi.getPopularGames()
      return response.gameRounds || []
    }
  })
}

export function useJackpotGamesQuery() {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.jackpotGames,
    queryFn: async () => {
      const response = await homeApi.getJackpotGames()
      return response.gameRounds || []
    }
  })
}

export function useJackpotQuery(initialValue) {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.jackpotAmount,
    queryFn: async () => {
      try {
        const response = await homeApi.getJackpotAmount()
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

export function useRecentWinnersQuery(initialWinners) {
  const hasInitialData = !!initialWinners && initialWinners.length > 0

  return useQuery({
    queryKey: HOME_QUERY_KEYS.recentWinners,
    queryFn: async () => {
      if (hasInitialData) return initialWinners
      try {
        const response = await homeApi.getRecentWinners()
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

export function useActiveGamesQuery() {
  return useQuery({
    queryKey: ['games', 'active'],
    queryFn: async () => {
      const response = await homeApi.getActiveGames()
      return response.active || []
    },
    refetchInterval: 60000 // 1 minute
  })
}

export function useGamesByTypeQuery(type) {
  return useQuery({
    queryKey: HOME_QUERY_KEYS.gamesByType(type),
    queryFn: async () => {
      const response = await homeApi.getGamesByType(type)

      // Handle different response formats
      if (type === 'active' && response.active) {
        return response.active
      }

      return response.gameRounds || []
    },
    refetchInterval: type === 'active' ? 30000 : false // Auto refresh cho active games
  })
}
