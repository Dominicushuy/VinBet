// src/components/notifications/NotificationSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  BellRing,
  Shield,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useTelegramStatusQuery,
} from "@/hooks/queries/useNotificationQueries";

export function NotificationSettings() {
  const router = useRouter();
  const { data, isLoading: isLoadingSettings } = useNotificationSettingsQuery();
  const { data: telegramStatus } = useTelegramStatusQuery();
  const updateMutation = useUpdateNotificationSettingsMutation();

  // Mặc định settings
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    game_notifications: true,
    transaction_notifications: true,
    system_notifications: true,
    telegram_notifications: true,
    security_alerts: true,
    deposit_notifications: true,
    withdrawal_notifications: true,
    large_bet_notifications: true,
  });

  // Cập nhật state khi data được tải
  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  // Toggle cài đặt thông báo
  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Lưu cài đặt
  const handleSave = async () => {
    await updateMutation.mutateAsync(settings);
  };

  // Chuyển đến trang kết nối Telegram
  const navigateToTelegramConnect = () => {
    router.push("/notifications/telegram");
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

  const isTelegramConnected = telegramStatus?.connected;

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

          <div className="flex items-center justify-between">
            <Label htmlFor="telegram_notifications" className="flex-1">
              <div className="font-medium">Thông báo Telegram</div>
              <div className="text-sm text-muted-foreground">
                Nhận thông báo qua Telegram
                {!isTelegramConnected && (
                  <span className="text-amber-500 ml-1">(Chưa kết nối)</span>
                )}
              </div>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToTelegramConnect}
              >
                {isTelegramConnected ? "Quản lý" : "Kết nối"}
              </Button>
              <Switch
                id="telegram_notifications"
                checked={
                  settings.telegram_notifications &&
                  Boolean(isTelegramConnected)
                }
                onCheckedChange={() => handleToggle("telegram_notifications")}
                disabled={!isTelegramConnected}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <h3 className="font-medium mb-3">Loại thông báo</h3>

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

          <Separator className="my-4" />

          <h3 className="font-medium mb-3">Cài đặt nâng cao</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="security_alerts" className="flex-1">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Cảnh báo bảo mật</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Thông báo khi có hoạt động đáng ngờ hoặc thay đổi bảo mật
              </div>
            </Label>
            <Switch
              id="security_alerts"
              checked={settings.security_alerts}
              onCheckedChange={() => handleToggle("security_alerts")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="deposit_notifications" className="flex-1">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Thông báo nạp tiền</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Thông báo khi có yêu cầu nạp tiền được xử lý
              </div>
            </Label>
            <Switch
              id="deposit_notifications"
              checked={settings.deposit_notifications}
              onCheckedChange={() => handleToggle("deposit_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="withdrawal_notifications" className="flex-1">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Thông báo rút tiền</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Thông báo khi có yêu cầu rút tiền được xử lý
              </div>
            </Label>
            <Switch
              id="withdrawal_notifications"
              checked={settings.withdrawal_notifications}
              onCheckedChange={() => handleToggle("withdrawal_notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="large_bet_notifications" className="flex-1">
              <div className="flex items-center gap-1.5">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                <span>Thông báo cược lớn</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Thông báo khi có cược lớn hoặc thắng lớn
              </div>
            </Label>
            <Switch
              id="large_bet_notifications"
              checked={settings.large_bet_notifications}
              onCheckedChange={() => handleToggle("large_bet_notifications")}
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
