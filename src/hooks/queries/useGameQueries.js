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
  gameRoundWinners: id => ['games', 'winners', id],
  gameBets: id => ['games', 'bets', id]
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
  },

  getGameBets: async id => {
    return fetchData(`/api/game-rounds/${id}/bets`)
  },

  getRelatedGames: async (id, status, limit) => {
    return fetchData(`/api/game-rounds/related?id=${id}&status=${status}&limit=${limit}`)
  }
}

// Queries
// Cập nhật hàm useGameDetailQuery để hỗ trợ refetch interval cho game active
export function useGameDetailQuery(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameDetail(id),
    queryFn: () => gameApi.getGameRound(id),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchInterval: data =>
      // Auto refetch nếu game đang active
      data?.gameRound?.status === 'active' ? 30000 : false
  })
}

export function useActiveGamesQuery() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.activeGames,
    queryFn: () => gameApi.getActiveGames(),
    refetchInterval: 60000, // 1 minute
    staleTime: 30000 // 30 seconds
  })
}

export function useGameRoundsQuery(params) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gamesList(params),
    queryFn: () => gameApi.getGameRounds(params),
    keepPreviousData: true,
    staleTime: 30000, // Cache 30 seconds
    refetchOnWindowFocus: false, // Tránh refetch khi focus lại window
    retry: 1 // Chỉ retry 1 lần nếu lỗi
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
    onSuccess: async (_, variables) => {
      toast.success('Kết quả đã được cập nhật thành công')

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gameDetail(variables.gameId)
      })

      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gamesList()
      })

      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.activeGames
      })

      // Gửi thông báo Telegram cho người trúng thưởng
      try {
        // Lấy danh sách người thắng cuộc
        const winners = await fetchData(`/api/game-rounds/${variables.gameId}/winners`)

        if (winners && winners.winners && winners.winners.length > 0) {
          // Gửi thông báo cho từng người thắng
          winners.winners.forEach(winner => {
            // Kiểm tra profile tồn tại
            if (winner.profiles && winner.profiles.id) {
              postData('/api/telegram/send', {
                notificationType: 'win',
                userId: winner.profiles.id,
                amount: winner.potential_win,
                gameId: variables.gameId,
                betInfo: {
                  chosenNumber: winner.chosen_number,
                  result: variables.data.result
                }
              }).catch(error => {
                console.error('Failed to send win notification:', error)
              })
            }
          })
        }
      } catch (error) {
        console.error('Error fetching winners for notifications:', error)
      }
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật kết quả')
    }
  })
}

export function useGameBetsQuery(id) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gameBets(id),
    queryFn: () => gameApi.getGameBets(id),
    enabled: !!id
  })
}

export function useRelatedGamesQuery(id, status, limit) {
  return useQuery({
    queryKey: ['games', 'related', id, status],
    queryFn: () => gameApi.getRelatedGames(id, status, limit + 2),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
