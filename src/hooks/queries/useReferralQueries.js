// src/hooks/queries/useReferralQueries.js
import { useQuery } from '@tanstack/react-query'
import { fetchData, buildQueryString } from '@/utils/fetchUtils'

// Query keys
export const REFERRAL_QUERY_KEYS = {
  code: ['referrals', 'code'],
  stats: ['referrals', 'stats'],
  list: params => ['referrals', 'list', { ...params }]
}

// API functions
const referralApi = {
  // Lấy mã giới thiệu
  getReferralCode: async () => {
    return fetchData('/api/referrals/code')
  },

  // Lấy thống kê giới thiệu
  getReferralStats: async () => {
    return fetchData('/api/referrals/stats')
  },

  // Lấy danh sách người được giới thiệu
  getReferralsList: async params => {
    const queryString = buildQueryString({
      status: params?.status,
      page: params?.page,
      pageSize: params?.pageSize
    })

    return fetchData(`/api/referrals/list${queryString}`)
  }
}

// Queries
export function useReferralCodeQuery() {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.code,
    queryFn: referralApi.getReferralCode
  })
}

export function useReferralStatsQuery() {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.stats,
    queryFn: referralApi.getReferralStats
  })
}

export function useReferralsListQuery(params) {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.list(params),
    queryFn: () => referralApi.getReferralsList(params)
  })
}
