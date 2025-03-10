// src/app/(main)/finance/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getSupabaseServer } from "@/lib/supabase/server";
import { FinancialOverviewChart } from "@/components/finance/FinancialOverviewChart";
import { RecentTransactionsList } from "@/components/finance/RecentTransactionsList";
import { FinancialSummaryCards } from "@/components/finance/FinancialSummaryCards";

export const metadata: Metadata = {
  title: "Tài chính - VinBet",
  description: "Quản lý tài chính trong tài khoản VinBet của bạn",
};

export default async function FinancePage() {
  const supabase = getSupabaseServer();
  const { data: profile } = await supabase.auth.getUser();

  // Lấy thông tin tài chính của người dùng
  const { data: userData } = await supabase
    .from("profiles")
    .select("balance, username, display_name, referral_code")
    .eq("id", profile.user?.id || "")
    .single();

  // Lấy thống kê giao dịch
  const { data: transactionStats } = await supabase.rpc(
    "get_transaction_summary",
    {
      p_profile_id: profile.user?.id || "",
      p_start_date: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      p_end_date: new Date().toISOString(),
    }
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy 5 giao dịch gần nhất
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", profile.user?.id || "")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tài chính</h2>
          <p className="text-muted-foreground">
            Quản lý tài chính và giao dịch trong tài khoản của bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/finance/transactions">
              <Clock className="mr-2 h-4 w-4" />
              Lịch sử giao dịch
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Balance Card with Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Số dư tài khoản
            </CardTitle>
            <CardDescription>Số dư hiện tại của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-4xl font-bold text-primary">
                {userData?.balance ? formatCurrency(userData.balance) : "0 đ"}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500 font-medium">
                  +{formatCurrency(transactionStats?.[0]?.total_win || 0)}
                </span>
                <span className="ml-1">thắng cược trong 30 ngày qua</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 pt-0">
            <Button asChild className="flex-1">
              <Link href="/finance/deposit">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Nạp tiền
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/finance/withdrawal">
                <ArrowDownRight className="mr-2 h-4 w-4" />
                Rút tiền
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Referral Card */}
        <Card className="col-span-1 bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Giới thiệu bạn bè
            </CardTitle>
            <CardDescription>Nhận thưởng khi giới thiệu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Mã giới thiệu của bạn
              </p>
              <div className="flex items-center">
                <code className="relative rounded bg-muted px-[0.5rem] py-[0.3rem] font-mono text-lg">
                  {userData?.referral_code || "VINBET123"}
                </code>
                <Button variant="ghost" size="sm" className="ml-2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 2V1H10V2H5ZM4.5 0C4.22386 0 4 0.223858 4 0.5V2.5C4 2.77614 4.22386 3 4.5 3H10.5C10.7761 3 11 2.77614 11 2.5V0.5C11 0.223858 10.7761 0 10.5 0H4.5ZM2 4.5C2 4.22386 2.22386 4 2.5 4H12.5C12.7761 4 13 4.22386 13 4.5V12.5C13 12.7761 12.7761 13 12.5 13H2.5C2.22386 13 2 12.7761 2 12.5V4.5ZM2.5 3C1.67157 3 1 3.67157 1 4.5V12.5C1 13.3284 1.67157 14 2.5 14H12.5C13.3284 14 14 13.3284 14 12.5V4.5C14 3.67157 13.3284 3 12.5 3H2.5Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Thưởng <span className="font-semibold">50,000đ</span> cho mỗi
              người bạn giới thiệu khi họ nạp tiền
            </div>
            <Button variant="secondary" asChild className="w-full">
              <Link href="/referrals">Xem chi tiết</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan tài chính</CardTitle>
          <CardDescription>Biểu đồ giao dịch trong 30 ngày qua</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="deposits">Nạp tiền</TabsTrigger>
              <TabsTrigger value="withdrawals">Rút tiền</TabsTrigger>
              <TabsTrigger value="bets">Đặt cược</TabsTrigger>
              <TabsTrigger value="wins">Thắng cược</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <FinancialOverviewChart
                userId={profile.user?.id}
                period="month"
                filter="all"
              />
            </TabsContent>
            <TabsContent value="deposits">
              <FinancialOverviewChart
                userId={profile.user?.id}
                period="month"
                filter="deposit"
              />
            </TabsContent>
            <TabsContent value="withdrawals">
              <FinancialOverviewChart
                userId={profile.user?.id}
                period="month"
                filter="withdrawal"
              />
            </TabsContent>
            <TabsContent value="bets">
              <FinancialOverviewChart
                userId={profile.user?.id}
                period="month"
                filter="bet"
              />
            </TabsContent>
            <TabsContent value="wins">
              <FinancialOverviewChart
                userId={profile.user?.id}
                period="month"
                filter="win"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary and Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Giao dịch gần đây</CardTitle>
              <CardDescription>5 giao dịch gần nhất của bạn</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/finance/transactions">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTransactionsList transactions={recentTransactions || []} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Thống kê 30 ngày</CardTitle>
            <CardDescription>Tóm tắt hoạt động tài chính</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FinancialSummaryCards stats={transactionStats?.[0] || {}} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-primary" />
              Nạp tiền
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              Nạp tiền nhanh chóng với nhiều phương thức thanh toán khác nhau
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/finance/deposit">Nạp ngay</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                Rút tiền
              </CardTitle>
              <Badge variant="secondary">24h</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              Rút tiền về tài khoản ngân hàng hoặc ví điện tử của bạn
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/finance/withdrawal">Rút tiền</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Lịch sử giao dịch
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-muted-foreground">
              Xem và xuất lịch sử chi tiết tất cả giao dịch của bạn
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/finance/transactions">Xem lịch sử</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
