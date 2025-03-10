// src/app/(main)/finance/transactions/page.tsx
import { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabase/server";
import { TransactionDashboard } from "@/components/finance/TransactionDashboard";

export const metadata: Metadata = {
  title: "Lịch sử giao dịch - VinBet",
  description: "Xem lịch sử giao dịch và thống kê tài chính của bạn",
};

export default async function TransactionsPage() {
  const supabase = getSupabaseServer();

  // Lấy thông tin user để hiển thị trong header
  const { data: sessionData } = await supabase.auth.getSession();
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance, username, display_name")
    .eq("id", sessionData.session?.user.id)
    .single();

  // Tìm 10 giao dịch gần nhất để hiển thị ngay (không phải đợi client-side fetch)
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("profile_id", sessionData.session?.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Lấy thống kê tổng hợp
  const { data: summaryData } = await supabase.rpc("get_transaction_summary", {
    p_profile_id: sessionData.session?.user.id,
    p_start_date: null,
    p_end_date: null,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lịch sử giao dịch</h2>
        <p className="text-muted-foreground">
          Xem và quản lý lịch sử giao dịch tài chính của bạn
        </p>
      </div>

      <TransactionDashboard
        initialData={{
          transactions: recentTransactions || [],
          summary: summaryData ? summaryData[0] : null,
          profile: profile || { balance: 0 },
        }}
      />
    </div>
  );
}
