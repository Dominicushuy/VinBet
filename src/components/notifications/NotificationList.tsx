// src/components/notifications/NotificationList.tsx
"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useNotificationsQuery,
  useMarkAllNotificationsReadMutation,
} from "@/hooks/queries/useNotificationQueries";
import { NotificationItem } from "./NotificationItem";
import { Pagination } from "@/components/ui/pagination";
import { Notification } from "@/types/database";

interface NotificationListProps {
  limit?: number;
  showPagination?: boolean;
  showMarkAllRead?: boolean;
  onNotificationClick?: () => void;
}

export function NotificationList({
  limit,
  showPagination = true,
  showMarkAllRead = true,
  onNotificationClick,
}: NotificationListProps) {
  const [page, setPage] = useState(1);
  const pageSize = limit || 10;

  const { data, isLoading, error } = useNotificationsQuery({
    page,
    pageSize,
  });

  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-destructive">
        Không thể tải thông báo
      </div>
    );
  }

  const notifications = (data?.notifications || []) as Notification[];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        Không có thông báo nào
      </div>
    );
  }

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some((n) => !n.is_read);

  return (
    <div className="space-y-2">
      {showMarkAllRead && hasUnreadNotifications && (
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isLoading}
          >
            <Check className="h-4 w-4 mr-1" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      )}

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((notification: Notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={onNotificationClick}
          />
        ))}
      </div>

      {showPagination && pagination.totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
