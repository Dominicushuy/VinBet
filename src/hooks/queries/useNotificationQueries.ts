import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Query keys
export const NOTIFICATION_QUERY_KEYS = {
  notifications: (params?: any) => ["notifications", "list", { ...params }],
  notificationCount: ["notifications", "count"],
  settings: ["notifications", "settings"],
  telegramStatus: ["notifications", "telegram"],
};

// API functions
const notificationApi = {
  // Get user notifications
  getNotifications: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    isRead?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.isRead !== undefined)
      queryParams.append("isRead", params.isRead.toString());

    const response = await fetch(`/api/notifications?${queryParams}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tải thông báo");
    }

    return response.json();
  },

  // Get unread notification count
  getNotificationCount: async () => {
    const response = await fetch(`/api/notifications/count`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tải số lượng thông báo");
    }

    return response.json();
  },

  // Mark notification as read
  markNotificationRead: async (id: string) => {
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể đánh dấu đã đọc");
    }

    return response.json();
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const response = await fetch(`/api/notifications/read-all`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể đánh dấu tất cả đã đọc");
    }

    return response.json();
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const response = await fetch(`/api/notifications/settings`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể tải cài đặt thông báo");
    }

    return response.json();
  },

  // Update notification settings
  updateNotificationSettings: async (settings: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    game_notifications?: boolean;
    transaction_notifications?: boolean;
    system_notifications?: boolean;
    telegram_notifications?: boolean;
    security_alerts?: boolean;
    deposit_notifications?: boolean;
    withdrawal_notifications?: boolean;
    large_bet_notifications?: boolean;
  }) => {
    const response = await fetch(`/api/notifications/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Không thể cập nhật cài đặt thông báo"
      );
    }

    return response.json();
  },

  // Get Telegram status
  getTelegramStatus: async () => {
    const response = await fetch(`/api/notifications/telegram`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Không thể kiểm tra trạng thái Telegram"
      );
    }

    return response.json();
  },

  // Connect Telegram
  connectTelegram: async (telegramId: string) => {
    const response = await fetch(`/api/notifications/telegram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ telegram_id: telegramId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể kết nối Telegram");
    }

    return response.json();
  },

  // Disconnect Telegram
  disconnectTelegram: async () => {
    const response = await fetch(`/api/notifications/telegram`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Không thể ngắt kết nối Telegram");
    }

    return response.json();
  },
};

// Queries
export function useNotificationsQuery(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
}) {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notifications(params),
    queryFn: () => notificationApi.getNotifications(params),
  });
}

export function useNotificationCountQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.notificationCount,
    queryFn: notificationApi.getNotificationCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useNotificationSettingsQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.settings,
    queryFn: notificationApi.getNotificationSettings,
  });
}

export function useTelegramStatusQuery() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.telegramStatus,
    queryFn: notificationApi.getTelegramStatus,
  });
}

// Mutations
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markNotificationRead(id),
    onSuccess: () => {
      // Invalidate notification count and list queries
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notificationCount,
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notifications(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể đánh dấu đã đọc");
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate notification count and list queries
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notificationCount,
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.notifications(),
      });
      toast.success("Đã đánh dấu tất cả là đã đọc");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể đánh dấu tất cả đã đọc");
    },
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.settings,
      });
      toast.success("Cài đặt thông báo đã được cập nhật");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể cập nhật cài đặt thông báo");
    },
  });
}

export function useConnectTelegramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.connectTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.telegramStatus,
      });
      toast.success("Kết nối Telegram thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể kết nối Telegram");
    },
  });
}

export function useDisconnectTelegramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.disconnectTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.telegramStatus,
      });
      toast.success("Đã ngắt kết nối Telegram");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể ngắt kết nối Telegram");
    },
  });
}
