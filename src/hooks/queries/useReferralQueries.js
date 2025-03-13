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

// Hook mặc định configs
const defaultOptions = {
  code: {
    staleTime: 60 * 1000, // 1 phút
    cacheTime: 5 * 60 * 1000, // 5 phút
    retry: 2
  },
  stats: {
    staleTime: 30 * 1000, // 30 giây
    cacheTime: 2 * 60 * 1000, // 2 phút
    retry: 2
  },
  list: {
    staleTime: 30 * 1000, // 30 giây
    cacheTime: 2 * 60 * 1000, // 2 phút
    retry: 1
  }
}

// Queries
export function useReferralCodeQuery(options = {}) {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.code,
    queryFn: referralApi.getReferralCode,
    ...defaultOptions.code,
    ...options,
    onError: error => {
      console.error('Error fetching referral code:', error)
      options.onError?.(error)
    }
  })
}

export function useReferralStatsQuery(options = {}) {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.stats,
    queryFn: referralApi.getReferralStats,
    ...defaultOptions.stats,
    ...options,
    onError: error => {
      console.error('Error fetching referral stats:', error)
      options.onError?.(error)
    }
  })
}

export function useReferralsListQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.list(params),
    queryFn: () => referralApi.getReferralsList(params),
    ...defaultOptions.list,
    ...options,
    onError: error => {
      console.error('Error fetching referrals list:', error)
      options.onError?.(error)
    }
  })
}
