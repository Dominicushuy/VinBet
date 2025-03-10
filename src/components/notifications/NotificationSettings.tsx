// src/components/notifications/NotificationSettings.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import {
  Bell,
  BellRing,
  BellOff,
  Smartphone,
  Mail,
  MessageSquare,
  Settings,
  CreditCard,
  DollarSign,
  Gamepad,
  Users,
  Shield,
  Loader2,
  Save,
} from "lucide-react";
import { useUpdateNotificationSettingsMutation } from "@/hooks/queries/useNotificationQueries";
import Link from "next/link";

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    telegram_notifications: true,
    sms_notifications: false,

    // Channel types
    transaction_notifications: true,
    game_notifications: true,
    system_notifications: true,
    security_notifications: true,
    marketing_notifications: false,

    // Specific notifications
    deposit_notifications: true,
    withdrawal_notifications: true,
    bet_result_notifications: true,
    jackpot_notifications: true,
    referral_notifications: true,
    account_notifications: true,
  });

  const updateMutation = useUpdateNotificationSettingsMutation();

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateMutation.mutateAsync(settings);
      toast.success("Cài đặt thông báo đã được cập nhật");
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật cài đặt thông báo");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          Cài đặt thông báo
        </CardTitle>
        <CardDescription>
          Tùy chỉnh cách bạn nhận thông báo từ VinBet
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="channels" className="w-full">
          <div className="px-6 pt-2">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="channels">Kênh thông báo</TabsTrigger>
              <TabsTrigger value="types">Loại thông báo</TabsTrigger>
              <TabsTrigger value="frequency">Tần suất</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="channels" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    className="text-base font-medium"
                    htmlFor="email_notifications"
                  >
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      Email
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo qua email
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={() => handleToggle("email_notifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    className="text-base font-medium"
                    htmlFor="push_notifications"
                  >
                    <div className="flex items-center">
                      <BellRing className="mr-2 h-4 w-4 text-muted-foreground" />
                      Push notifications
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo trên trình duyệt
                  </p>
                </div>
                <Switch
                  id="push_notifications"
                  checked={settings.push_notifications}
                  onCheckedChange={() => handleToggle("push_notifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    className="text-base font-medium"
                    htmlFor="telegram_notifications"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                      Telegram
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo qua Telegram
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/notifications/telegram">Kết nối</Link>
                  </Button>
                  <Switch
                    id="telegram_notifications"
                    checked={settings.telegram_notifications}
                    onCheckedChange={() =>
                      handleToggle("telegram_notifications")
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label
                      className="text-base font-medium"
                      htmlFor="sms_notifications"
                    >
                      <div className="flex items-center">
                        <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />
                        SMS
                      </div>
                    </Label>
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-500/10 text-amber-600 border-amber-200"
                    >
                      Sắp ra mắt
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo qua tin nhắn SMS
                  </p>
                </div>
                <Switch
                  id="sms_notifications"
                  checked={settings.sms_notifications}
                  onCheckedChange={() => handleToggle("sms_notifications")}
                  disabled
                />
              </div>
            </div>

            <Alert variant="outline" className="bg-muted/50">
              <AlertDescription className="text-xs">
                Một số thông báo quan trọng liên quan đến tài khoản và bảo mật
                sẽ luôn được gửi qua email, bất kể cài đặt của bạn.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="types" className="p-6 space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-2">
                  Hoạt động tài chính
                </h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="deposit_notifications"
                    >
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                        Nạp tiền
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo khi giao dịch nạp tiền được xử lý
                    </p>
                  </div>
                  <Switch
                    id="deposit_notifications"
                    checked={settings.deposit_notifications}
                    onCheckedChange={() =>
                      handleToggle("deposit_notifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="withdrawal_notifications"
                    >
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4 text-blue-500" />
                        Rút tiền
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo khi giao dịch rút tiền được xử lý
                    </p>
                  </div>
                  <Switch
                    id="withdrawal_notifications"
                    checked={settings.withdrawal_notifications}
                    onCheckedChange={() =>
                      handleToggle("withdrawal_notifications")
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-2">
                  Trò chơi và cá cược
                </h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="bet_result_notifications"
                    >
                      <div className="flex items-center">
                        <Gamepad className="mr-2 h-4 w-4 text-violet-500" />
                        Kết quả cược
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo khi có kết quả lượt cược
                    </p>
                  </div>
                  <Switch
                    id="bet_result_notifications"
                    checked={settings.bet_result_notifications}
                    onCheckedChange={() =>
                      handleToggle("bet_result_notifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="jackpot_notifications"
                    >
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-amber-500" />
                        Jackpot
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo về jackpot và giải thưởng lớn
                    </p>
                  </div>
                  <Switch
                    id="jackpot_notifications"
                    checked={settings.jackpot_notifications}
                    onCheckedChange={() =>
                      handleToggle("jackpot_notifications")
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-2">Khác</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="referral_notifications"
                    >
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-indigo-500" />
                        Giới thiệu
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo khi có người đăng ký qua link giới thiệu
                    </p>
                  </div>
                  <Switch
                    id="referral_notifications"
                    checked={settings.referral_notifications}
                    onCheckedChange={() =>
                      handleToggle("referral_notifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="account_notifications"
                    >
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-red-500" />
                        Tài khoản và bảo mật
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo về thay đổi tài khoản và đăng nhập
                    </p>
                  </div>
                  <Switch
                    id="account_notifications"
                    checked={settings.account_notifications}
                    onCheckedChange={() =>
                      handleToggle("account_notifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="marketing_notifications"
                    >
                      <div className="flex items-center">
                        <BellRing className="mr-2 h-4 w-4 text-orange-500" />
                        Tiếp thị và khuyến mãi
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Thông báo về khuyến mãi và ưu đãi
                    </p>
                  </div>
                  <Switch
                    id="marketing_notifications"
                    checked={settings.marketing_notifications}
                    onCheckedChange={() =>
                      handleToggle("marketing_notifications")
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frequency" className="p-6 space-y-6">
            <div className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tần suất thông báo</h3>
                  <p className="text-sm text-muted-foreground">
                    Chọn cách bạn muốn nhận thông báo
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                    <div className="flex justify-between items-start">
                      <BellRing className="h-8 w-8 text-green-500 p-1 border border-green-200 rounded-lg bg-green-50" />
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <h4 className="font-medium mt-4">Ngay lập tức</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nhận thông báo ngay khi có sự kiện
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 cursor-pointer hover:border-muted-foreground/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <Bell className="h-8 w-8 text-blue-500 p-1 border border-blue-200 rounded-lg bg-blue-50" />
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                        {/* Empty radio button */}
                      </div>
                    </div>
                    <h4 className="font-medium mt-4">Hàng giờ</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gom nhóm thông báo và gửi theo giờ
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 cursor-pointer hover:border-muted-foreground/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <BellOff className="h-8 w-8 text-amber-500 p-1 border border-amber-200 rounded-lg bg-amber-50" />
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                        {/* Empty radio button */}
                      </div>
                    </div>
                    <h4 className="font-medium mt-4">Hàng ngày</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Nhận tóm tắt thông báo một lần mỗi ngày
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Thời gian yên lặng</h3>
                <p className="text-sm text-muted-foreground">
                  Không gửi thông báo trong khoảng thời gian dưới đây
                </p>

                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-0.5">
                    <Label
                      className="text-base font-medium"
                      htmlFor="quiet_hours"
                    >
                      <div className="flex items-center">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        Bật thời gian yên lặng
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      22:00 - 08:00 mỗi ngày
                    </p>
                  </div>
                  <Switch id="quiet_hours" checked={false} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="border-t px-6 py-4">
        <Button
          onClick={handleSaveSettings}
          disabled={updateMutation.isLoading}
          className="w-full"
        >
          {updateMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
