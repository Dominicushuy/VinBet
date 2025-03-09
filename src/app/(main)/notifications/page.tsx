// src/app/(main)/notifications/page.tsx
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationList } from "@/components/notifications/NotificationList";

export const metadata: Metadata = {
  title: "Thông báo - VinBet",
  description: "Xem tất cả thông báo của bạn trên VinBet",
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Thông báo</h2>
        <p className="text-muted-foreground">Xem tất cả thông báo của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationList />
        </CardContent>
      </Card>
    </div>
  );
}
