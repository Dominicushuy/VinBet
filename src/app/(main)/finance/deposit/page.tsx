// src/app/(main)/finance/deposit/page.tsx
import { Metadata } from "next";
import { DepositForm } from "@/components/finance/DepositForm";
import { PaymentRequestList } from "@/components/finance/PaymentRequestList";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nạp tiền - VinBet",
  description: "Nạp tiền vào tài khoản VinBet của bạn",
};

export default async function DepositPage() {
  const supabase = createServerClient();

  // Lấy danh sách 5 yêu cầu nạp tiền gần nhất để SSR
  const { data: paymentRequests, count } = await supabase
    .from("payment_requests")
    .select(
      "*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)",
      {
        count: "exact",
      }
    )
    .eq("type", "deposit")
    .order("created_at", { ascending: false })
    .range(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nạp tiền</h2>
        <p className="text-muted-foreground">
          Nạp tiền vào tài khoản để tham gia các lượt chơi
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DepositForm />

        <PaymentRequestList
          type="deposit"
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
