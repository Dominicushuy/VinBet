// src/app/(admin)/admin/payments/page.tsx
import { Metadata } from "next";
import { PaymentRequestsManagement } from "@/components/admin/PaymentRequestsManagement";

export const metadata: Metadata = {
  title: "Quản lý thanh toán - Admin - VinBet",
  description: "Quản lý các yêu cầu nạp/rút tiền trên nền tảng VinBet",
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <PaymentRequestsManagement />
    </div>
  );
}
