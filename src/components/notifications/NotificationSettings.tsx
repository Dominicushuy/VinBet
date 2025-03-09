// src/components/notifications/NotificationSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/hooks/queries/useNotificationQueries";

export function NotificationSettings() {
  const { data, isLoading: isLoadingSettings } = useNotificationSettingsQuery();
  const updateMutation = useUpdateNotificationSettingsMutation();

  // Initialize state with current settings or defaults
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    game_notifications: true,
    transaction_notifications: true,
    system_notifications: true,
  });

  // Update state when data is loaded
  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync(settings);
  };

  if (isLoadingSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thông báo</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt thông báo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email_notifications" className="flex-1">
              <div className="font-medium">Email thông báo</div>
              <div className="text-sm text-muted-foreground">
                Nhận thông báo qua email
              </div>
            </Label>
            <Switch
              id="email_notifications"
              checked={settings.email_notifications}
              onCheckedChange={() => handleToggle("email_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push_notifications" className="flex-1">
              <div className="font-medium">Thông báo đẩy</div>
              <div className="text-sm text-muted-foreground">
                Nhận thông báo đẩy từ trình duyệt
              </div>
            </Label>
            <Switch
              id="push_notifications"
              checked={settings.push_notifications}
              onCheckedChange={() => handleToggle("push_notifications")}
            />
          </div>

          <div className="h-px bg-muted my-4" />

          <div className="flex items-center justify-between">
            <Label htmlFor="game_notifications" className="flex-1">
              <div className="font-medium">Thông báo trò chơi</div>
              <div className="text-sm text-muted-foreground">
                Nhận thông báo về trò chơi và kết quả
              </div>
            </Label>
            <Switch
              id="game_notifications"
              checked={settings.game_notifications}
              onCheckedChange={() => handleToggle("game_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="transaction_notifications" className="flex-1">
              <div className="font-medium">Thông báo giao dịch</div>
              <div className="text-sm text-muted-foreground">
                Nhận thông báo về nạp/rút tiền và giao dịch
              </div>
            </Label>
            <Switch
              id="transaction_notifications"
              checked={settings.transaction_notifications}
              onCheckedChange={() => handleToggle("transaction_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="system_notifications" className="flex-1">
              <div className="font-medium">Thông báo hệ thống</div>
              <div className="text-sm text-muted-foreground">
                Nhận thông báo hệ thống và cập nhật
              </div>
            </Label>
            <Switch
              id="system_notifications"
              checked={settings.system_notifications}
              onCheckedChange={() => handleToggle("system_notifications")}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isLoading}
          className="w-full"
        >
          {updateMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Lưu cài đặt"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
