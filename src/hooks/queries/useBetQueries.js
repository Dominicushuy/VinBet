// src/hooks/queries/useBetQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData, buildQueryString } from '@/utils/fetchUtils'

// Query keys
export const BET_QUERY_KEYS = {
  userBets: params => ['bets', 'user', { ...params }],
  gameRoundBets: gameRoundId => ['bets', 'gameRound', gameRoundId]
}

// API functions
const betApi = {
  // Đặt cược mới
  placeBet: async ({ gameRoundId, chosenNumber, amount }) => {
    return postData(`/api/game-rounds/${gameRoundId}/bets`, {
      chosenNumber,
      amount
    })
  },

  // Lấy cược của người dùng hiện tại
  getUserBets: async params => {
    if (params && params.gameRoundId) {
      const queryString = params.status ? buildQueryString({ status: params.status }) : ''
      return fetchData(`/api/game-rounds/${params.gameRoundId}/my-bets${queryString}`)
    } else {
      const queryString = params?.status ? buildQueryString({ status: params.status }) : ''
      return fetchData(`/api/bets${queryString}`)
    }
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
