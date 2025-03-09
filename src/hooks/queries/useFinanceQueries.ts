// src/hooks/queries/useFinanceQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Query keys
export const FINANCE_QUERY_KEYS = {
  paymentRequests: (params?: any) => ["payment-requests", { ...params }],
  paymentRequest: (id: string) => ["payment-request", id],
  withdrawalRequests: (params?: any) => ["withdrawal-requests", { ...params }],
  withdrawalRequest: (id: string) => ["withdrawal-request", id],
};

// API functions
const financeApi = {
  // Tạo yêu cầu nạp tiền
  createPaymentRequest: async (data: {
    amount: number;
    paymentMethod: string;
    paymentDetails?: Record<string, any>;
  }) => {
    const response = await fetch("/api/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tạo yêu cầu nạp tiền");
    }

    return response.json();
  },

  // Upload bằng chứng thanh toán
  uploadPaymentProof: async (requestId: string, file: File) => {
    const formData = new FormData();
    formData.append("proof", file);
    formData.append("requestId", requestId);

    const response = await fetch("/api/payment-requests/upload-proof", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Không thể upload bằng chứng thanh toán"
      );
    }

    return response.json();
  },

  // Lấy danh sách yêu cầu nạp/rút tiền
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

    const response = await fetch(`/api/payment-requests?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể lấy danh sách yêu cầu");
    }

    return response.json();
  },

  // Tạo yêu cầu rút tiền
  createWithdrawalRequest: async (data: {
    amount: number;
    paymentMethod: string;
    paymentDetails?: Record<string, any>;
  }) => {
    const response = await fetch("/api/payment-requests/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tạo yêu cầu rút tiền");
    }

    return response.json();
  },

  // Lấy danh sách yêu cầu rút tiền
  getWithdrawalRequests: async (params?: {
    status?: "pending" | "approved" | "rejected" | "cancelled";
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const response = await fetch(
      `/api/payment-requests/withdraw?${queryParams}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Không thể lấy danh sách yêu cầu rút tiền"
      );
    }

    return response.json();
  },

  // Lấy chi tiết yêu cầu rút tiền
  getWithdrawalRequestDetail: async (id: string) => {
    const response = await fetch(`/api/payment-requests/withdraw/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Không thể lấy thông tin yêu cầu rút tiền"
      );
    }

    return response.json();
  },
};

// Queries
export function usePaymentRequestsQuery(params?: {
  type?: "deposit" | "withdrawal";
  status?: "pending" | "approved" | "rejected" | "cancelled";
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.paymentRequests(params),
    queryFn: () => financeApi.getPaymentRequests(params),
  });
}

// Mutations
export function useCreatePaymentRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.createPaymentRequest,
    onSuccess: (data) => {
      toast.success("Yêu cầu nạp tiền đã được tạo thành công");
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.paymentRequests(),
      });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo yêu cầu nạp tiền");
    },
  });
}

export function useUploadPaymentProofMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, file }: { requestId: string; file: File }) =>
      financeApi.uploadPaymentProof(requestId, file),
    onSuccess: () => {
      toast.success("Bằng chứng thanh toán đã được tải lên");
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.paymentRequests(),
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tải lên bằng chứng thanh toán");
    },
  });
}

export function useCreateWithdrawalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.createWithdrawalRequest,
    onSuccess: (data) => {
      toast.success("Yêu cầu rút tiền đã được tạo thành công");
      queryClient.invalidateQueries({
        queryKey: FINANCE_QUERY_KEYS.withdrawalRequests(),
      });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo yêu cầu rút tiền");
    },
  });
}

export function useWithdrawalRequestsQuery(params?: {
  status?: "pending" | "approved" | "rejected" | "cancelled";
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.withdrawalRequests(params),
    queryFn: () => financeApi.getWithdrawalRequests(params),
  });
}

export function useWithdrawalRequestQuery(id: string) {
  return useQuery({
    queryKey: FINANCE_QUERY_KEYS.withdrawalRequest(id),
    queryFn: () => financeApi.getWithdrawalRequestDetail(id),
    enabled: !!id,
  });
}
