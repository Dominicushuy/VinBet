// src/app/(main)/page.tsx
import { Metadata } from "next";
import { ActiveGames } from "@/components/game/ActiveGames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Gamepad, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trang chủ - VinBet",
  description: "Nền tảng cá cược trực tuyến VinBet",
};

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trang chủ</h2>
        <p className="text-muted-foreground">
          Chào mừng đến với VinBet, nền tảng cá cược trực tuyến hàng đầu
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số dư</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 VND</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/finance" className="text-primary hover:underline">
                Nạp tiền
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số lần thắng</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/profile" className="text-primary hover:underline">
                Xem thống kê
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Số cược đã đặt
            </CardTitle>
            <Gamepad className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/games" className="text-primary hover:underline">
                Đặt cược ngay
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ thắng</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              <Link
                href="/profile?tab=stats"
                className="text-primary hover:underline"
              >
                Xem chi tiết
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ActiveGames />

        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu ngay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bạn có thể bắt đầu trải nghiệm cá cược trên VinBet với các bước
              đơn giản:
            </p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Nạp tiền vào tài khoản</li>
              <li>Chọn lượt chơi bạn muốn tham gia</li>
              <li>Đặt cược vào số mà bạn dự đoán</li>
              <li>Chờ kết quả và nhận thưởng!</li>
            </ol>
            <div className="flex gap-4 mt-4">
              <Button asChild className="flex-1">
                <Link href="/games">
                  <Gamepad className="mr-2 h-4 w-4" />
                  Chơi ngay
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/finance">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Nạp tiền
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
