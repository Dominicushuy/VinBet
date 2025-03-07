// src/services/api.service.ts
import { Profile, ProfileUpdate } from "@/types/database";

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
};
