// src/components/notifications/NotificationDropdown.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationList } from "./NotificationList";
import { useNotificationCountQuery } from "@/hooks/queries/useNotificationQueries";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { data } = useNotificationCountQuery();

  const unreadCount = data?.count || 0;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleNotificationClick = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <NotificationBadge className="absolute -top-1 -right-1" />
          <span className="sr-only">Thông báo</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
        </div>

        <NotificationList
          limit={5}
          showPagination={false}
          showMarkAllRead={true}
          onNotificationClick={handleNotificationClick}
        />

        <div className="p-2 border-t flex justify-between items-center">
          <Link
            href="/notifications"
            className="text-sm text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            Xem tất cả thông báo
          </Link>

          <Link
            href="/notifications/settings"
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-primary"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-3.5 w-3.5" />
            Cài đặt
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
