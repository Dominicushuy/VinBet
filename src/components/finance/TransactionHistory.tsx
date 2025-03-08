// src/components/finance/TransactionHistory.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransactionsQuery } from "@/hooks/queries/useTransactionQueries";
import { Pagination } from "@/components/ui/pagination";
import { TransactionFilters } from "./TransactionFilters";
import { Loader2 } from "lucide-react";

export function TransactionHistory() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);

  const { data, isLoading, error } = useTransactionsQuery({
    type,
    status,
    startDate,
    endDate,
    page,
    pageSize,
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  const updateFilters = (filters: any) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Format money
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get transaction type badge
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Nạp tiền
          </Badge>
        );
      case "withdrawal":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            Rút tiền
          </Badge>
        );
      case "bet":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Đặt cược
          </Badge>
        );
      case "win":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Thắng cược
          </Badge>
        );
      case "referral_reward":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Thưởng giới thiệu
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get transaction status badge
  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Đang xử lý</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Hoàn thành
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Thất bại</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <TransactionFilters
        type={type}
        status={status}
        startDate={startDate}
        endDate={endDate}
        onFilterChange={updateFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Không tìm thấy giao dịch nào.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(
                            new Date(transaction.created_at),
                            "HH:mm, dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell>{transaction.description || "-"}</TableCell>
                        <TableCell>
                          {getTransactionTypeBadge(transaction.type)}
                        </TableCell>
                        <TableCell
                          className={`font-medium ${
                            transaction.type === "deposit" ||
                            transaction.type === "win" ||
                            transaction.type === "referral_reward"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "deposit" ||
                          transaction.type === "win" ||
                          transaction.type === "referral_reward"
                            ? `+${formatMoney(transaction.amount)}`
                            : `-${formatMoney(transaction.amount)}`}
                        </TableCell>
                        <TableCell>
                          {getTransactionStatusBadge(transaction.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
