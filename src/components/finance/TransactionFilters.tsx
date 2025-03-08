// src/components/finance/TransactionFilters.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface TransactionFiltersProps {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  onFilterChange: (filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export function TransactionFilters({
  type,
  status,
  startDate,
  endDate,
  onFilterChange,
}: TransactionFiltersProps) {
  const [typeFilter, setTypeFilter] = useState(type || "");
  const [statusFilter, setStatusFilter] = useState(status || "");
  const [startDateFilter, setStartDateFilter] = useState(startDate || "");
  const [endDateFilter, setEndDateFilter] = useState(endDate || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined,
    });
  };

  const handleReset = () => {
    setTypeFilter("");
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    onFilterChange({
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="type">
                Loại giao dịch
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="deposit">Nạp tiền</SelectItem>
                  <SelectItem value="withdrawal">Rút tiền</SelectItem>
                  <SelectItem value="bet">Đặt cược</SelectItem>
                  <SelectItem value="win">Thắng cược</SelectItem>
                  <SelectItem value="referral_reward">
                    Thưởng giới thiệu
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="status">
                Trạng thái
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="startDate">
                Từ ngày
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="endDate">
                Đến ngày
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
