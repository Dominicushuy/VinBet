// src/hooks/queries/useGameQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData, putData, buildQueryString } from '@/utils/fetchUtils'
import { toast } from 'react-hot-toast'
import { adminApi } from './useAdminQueries'

// Query keys
export const GAME_QUERY_KEYS = {
  activeGames: ['games', 'active'],
  gamesList: filters => ['games', 'list', { ...filters }],
  gameDetail: id => ['games', 'detail', id],
  gameRoundResults: id => ['games', 'results', id],
  gameRoundWinners: id => ['games', 'winners', id]
}

// API functions
const gameApi = {
  // Get game detail
  getGameRound: async id => {
    return fetchData(`/api/game-rounds/${id}`)
  },

  // Get active games
  getActiveGames: async () => {
    return fetchData('/api/game-rounds/active')
  },

  // Get game rounds with filters
  getGameRounds: async params => {
    const queryString = buildQueryString({
      status: params?.status,
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      page: params?.page,
      pageSize: params?.pageSize,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
      jackpotOnly: params?.jackpotOnly
    })

    return fetchData(`/api/game-rounds${queryString}`)
  },

  // Create new game round
  createGameRound: async data => {
    return postData('/api/game-rounds', data)
  },

  // Update game round
  updateGameRound: async (id, data) => {
    return putData(`/api/game-rounds/${id}`, data)
  },

  // Get game round results
  getGameRoundResults: async id => {
    return fetchData(`/api/game-rounds/${id}/results`)
  },

  // Get game round winners
  getGameRoundWinners: async id => {
    return fetchData(`/api/game-rounds/${id}/winners`)
  }
}

// Queries
export function useGameDetailQuery(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameDetail(id),
    queryFn: () => gameApi.getGameRound(id),
    enabled: !!id
  })
}

export function useActiveGamesQuery() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.activeGames,
    queryFn: () => gameApi.getActiveGames(),
    refetchInterval: 60000 // 1 minute
  })
}

export function useGameRoundsQuery(params) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gamesList(params),
    queryFn: () => gameApi.getGameRounds(params),
    keepPreviousData: true
  })
}

export function useGameRoundResults(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameRoundResults(id),
    queryFn: () => gameApi.getGameRoundResults(id),
    enabled: !!id
  })
}

export function useGameRoundWinners(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameRoundWinners(id),
    queryFn: () => gameApi.getGameRoundWinners(id),
    enabled: !!id
  })
}

export function useGameRoundResultsQuery(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameRoundResults(id),
    queryFn: () => gameApi.getGameRoundResults(id),
    enabled: !!id
  })
}

export function useGameRoundWinnersQuery(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameRoundWinners(id),
    queryFn: () => gameApi.getGameRoundWinners(id),
    enabled: !!id
  })
}

// Mutations
export function useCreateGameRoundMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => gameApi.createGameRound(data),
    onSuccess: () => {
      toast.success('Lượt chơi đã được tạo thành công')
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.activeGames })
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.gamesList() })
    },
    onError: error => {
      toast.error(error.message || 'Không thể tạo lượt chơi')
    }
  })
}

export function useUpdateGameRoundMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => gameApi.updateGameRound(id, data),
    onSuccess: (_, variables) => {
      toast.success('Lượt chơi đã được cập nhật thành công')
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.activeGames })
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.gamesList() })
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gameDetail(variables.id)
      })
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật lượt chơi')
    }
  })
}

export function useSetGameResultMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gameId, data }) => adminApi.setGameResult(gameId, data),
    onSuccess: (_, variables) => {
      toast.success('Kết quả đã được cập nhật thành công')
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gameDetail(variables.gameId)
      })
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.gamesList() })
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.activeGames })
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật kết quả')
    }
  })
}
