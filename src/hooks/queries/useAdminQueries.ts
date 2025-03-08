// src/hooks/queries/useAdminQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Query keys
export const ADMIN_QUERY_KEYS = {
  paymentRequests: (params?: any) => [
    "admin",
    "payment-requests",
    { ...params },
  ],
  usersList: (params?: any) => ["admin", "users", { ...params }],
  dashboard: ["admin", "dashboard"],
};

// API functions
const adminApi = {
  // Lấy danh sách các payment requests
  getPaymentRequests: async (params?: {
    type?: "deposit" | "withdrawal";
    status?: "pending" | "approved" | "rejected" | "cancelled";
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const response = await fetch(`/api/admin/payment-requests?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy danh sách yêu cầu");
    }

    return response.json();
  },

  // Phê duyệt/từ chối payment request
  processPaymentRequest: async (
    id: string,
    action: "approve" | "reject",
    data: { notes?: string }
  ) => {
    const response = await fetch(
      `/api/admin/payment-requests/${id}/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          `Không thể ${action === "approve" ? "phê duyệt" : "từ chối"} yêu cầu`
      );
    }

    return response.json();
  },

  // Lấy danh sách người dùng
  getUsers: async (params?: {
    query?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.append("query", params.query);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const response = await fetch(`/api/admin/users?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy danh sách người dùng");
    }

    return response.json();
  },

  // Lấy thống kê dashboard
  getDashboardStats: async () => {
    const response = await fetch("/api/admin/dashboard-summary");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy thống kê dashboard");
    }

    return response.json();
  },
};

// Queries
export function useAdminPaymentRequestsQuery(params?: {
  type?: "deposit" | "withdrawal";
  status?: "pending" | "approved" | "rejected" | "cancelled";
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.paymentRequests(params),
    queryFn: () => adminApi.getPaymentRequests(params),
  });
}

export function useAdminUsersQuery(params?: {
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.usersList(params),
    queryFn: () => adminApi.getUsers(params),
  });
}

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard,
    queryFn: adminApi.getDashboardStats,
  });
}

// Mutations
export function useProcessPaymentRequestMutation(action: "approve" | "reject") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminApi.processPaymentRequest(id, action, { notes }),
    onSuccess: () => {
      toast.success(
        `Yêu cầu đã được ${
          action === "approve" ? "phê duyệt" : "từ chối"
        } thành công`
      );
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.paymentRequests(),
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_QUERY_KEYS.dashboard,
      });
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Không thể ${action === "approve" ? "phê duyệt" : "từ chối"} yêu cầu`
      );
    },
  });
}
