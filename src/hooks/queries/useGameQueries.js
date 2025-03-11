// src/hooks/queries/useGameQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import { toast } from 'react-hot-toast'

// Query keys
export const GAME_QUERY_KEYS = {
  activeGames: ['games', 'active'],
  gamesList: filters => ['games', 'list', { ...filters }],
  gameDetail: id => ['games', 'detail', id],
  gameRoundResults: id => ['games', 'results', id],
  gameRoundWinners: id => ['games', 'winners', id]
}

// Queries
export function useGameDetailQuery(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameDetail(id),
    queryFn: () => apiService.games.getGameRound(id),
    enabled: !!id
  })
}

export function useActiveGamesQuery() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.activeGames,
    queryFn: () => apiService.games.getActiveGames(),
    refetchInterval: 60000 // 1 minute
  })
}

export function useGameRoundsQuery(params) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gamesList(params),
    queryFn: () => apiService.games.getGameRounds(params),
    keepPreviousData: true
  })
}

export function useGameRoundResults(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameRoundResults(id),
    queryFn: () => apiService.games.getGameRoundResults(id),
    enabled: !!id
  })
}

export function useGameRoundWinners(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameRoundWinners(id),
    queryFn: () => apiService.games.getGameRoundWinners(id),
    enabled: !!id
  })
}

// Mutations
export function useCreateGameRoundMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => apiService.games.createGameRound(data),
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
    mutationFn: ({ id, data }) => apiService.games.updateGameRound(id, data),
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
