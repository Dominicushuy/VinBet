import { Metadata } from "next";
import { WithdrawalForm } from "@/components/finance/WithdrawalForm";
import { WithdrawalHistory } from "@/components/finance/WithdrawalHistory";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rút tiền - VinBet",
  description: "Rút tiền từ tài khoản VinBet của bạn",
};

export default async function WithdrawalPage() {
  const supabase = createServerClient();

  // Lấy danh sách 5 yêu cầu rút tiền gần nhất để SSR
  const { data: paymentRequests, count } = await supabase
    .from("payment_requests")
    .select(
      "*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)",
      {
        count: "exact",
      }
    )
    .eq("type", "withdrawal")
    .order("created_at", { ascending: false })
    .range(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rút tiền</h2>
        <p className="text-muted-foreground">
          Rút tiền từ tài khoản của bạn về tài khoản ngân hàng hoặc ví điện tử
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <WithdrawalForm />

        <WithdrawalHistory
          initialData={{
            paymentRequests: paymentRequests || [],
            pagination: {
              total: count || 0,
              page: 1,
              pageSize: 5,
              totalPages: Math.ceil((count || 0) / 5),
            },
          }}
        />
      </div>
    </div>
  );
}
