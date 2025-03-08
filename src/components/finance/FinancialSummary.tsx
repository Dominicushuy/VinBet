// src/components/finance/FinancialSummary.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactionSummaryQuery } from "@/hooks/queries/useTransactionQueries";
import { Loader2, ArrowDown, ArrowUp } from "lucide-react";

export function FinancialSummary() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState<string | undefined>(
    undefined
  );
  const [appliedEndDate, setAppliedEndDate] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, refetch } = useTransactionSummaryQuery({
    startDate: appliedStartDate,
    endDate: appliedEndDate,
  });

  const summary = data?.summary || {
    total_deposit: 0,
    total_withdrawal: 0,
    total_bet: 0,
    total_win: 0,
    total_referral_reward: 0,
    net_balance: 0,
  };

  const handleFilter = () => {
    setAppliedStartDate(startDate || undefined);
    setAppliedEndDate(endDate || undefined);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate(undefined);
    setAppliedEndDate(undefined);
  };

  // Format money
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng hợp tài chính</CardTitle>
        <CardDescription>
          {appliedStartDate && appliedEndDate
            ? `Thống kê từ ${appliedStartDate} đến ${appliedEndDate}`
            : appliedStartDate
            ? `Thống kê từ ${appliedStartDate} đến nay`
            : appliedEndDate
            ? `Thống kê đến ${appliedEndDate}`
            : "Thống kê tất cả giao dịch"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Từ ngày</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Đến ngày</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleFilter}>Lọc</Button>
            <Button variant="outline" onClick={handleReset}>
              Xóa
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center">
                  <ArrowUp className="mr-2 h-5 w-5 text-green-500" />
                  Tổng tiền nạp
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(summary.total_deposit)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center">
                  <ArrowDown className="mr-2 h-5 w-5 text-red-500" />
                  Tổng tiền rút
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold text-red-600">
                  {formatMoney(summary.total_withdrawal)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Số dư ròng</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div
                  className={`text-2xl font-bold ${
                    summary.net_balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatMoney(summary.net_balance)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Tổng tiền đặt cược</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold">
                  {formatMoney(summary.total_bet)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Tổng tiền thắng cược</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(summary.total_win)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Thưởng giới thiệu</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-2xl font-bold text-green-600">
                  {formatMoney(summary.total_referral_reward)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
