export async function fetcher(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

export const apiService = {
  get: url => fetcher(url),
  post: (url, data) =>
    fetcher(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),
  put: (url, data) => fetcher(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: url => fetcher(url, { method: 'DELETE' }),

  games: {
    getActiveGames: () => fetcher('/api/game-rounds/active'),
    getGameRounds: params => {
      const queryString = new URLSearchParams()
      if (params?.status) queryString.append('status', params.status)
      if (params?.fromDate) queryString.append('fromDate', params.fromDate)
      if (params?.toDate) queryString.append('toDate', params.toDate)
      if (params?.page) queryString.append('page', params.page.toString())
      if (params?.pageSize) queryString.append('pageSize', params.pageSize.toString())
      if (params?.sortBy) queryString.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder)
      if (params?.jackpotOnly) queryString.append('jackpotOnly', params.jackpotOnly.toString())

      return fetcher(`/api/game-rounds?${queryString}`)
    },
    getGameRound: id => fetcher(`/api/game-rounds/${id}`),
    createGameRound: data =>
      fetcher('/api/game-rounds', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateGameRound: (id, data) =>
      fetcher(`/api/game-rounds/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    getGameRoundResults: async id => {
      const response = await fetch(`/api/game-rounds/${id}/results`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể lấy kết quả lượt chơi')
      }
      return response.json()
    },
    getGameRoundWinners: async id => {
      const response = await fetch(`/api/game-rounds/${id}/winners`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Không thể lấy danh sách người thắng')
      }
      return response.json()
    },
    getJackpotAmount: async () => {
      return fetcher('/api/games/jackpot')
    },
    getPopularGames: () => fetcher('/api/games/popular'),
    getJackpotGames: () => fetcher('/api/games/jackpot-games'),
    getUpcomingGames: () => fetcher('/api/games/upcoming'),
    getRecentWinners: () => fetcher('/api/games/winners/recent')
  },

  transactions: {
    getTransactions: async params => {
      const queryString = new URLSearchParams()
      if (params?.type) queryString.append('type', params.type)
      if (params?.status) queryString.append('status', params.status)
      if (params?.startDate) queryString.append('startDate', params.startDate)
      if (params?.endDate) queryString.append('endDate', params.endDate)
      if (params?.page) queryString.append('page', params.page.toString())
      if (params?.pageSize) queryString.append('pageSize', params.pageSize.toString())

      return fetcher(`/api/transactions?${queryString}`)
    },

    getTransactionSummary: async params => {
      const queryString = new URLSearchParams()
      if (params?.startDate) queryString.append('startDate', params.startDate)
      if (params?.endDate) queryString.append('endDate', params.endDate)

      return fetcher(`/api/transactions/summary?${queryString}`)
    }
  },

  profile: {
    getUserStats: () => fetcher('/api/profile/stats'),
    updateAvatar: formData =>
      fetch('/api/profile/avatar', { method: 'POST', body: formData }).then(res => {
        if (!res.ok) throw new Error('Failed to upload avatar')
        return res.json()
      }),
    changePassword: data =>
      fetcher('/api/profile/change-password', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  statistics: {
    getPlatformStatistics: async () => {
      return fetcher('/api/statistics/platform')
    }
  }
}
