// src/components/finance/TransactionDashboard.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialSummary } from "@/components/finance/FinancialSummary";
import { TransactionHistoryTable } from "@/components/finance/TransactionHistoryTable";
import { TransactionChartView } from "@/components/finance/TransactionChartView";
import { TransactionAdvancedFilters } from "@/components/finance/TransactionAdvancedFilters";
import { ExportTransactions } from "@/components/finance/ExportTransactions";

interface TransactionDashboardProps {
  initialData: {
    transactions: any[];
    summary: any;
    profile: any;
  };
}

export function TransactionDashboard({
  initialData,
}: TransactionDashboardProps) {
  // State for filters
  const [filters, setFilters] = useState({
    type: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Current page for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // View mode (table or chart)
  const [viewMode, setViewMode] = useState<"list" | "chart" | "analytics">(
    "list"
  );

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <FinancialSummary
        summaryData={initialData.summary}
        balance={initialData.profile?.balance || 0}
      />

      {/* View Selector and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) =>
            setViewMode(v as "list" | "chart" | "analytics")
          }
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="list">Danh sách</TabsTrigger>
            <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>
        </Tabs>

        <ExportTransactions filters={filters} />
      </div>

      {/* Advanced Filters */}
      <TransactionAdvancedFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Main Content Based on View Mode */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>
            {viewMode === "list" && "Lịch sử giao dịch"}
            {viewMode === "chart" && "Biểu đồ giao dịch"}
            {viewMode === "analytics" && "Phân tích giao dịch"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === "list" && (
            <TransactionHistoryTable
              initialData={initialData.transactions}
              filters={filters}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}

          {viewMode === "chart" && <TransactionChartView filters={filters} />}

          {viewMode === "analytics" && (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                Tính năng phân tích giao dịch chi tiết sẽ sớm được cập nhật.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
