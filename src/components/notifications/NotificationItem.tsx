// src/components/notifications/NotificationItem.tsx
"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, Bell, DollarSign, Gamepad, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMarkNotificationReadMutation } from "@/hooks/queries/useNotificationQueries";
import { Notification } from "@/types/database";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export function NotificationItem({
  notification,
  onClose,
}: NotificationItemProps) {
  const markReadMutation = useMarkNotificationReadMutation();

  const handleMarkRead = async () => {
    if (!notification.is_read) {
      await markReadMutation.mutateAsync(notification.id);
    }
    if (onClose) {
      onClose();
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "system":
        return <Bell className="h-5 w-5" />;
      case "transaction":
        return <DollarSign className="h-5 w-5" />;
      case "game":
        return <Gamepad className="h-5 w-5" />;
      case "admin":
        return <ShieldAlert className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={cn(
        "border-b p-4 flex gap-3",
        !notification.is_read && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 p-2 rounded-full",
          notification.type === "system" && "bg-blue-100 text-blue-600",
          notification.type === "transaction" && "bg-green-100 text-green-600",
          notification.type === "game" && "bg-purple-100 text-purple-600",
          notification.type === "admin" && "bg-red-100 text-red-600"
        )}
      >
        {getNotificationIcon()}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium">{notification.title}</h4>
          <span className="text-xs text-muted-foreground">
            {notification.created_at
              ? format(new Date(notification.created_at), "HH:mm, dd/MM", {
                  locale: vi,
                })
              : "N/A"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{notification.content}</p>
        {!notification.is_read && (
          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkRead}
              disabled={markReadMutation.isLoading}
            >
              <Check className="h-4 w-4 mr-1" />
              Đánh dấu đã đọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
