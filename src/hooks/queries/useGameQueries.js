// src/hooks/queries/useGameQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData, buildQueryString } from '@/utils/fetchUtils'

/**
 * Hook để lấy thông tin chi tiết của game
 */
export function useGameDetailQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!gameId) return null
      const response = await fetchData(`/api/game-rounds/${gameId}`)
      return response || null
    },
    enabled: !!gameId,
    ...options
  })
}

/**
 * Hook để lấy danh sách game rounds với các bộ lọc
 */
export function useGameRoundsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: ['games', 'rounds', params],
    queryFn: async () => {
      const queryString = buildQueryString(params)
      const response = await fetchData(`/api/game-rounds${queryString}`)
      return response || { gameRounds: [], totalCount: 0 }
    },
    ...options
  })
}

/**
 * Hook để lấy danh sách cược của người dùng trong một game
 */
export function useUserGameBetsQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['game', gameId, 'bets', 'user'],
    queryFn: async () => {
      if (!gameId) return []
      const response = await fetchData(`/api/game-rounds/${gameId}/my-bets`)
      return response.bets || []
    },
    enabled: !!gameId,
    ...options
  })
}

/**
 * Hook để lấy danh sách tất cả cược trong một game (admin)
 */
export function useAllGameBetsQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['game', gameId, 'bets', 'all'],
    queryFn: async () => {
      if (!gameId) return []
      const response = await fetchData(`/api/game-rounds/${gameId}/bets`)
      return response.bets || []
    },
    enabled: !!gameId,
    ...options
  })
}

/**
 * Hook để đặt cược
 */
export function usePlaceBetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ gameId, betData }) => {
      return await postData(`/api/game-rounds/${gameId}/bets`, betData)
    },
    onSuccess: (_, variables) => {
      // Invalidate các queries liên quan để cập nhật dữ liệu
      queryClient.invalidateQueries({ queryKey: ['game', variables.gameId, 'bets'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] }) // Cập nhật số dư
    }
  })
}

/**
 * Hook để lấy kết quả của game
 */
export function useGameResultsQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['game', gameId, 'results'],
    queryFn: async () => {
      if (!gameId) return null
      const response = await fetchData(`/api/game-rounds/${gameId}/results`)
      return response || null
    },
    enabled: !!gameId,
    ...options
  })
}

/**
 * Hook để lấy danh sách người thắng trong game
 */
export function useGameWinnersQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['game', gameId, 'winners'],
    queryFn: async () => {
      if (!gameId) return []
      const response = await fetchData(`/api/game-rounds/${gameId}/winners`)
      return response.winners || []
    },
    enabled: !!gameId,
    ...options
  })
}

/**
 * Hook để lấy leaderboard của game
 */
export function useGameLeaderboardQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['game', gameId, 'leaderboard'],
    queryFn: async () => {
      if (!gameId) return { topBets: [], topWinners: [] }
      const response = await fetchData(`/api/games/${gameId}/leaderboard`)
      return response || { topBets: [], topWinners: [] }
    },
    enabled: !!gameId,
    ...options
  })
}

/**
 * Hook để lấy các game liên quan
 */
export function useRelatedGamesQuery(gameId, options = {}) {
  return useQuery({
    queryKey: ['games', 'related', gameId],
    queryFn: async () => {
      if (!gameId) return []
      const response = await fetchData(`/api/games/related?id=${gameId}`)
      return response.gameRounds || []
    },
    enabled: !!gameId,
    ...options
  })
}
