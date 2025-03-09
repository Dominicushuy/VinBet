// src/app/(main)/notifications/telegram/page.tsx
import { Metadata } from "next";
import { TelegramConnect } from "@/components/notifications/TelegramConnect";

export const metadata: Metadata = {
  title: "Kết nối Telegram - VinBet",
  description:
    "Kết nối tài khoản VinBet với Telegram để nhận thông báo quan trọng",
};

export default function TelegramConnectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kết nối Telegram</h2>
        <p className="text-muted-foreground">
          Nhận thông báo quan trọng qua Telegram
        </p>
      </div>

      <TelegramConnect />
    </div>
  );
}
