// src/app/(main)/finance/withdrawal/page.tsx
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { WithdrawalFlowSteps } from "@/components/finance/WithdrawalFlowSteps";
import { WithdrawalHistory } from "@/components/finance/WithdrawalHistory";

export const metadata: Metadata = {
  title: "Rút tiền - VinBet",
  description:
    "Rút tiền từ tài khoản VinBet của bạn về tài khoản ngân hàng hoặc ví điện tử",
};

export default async function WithdrawalPage() {
  const supabase = getSupabaseServer();

  // Lấy thông tin user và balance
  const { data: profileData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance, username, display_name")
    .eq("id", profileData.user?.id)
    .single();

  // Lấy danh sách 5 yêu cầu rút tiền gần nhất để SSR
  const { data: paymentRequests, count } = await supabase
    .from("payment_requests")
    .select(
      "*, approved_by:profiles!payment_requests_approved_by_fkey(username, display_name)",
      { count: "exact" }
    )
    .eq("type", "withdrawal")
    .order("created_at", { ascending: false })
    .range(0, 4);

  // Lấy thông tin cấu hình rút tiền
  const { data: withdrawalConfig } = await supabase
    .from("payment_settings")
    .select(
      "withdrawal_methods, min_withdrawal, max_withdrawal, withdrawal_fee"
    )
    .single();

  const config = withdrawalConfig || {
    withdrawal_methods: [
      {
        id: "bank_transfer",
        name: "Chuyển khoản ngân hàng",
        description: "Rút tiền về tài khoản ngân hàng",
        fields: [
          {
            name: "bankName",
            label: "Tên ngân hàng",
            type: "text",
            required: true,
          },
          {
            name: "accountNumber",
            label: "Số tài khoản",
            type: "text",
            required: true,
          },
          {
            name: "accountName",
            label: "Tên chủ tài khoản",
            type: "text",
            required: true,
          },
          { name: "branch", label: "Chi nhánh", type: "text", required: false },
        ],
        processingTime: "24-48 giờ",
        fee: 0,
      },
      {
        id: "momo",
        name: "Ví MoMo",
        description: "Rút tiền về ví MoMo",
        fields: [
          {
            name: "phoneNumber",
            label: "Số điện thoại",
            type: "text",
            required: true,
          },
          {
            name: "fullName",
            label: "Họ và tên",
            type: "text",
            required: true,
          },
        ],
        processingTime: "5-30 phút",
        fee: 0,
      },
      {
        id: "zalopay",
        name: "ZaloPay",
        description: "Rút tiền về ví ZaloPay",
        fields: [
          {
            name: "phoneNumber",
            label: "Số điện thoại",
            type: "text",
            required: true,
          },
          {
            name: "fullName",
            label: "Họ và tên",
            type: "text",
            required: true,
          },
        ],
        processingTime: "5-30 phút",
        fee: 0,
      },
    ],
    min_withdrawal: 50000,
    max_withdrawal: 50000000,
    withdrawal_fee: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rút tiền</h2>
        <p className="text-muted-foreground">
          Rút tiền từ tài khoản VinBet về tài khoản ngân hàng hoặc ví điện tử
        </p>
      </div>

      <Alert
        variant="default"
        className="bg-blue-50 text-blue-800 border-blue-200"
      >
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Lưu ý khi rút tiền</AlertTitle>
        <AlertDescription>
          Để đảm bảo giao dịch được xử lý nhanh chóng, vui lòng cung cấp đầy đủ
          và chính xác thông tin tài khoản của bạn. Thời gian xử lý tùy thuộc
          vào phương thức rút tiền, có thể từ 5 phút đến 48 giờ.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="withdraw" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="withdraw">Rút tiền</TabsTrigger>
          <TabsTrigger value="history">Lịch sử rút tiền</TabsTrigger>
        </TabsList>
        <TabsContent value="withdraw" className="mt-6">
          <WithdrawalFlowSteps
            userBalance={profile?.balance || 0}
            config={config}
          />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
