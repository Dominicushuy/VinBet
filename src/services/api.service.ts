// src/services/api.service.ts
export async function fetcher<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export const apiService = {
  // Phương thức chung
  get: <T = any>(url: string) => fetcher<T>(url),
  post: <T = any, D = any>(url: string, data?: D) =>
    fetcher<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: <T = any, D = any>(url: string, data: D) =>
    fetcher<T>(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T = any>(url: string) => fetcher<T>(url, { method: "DELETE" }),

  // Game services
  games: {
    getActiveGames: () => fetcher("/api/game-rounds/active"),
    getGameRounds: (params?: {
      status?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      pageSize?: number;
    }) => {
      const queryString = new URLSearchParams();
      if (params?.status) queryString.append("status", params.status);
      if (params?.fromDate) queryString.append("fromDate", params.fromDate);
      if (params?.toDate) queryString.append("toDate", params.toDate);
      if (params?.page) queryString.append("page", params.page.toString());
      if (params?.pageSize)
        queryString.append("pageSize", params.pageSize.toString());

      return fetcher(`/api/game-rounds?${queryString}`);
    },
    createGameRound: (data: { startTime: string; endTime: string }) =>
      fetcher("/api/game-rounds", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateGameRound: (id: string, data: { status: string; result?: string }) =>
      fetcher(`/api/game-rounds/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    // Lấy kết quả của một lượt chơi
    getGameRoundResults: async (id: string) => {
      const response = await fetch(`/api/game-rounds/${id}/results`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể lấy kết quả lượt chơi");
      }
      return response.json();
    },

    // Lấy danh sách người thắng của một lượt chơi
    getGameRoundWinners: async (id: string) => {
      const response = await fetch(`/api/game-rounds/${id}/winners`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Không thể lấy danh sách người thắng"
        );
      }
      return response.json();
    },
  },

  // Profile services
  profile: {
    getUserStats: () => fetcher("/api/profile/stats"),
    updateAvatar: (formData: FormData) =>
      fetch("/api/profile/avatar", { method: "POST", body: formData }).then(
        (res) => {
          if (!res.ok) throw new Error("Failed to upload avatar");
          return res.json();
        }
      ),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      fetcher("/api/profile/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
