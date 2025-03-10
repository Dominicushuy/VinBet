// src/components/finance/RecentTransactionsList.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CreditCard,
  DollarSign,
  Award,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Transaction {
  id: string;
  profile_id: string;
  amount: number;
  type: string;
  status: string;
  reference_id: string;
  payment_request_id: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export function RecentTransactionsList({
  transactions,
}: RecentTransactionsListProps) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Nếu không có giao dịch nào
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Chưa có giao dịch nào</p>
        <Button variant="outline" className="mt-4" asChild>
          <a href="/finance/deposit">Nạp tiền ngay</a>
        </Button>
      </div>
    );
  }

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy icon dựa vào loại giao dịch
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "withdrawal":
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      case "bet":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "win":
        return <Award className="h-4 w-4 text-amber-500" />;
      case "referral_reward":
        return <Award className="h-4 w-4 text-purple-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  // Lấy màu dựa vào loại giao dịch
  const getAmountColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
      case "referral_reward":
        return "text-green-600";
      case "withdrawal":
      case "bet":
        return "text-red-600";
      default:
        return "";
    }
  };

  // Lấy prefix dựa vào loại giao dịch
  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
      case "referral_reward":
        return "+";
      case "withdrawal":
      case "bet":
        return "-";
      default:
        return "";
    }
  };

  // Lấy tên loại giao dịch
  const getTransactionType = (type: string) => {
    switch (type) {
      case "deposit":
        return "Nạp tiền";
      case "withdrawal":
        return "Rút tiền";
      case "bet":
        return "Đặt cược";
      case "win":
        return "Thắng cược";
      case "referral_reward":
        return "Thưởng giới thiệu";
      default:
        return type;
    }
  };

  // Lấy badge trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Hoàn thành
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Đang xử lý
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Thất bại
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-200"
          >
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium">
                  {getTransactionType(transaction.type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(
                    new Date(transaction.created_at),
                    "HH:mm, dd/MM/yyyy",
                    { locale: vi }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p
                  className={`font-semibold ${getAmountColor(
                    transaction.type
                  )}`}
                >
                  {getAmountPrefix(transaction.type)}
                  {formatCurrency(transaction.amount)}
                </p>
                <div className="mt-1">{getStatusBadge(transaction.status)}</div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                {selectedTransaction && (
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Chi tiết giao dịch</DialogTitle>
                      <DialogDescription>
                        Thông tin chi tiết về giao dịch #
                        {selectedTransaction.id.substring(0, 8)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Loại giao dịch:
                        </span>
                        <span className="font-medium">
                          {getTransactionType(selectedTransaction.type)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Số tiền:</span>
                        <span
                          className={`font-semibold ${getAmountColor(
                            selectedTransaction.type
                          )}`}
                        >
                          {getAmountPrefix(selectedTransaction.type)}
                          {formatCurrency(selectedTransaction.amount)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Trạng thái:
                        </span>
                        {getStatusBadge(selectedTransaction.status)}
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Thời gian:
                        </span>
                        <span>
                          {format(
                            new Date(selectedTransaction.created_at),
                            "HH:mm:ss, dd/MM/yyyy",
                            { locale: vi }
                          )}
                        </span>
                      </div>
                      {selectedTransaction.description && (
                        <>
                          <Separator />
                          <div className="flex flex-col gap-2">
                            <span className="text-muted-foreground">
                              Mô tả:
                            </span>
                            <span className="text-sm">
                              {selectedTransaction.description}
                            </span>
                          </div>
                        </>
                      )}
                      {selectedTransaction.reference_id && (
                        <>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              Mã tham chiếu:
                            </span>
                            <code className="bg-muted p-1 rounded text-xs">
                              {selectedTransaction.reference_id.substring(
                                0,
                                12
                              )}
                            </code>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
