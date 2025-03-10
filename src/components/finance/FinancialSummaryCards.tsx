// src/components/finance/FinancialSummaryCards.tsx
"use client";

import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";

interface FinancialSummaryCardsProps {
  stats: {
    total_deposit?: number;
    total_withdrawal?: number;
    total_bet?: number;
    total_win?: number;
    total_referral_reward?: number;
    net_balance?: number;
  };
}

export function FinancialSummaryCards({ stats }: FinancialSummaryCardsProps) {
  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-green-600">
            <ArrowUp className="mr-1 h-4 w-4" />
            <span>Nạp tiền</span>
          </div>
          <div className="font-medium">
            {formatCurrency(stats.total_deposit || 0)}
          </div>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                ((stats.total_deposit || 0) /
                  ((stats.total_deposit || 0) +
                    (stats.total_withdrawal || 0))) *
                  100 || 0
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-red-600">
            <ArrowDown className="mr-1 h-4 w-4" />
            <span>Rút tiền</span>
          </div>
          <div className="font-medium">
            {formatCurrency(stats.total_withdrawal || 0)}
          </div>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                ((stats.total_withdrawal || 0) /
                  ((stats.total_deposit || 0) +
                    (stats.total_withdrawal || 0))) *
                  100 || 0
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-blue-600">
            <TrendingDown className="mr-1 h-4 w-4" />
            <span>Đặt cược</span>
          </div>
          <div className="font-medium">
            {formatCurrency(stats.total_bet || 0)}
          </div>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                ((stats.total_bet || 0) /
                  ((stats.total_bet || 0) + (stats.total_win || 0))) *
                  100 || 0
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-amber-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>Thắng cược</span>
          </div>
          <div className="font-medium">
            {formatCurrency(stats.total_win || 0)}
          </div>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{
              width: `${Math.min(
                100,
                ((stats.total_win || 0) /
                  ((stats.total_bet || 0) + (stats.total_win || 0))) *
                  100 || 0
              )}%`,
            }}
          />
        </div>
      </div>

      {(stats.total_referral_reward || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-purple-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>Thưởng giới thiệu</span>
            </div>
            <div className="font-medium">
              {formatCurrency(stats.total_referral_reward || 0)}
            </div>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}

      <div className="pt-2 border-t">
        <div className="flex items-center justify-between">
          <span className="font-medium">Tổng kết</span>
          <span
            className={`font-bold ${
              (stats.net_balance || 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {(stats.net_balance || 0) >= 0 ? "+" : ""}
            {formatCurrency(stats.net_balance || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
