// src/hooks/queries/useProfileQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";
import { AUTH_QUERY_KEYS } from "./useAuthQueries";

// Query keys
export const PROFILE_QUERY_KEYS = {
  stats: ["profile", "stats"],
  avatar: ["profile", "avatar"],
};

// Queries
export function useUserStatsQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.stats,
    queryFn: () => apiService.profile.getUserStats(),
  });
}

// Mutations
export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      apiService.profile.updateAvatar(formData),
    onSuccess: () => {
      toast.success("Avatar đã được cập nhật");
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
    },
    onError: (error: any) => {
      toast.error(error.message || "Upload avatar thất bại");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiService.profile.changePassword(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Đổi mật khẩu thất bại");
    },
  });
}
