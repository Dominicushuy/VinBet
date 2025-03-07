// src/hooks/queries/useAuthQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  LoginCredentials,
  RegisterData,
} from "@/services/auth.service";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ProfileUpdate } from "@/types/database";

// Query keys
export const AUTH_QUERY_KEYS = {
  session: ["auth", "session"],
  profile: ["auth", "profile"],
};

// Queries
export function useSessionQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: authService.getSession,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: authService.getProfile,
    enabled, // Chỉ fetch khi đã đăng nhập
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Mutations
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: async () => {
      // Invalidate and refetch session after login
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.session,
      });
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.profile,
      });
      router.push("/");
      toast.success("Đăng nhập thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đăng nhập thất bại");
    },
  });
}

export function useRegisterMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      router.push("/login?registered=true");
      toast.success(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đăng ký thất bại");
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Reset all queries after logout
      queryClient.clear();
      router.push("/login");
      toast.success("Đăng xuất thành công!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đăng xuất thất bại");
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
    onSuccess: () => {
      toast.success("Vui lòng kiểm tra email để đặt lại mật khẩu");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Yêu cầu đặt lại mật khẩu thất bại");
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProfileUpdate>) =>
      authService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
      toast.success("Cập nhật thông tin thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật thông tin thất bại");
    },
  });
}
