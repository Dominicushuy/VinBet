// src/components/profile/UserStatistics.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

interface StatProps {
  title: string;
  value: string | number;
  description?: string;
}

function StatCard({ title, value, description }: StatProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface UserStats {
  totalGames: number;
  totalBets: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWinAmount: number;
  totalBetAmount: number;
  netProfit: number;
}

export function UserStatistics() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalGames: 0,
    totalBets: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalWinAmount: 0,
    totalBetAmount: 0,
    netProfit: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;

      setIsLoading(true);
      const supabase = createClient();

      try {
        // Lấy tổng số tiền đặt cược
        const { data: betData, error: betError } = await supabase
          .from("bets")
          .select("amount, status")
          .eq("profile_id", profile.id);

        if (betError) throw betError;

        // Lấy các giao dịch thắng
        const { data: winData, error: winError } = await supabase
          .from("transactions")
          .select("amount")
          .eq("profile_id", profile.id)
          .eq("type", "win");

        if (winError) throw winError;

        // Tính toán thống kê
        const totalBets = betData?.length || 0;
        const wins = betData?.filter((bet) => bet.status === "won").length || 0;
        const losses =
          betData?.filter((bet) => bet.status === "lost").length || 0;
        const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

        const totalBetAmount =
          betData?.reduce((sum, bet) => sum + bet.amount, 0) || 0;
        const totalWinAmount =
          winData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
        const netProfit = totalWinAmount - totalBetAmount;

        setStats({
          totalGames: 0, // Sẽ lấy từ API khác
          totalBets,
          wins,
          losses,
          winRate,
          totalWinAmount,
          totalBetAmount,
          netProfit,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  // Format number to money
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="betting">Cá cược</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Số dư hiện tại"
            value={formatMoney(profile?.balance || 0)}
          />
          <StatCard
            title="Lợi nhuận"
            value={formatMoney(stats.netProfit)}
            description={stats.netProfit >= 0 ? "Lãi" : "Lỗ"}
          />
          <StatCard title="Số lần đặt cược" value={stats.totalBets} />
          <StatCard
            title="Tỷ lệ thắng"
            value={`${stats.winRate.toFixed(1)}%`}
          />
        </div>
      </TabsContent>

      <TabsContent value="betting" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Tổng tiền đặt cược"
            value={formatMoney(stats.totalBetAmount)}
          />
          <StatCard
            title="Tổng tiền thắng"
            value={formatMoney(stats.totalWinAmount)}
          />
          <StatCard
            title="Thắng/Thua"
            value={`${stats.wins}/${stats.losses}`}
          />
        </div>

        <Separator className="my-4" />

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Thống kê chi tiết</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Số lần thắng</p>
              <p className="text-lg font-medium">{stats.wins}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số lần thua</p>
              <p className="text-lg font-medium">{stats.losses}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số cược đã đặt</p>
              <p className="text-lg font-medium">{stats.totalBets}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tỷ lệ thắng</p>
              <p className="text-lg font-medium">{stats.winRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
