// src/app/(main)/finance/transactions/page.tsx
import { Metadata } from "next";
import { TransactionHistory } from "@/components/finance/TransactionHistory";
import { FinancialSummary } from "@/components/finance/FinancialSummary";

export const metadata: Metadata = {
  title: "Lịch sử giao dịch - VinBet",
  description: "Xem lịch sử giao dịch và thống kê tài chính của bạn",
};

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lịch sử giao dịch</h2>
        <p className="text-muted-foreground">
          Xem lịch sử giao dịch và thống kê tài chính của bạn
        </p>
      </div>

      <FinancialSummary />
      <TransactionHistory />
    </div>
  );
}
