// src/hooks/queries/useTransactionQueries.ts
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";

// Query keys
export const TRANSACTION_QUERY_KEYS = {
  transactions: (params?: any) => ["transactions", "history", { ...params }],
  summary: (params?: any) => ["transactions", "summary", { ...params }],
};

// Queries
export function useTransactionsQuery(params?: {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.transactions(params),
    queryFn: () => apiService.transactions.getTransactions(params),
  });
}

export function useTransactionSummaryQuery(params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: TRANSACTION_QUERY_KEYS.summary(params),
    queryFn: () => apiService.transactions.getTransactionSummary(params),
  });
}
