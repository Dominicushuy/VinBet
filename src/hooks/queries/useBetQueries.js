// src/hooks/queries/useBetQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// Query keys
export const BET_QUERY_KEYS = {
  userBets: params => ['bets', 'user', { ...params }],
  gameRoundBets: gameRoundId => ['bets', 'gameRound', gameRoundId]
}

// API functions
const betApi = {
  // Đặt cược mới
  placeBet: async ({ gameRoundId, chosenNumber, amount }) => {
    const response = await fetch(`/api/game-rounds/${gameRoundId}/bets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chosenNumber,
        amount
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Đặt cược thất bại')
    }

    return response.json()
  },

  // Lấy cược của người dùng hiện tại
  getUserBets: async params => {
    let url = params && params.gameRoundId ? `/api/game-rounds/${params.gameRoundId}/my-bets` : '/api/bets'

    if (params && params.status) {
      url += `?status=${params.status}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể lấy danh sách cược')
    }

    return response.json()
  }
}

// Queries
export function useUserBetsQuery(params) {
  return useQuery({
    queryKey: BET_QUERY_KEYS.userBets(params),
    queryFn: () => betApi.getUserBets(params)
  })
}

// Mutations
export function usePlaceBetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: betApi.placeBet,
    onSuccess: (data, variables) => {
      toast.success('Đặt cược thành công!')
      queryClient.invalidateQueries({
        queryKey: BET_QUERY_KEYS.userBets({
          gameRoundId: variables.gameRoundId
        })
      })
      queryClient.invalidateQueries({
        queryKey: ['profile', 'stats']
      })
      queryClient.invalidateQueries({
        queryKey: ['auth', 'profile']
      })
    },
    onError: error => {
      toast.error(error.message || 'Đặt cược thất bại')
    }
  })
}
