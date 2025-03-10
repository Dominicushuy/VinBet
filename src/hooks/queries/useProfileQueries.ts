// src/hooks/queries/useProfileQueries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { AUTH_QUERY_KEYS } from "./useAuthQueries";

// Query keys
export const PROFILE_QUERY_KEYS = {
  profile: ["profile"],
  stats: ["profile", "stats"],
  avatar: ["profile", "avatar"],
  security: ["profile", "security"],
  activity: ["profile", "activity"],
};

// API functions
const profileApi = {
  // Get user statistics
  getUserStats: async () => {
    const response = await fetch("/api/profile/stats");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tải thống kê người dùng");
    }
    return response.json();
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể cập nhật hồ sơ");
    }

    return response.json();
  },

  // Update avatar
  updateAvatar: async (formData) => {
    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể cập nhật ảnh đại diện");
    }

    return response.json();
  },

  // Change password
  changePassword: async (data) => {
    const response = await fetch("/api/profile/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể đổi mật khẩu");
    }

    return response.json();
  },

  // Get security settings
  getSecuritySettings: async () => {
    const response = await fetch("/api/profile/security");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tải cài đặt bảo mật");
    }
    return response.json();
  },

  // Update security settings
  updateSecuritySettings: async (data) => {
    const response = await fetch("/api/profile/security", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể cập nhật cài đặt bảo mật");
    }

    return response.json();
  },

  // Get login activity
  getLoginActivity: async () => {
    const response = await fetch("/api/profile/activity");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tải hoạt động đăng nhập");
    }
    return response.json();
  },

  // Sign out device
  signOutDevice: async (deviceId) => {
    const response = await fetch(`/api/profile/activity/${deviceId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể đăng xuất thiết bị");
    }

    return response.json();
  },
};

// Queries
export function useUserStatsQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.stats,
    queryFn: profileApi.getUserStats,
  });
}

export function useSecuritySettingsQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.security,
    queryFn: profileApi.getSecuritySettings,
  });
}

export function useLoginActivityQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.activity,
    queryFn: profileApi.getLoginActivity,
  });
}

// Mutations
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
      toast.success("Hồ sơ đã được cập nhật");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể cập nhật hồ sơ");
    },
  });
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateAvatar,
    onSuccess: () => {
      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
      toast.success("Ảnh đại diện đã được cập nhật");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể cập nhật ảnh đại diện");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success("Mật khẩu đã được cập nhật");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể cập nhật mật khẩu");
    },
  });
}

export function useUpdateSecuritySettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateSecuritySettings,
    onSuccess: () => {
      // Invalidate security settings query
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.security });
      toast.success("Cài đặt bảo mật đã được cập nhật");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể cập nhật cài đặt bảo mật");
    },
  });
}

export function useSignOutDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.signOutDevice,
    onSuccess: () => {
      // Invalidate login activity query
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.activity });
      toast.success("Đã đăng xuất khỏi thiết bị");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể đăng xuất thiết bị");
    },
  });
}
