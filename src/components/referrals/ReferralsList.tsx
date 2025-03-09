// src/components/referrals/ReferralsList.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useReferralsListQuery } from "@/hooks/queries/useReferralQueries";

export function ReferralsList() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading } = useReferralsListQuery({
    status,
    page,
    pageSize,
  });

  const formatMoney = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giới thiệu</CardTitle>
          <CardDescription>Những người bạn đã giới thiệu</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const referrals = data?.referrals || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Đang chờ</Badge>;
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Danh sách giới thiệu</CardTitle>
            <CardDescription>Những người bạn đã giới thiệu</CardDescription>
          </div>
          <div className="w-32">
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(value === "all" ? undefined : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Bạn chưa giới thiệu ai.
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={referral.referred?.avatar_url || ""}
                      alt="Avatar"
                    />
                    <AvatarFallback>
                      {(referral.referred?.display_name ||
                        referral.referred?.username ||
                        "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {referral.referred?.display_name ||
                        referral.referred?.username ||
                        "Người dùng"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Đăng ký{" "}
                      {formatDistanceToNow(new Date(referral.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="mb-1">{getStatusBadge(referral.status)}</div>
                  <div className="text-sm">
                    {referral.status === "completed" ? (
                      <span className="text-green-600">
                        +{formatMoney(referral.reward_amount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Chưa hoàn thành
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
