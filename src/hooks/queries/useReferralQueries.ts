// src/hooks/queries/useReferralQueries.ts
import { useQuery } from "@tanstack/react-query";

// Query keys
export const REFERRAL_QUERY_KEYS = {
  code: ["referrals", "code"],
  stats: ["referrals", "stats"],
  list: (params?: any) => ["referrals", "list", { ...params }],
};

// API functions
const referralApi = {
  // Lấy mã giới thiệu
  getReferralCode: async () => {
    const response = await fetch("/api/referrals/code");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy mã giới thiệu");
    }
    return response.json();
  },

  // Lấy thống kê giới thiệu
  getReferralStats: async () => {
    const response = await fetch("/api/referrals/stats");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy thống kê giới thiệu");
    }
    return response.json();
  },

  // Lấy danh sách người được giới thiệu
  getReferralsList: async (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) => {
    let url = "/api/referrals/list";

    // Add query parameters if provided
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append("status", params.status);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy danh sách giới thiệu");
    }
    return response.json();
  },
};

// Queries
export function useReferralCodeQuery() {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.code,
    queryFn: referralApi.getReferralCode,
  });
}

export function useReferralStatsQuery() {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.stats,
    queryFn: referralApi.getReferralStats,
  });
}

export function useReferralsListQuery(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: REFERRAL_QUERY_KEYS.list(params),
    queryFn: () => referralApi.getReferralsList(params),
  });
}
