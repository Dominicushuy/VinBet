// src/components/finance/TransactionAdvancedFilters.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TransactionAdvancedFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters: any;
}

export function TransactionAdvancedFilters({
  onFilterChange,
  initialFilters,
}: TransactionAdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: initialFilters.type || "",
    status: initialFilters.status || "",
    startDate: initialFilters.startDate
      ? new Date(initialFilters.startDate)
      : undefined,
    endDate: initialFilters.endDate
      ? new Date(initialFilters.endDate)
      : undefined,
    minAmount: initialFilters.minAmount || "",
    maxAmount: initialFilters.maxAmount || "",
    sortBy: initialFilters.sortBy || "created_at",
    sortOrder: initialFilters.sortOrder || "desc",
  });

  // Count active filters (excluding sort options)
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "sortBy" || key === "sortOrder") return false;
    if (value === "" || value === undefined) return false;
    return true;
  }).length;

  // Handle apply filters
  const handleApplyFilters = () => {
    // Format dates to ISO string if they exist
    const formattedFilters = {
      ...filters,
      startDate:
        filters.startDate && isValid(filters.startDate)
          ? filters.startDate.toISOString()
          : undefined,
      endDate:
        filters.endDate && isValid(filters.endDate)
          ? filters.endDate.toISOString()
          : undefined,
    };

    // Remove empty filters
    Object.keys(formattedFilters).forEach((key) => {
      if (formattedFilters[key] === "" || formattedFilters[key] === undefined) {
        delete formattedFilters[key];
      }
    });

    onFilterChange(formattedFilters);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      type: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
      minAmount: "",
      maxAmount: "",
      sortBy: "created_at",
      sortOrder: "desc",
    };

    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setFilters((prev) => ({
      ...prev,
      startDate: range.from,
      endDate: range.to,
    }));
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Bộ lọc nâng cao</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} lọc đang áp dụng
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="h-4 w-4 mr-1" /> Xóa bộ lọc
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <Separator />
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Transaction Type Filter */}
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Loại giao dịch
                </label>
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
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

              {/* Status Filter */}
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Trạng thái
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="pending">Đang xử lý</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Số tiền
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Từ"
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minAmount: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <span>-</span>
                  <Input
                    placeholder="Đến"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxAmount: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Khoảng thời gian</label>
                <DateRangePicker
                  initialDateFrom={filters.startDate}
                  initialDateTo={filters.endDate}
                  onUpdate={handleDateRangeChange}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium">
                  Sắp xếp theo:
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Thời gian</SelectItem>
                    <SelectItem value="amount">Số tiền</SelectItem>
                    <SelectItem value="type">Loại giao dịch</SelectItem>
                    <SelectItem value="status">Trạng thái</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sortOrder}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, sortOrder: value }))
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Giảm dần" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                    <SelectItem value="asc">Tăng dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetFilters}>
                  Đặt lại
                </Button>
                <Button onClick={handleApplyFilters}>Áp dụng bộ lọc</Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
