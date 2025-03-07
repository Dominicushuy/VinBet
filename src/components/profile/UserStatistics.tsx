// src/components/profile/UserStatistics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useUserStatsQuery } from "@/hooks/queries/useProfileQueries";
import { Skeleton } from "@/components/ui/skeleton";

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

export function UserStatistics() {
  const { data: stats, isLoading } = useUserStatsQuery();

  // Format number to money
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (isLoading) {
    return <StatisticsSkeleton />;
  }

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
            value={formatMoney(stats?.balance || 0)}
          />
          <StatCard
            title="Lợi nhuận"
            value={formatMoney(stats?.netProfit || 0)}
            description={stats?.netProfit >= 0 ? "Lãi" : "Lỗ"}
          />
          <StatCard title="Số lần đặt cược" value={stats?.totalBets || 0} />
          <StatCard
            title="Tỷ lệ thắng"
            value={`${(stats?.winRate || 0).toFixed(1)}%`}
          />
        </div>
      </TabsContent>

      <TabsContent value="betting" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Tổng tiền đặt cược"
            value={formatMoney(stats?.totalBetAmount || 0)}
          />
          <StatCard
            title="Tổng tiền thắng"
            value={formatMoney(stats?.totalWinAmount || 0)}
          />
          <StatCard
            title="Thắng/Thua"
            value={`${stats?.wins || 0}/${stats?.losses || 0}`}
          />
        </div>

        <Separator className="my-4" />

        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Thống kê chi tiết</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Số lần thắng</p>
              <p className="text-lg font-medium">{stats?.wins || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số lần thua</p>
              <p className="text-lg font-medium">{stats?.losses || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số cược đã đặt</p>
              <p className="text-lg font-medium">{stats?.totalBets || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tỷ lệ thắng</p>
              <p className="text-lg font-medium">
                {(stats?.winRate || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="py-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="py-2">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
