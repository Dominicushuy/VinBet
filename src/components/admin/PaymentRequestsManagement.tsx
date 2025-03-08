// src/components/admin/PaymentRequestsManagement.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { PaymentStatus } from "@/components/finance/PaymentStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useAdminPaymentRequestsQuery,
  useProcessPaymentRequestMutation,
} from "@/hooks/queries/useAdminQueries";

export function PaymentRequestsManagement() {
  const [selectedType, setSelectedType] = useState<string | undefined>(
    "deposit"
  );
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    "pending"
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [viewProofDialogOpen, setViewProofDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data, isLoading, refetch } = useAdminPaymentRequestsQuery({
    type: selectedType as any,
    status: selectedStatus as any,
    page,
    pageSize,
  });

  const approveMutation = useProcessPaymentRequestMutation("approve");
  const rejectMutation = useProcessPaymentRequestMutation("reject");

  const paymentRequests = data?.paymentRequests || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  // Format tiền Việt Nam
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewProof = (request: any) => {
    setSelectedRequest(request);
    setViewProofDialogOpen(true);
  };

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setApproveDialogOpen(true);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setRejectDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    try {
      await approveMutation.mutateAsync({
        id: selectedRequest.id,
        notes: adminNotes,
      });
      setApproveDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error approving payment:", error);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;

    try {
      await rejectMutation.mutateAsync({
        id: selectedRequest.id,
        notes: adminNotes,
      });
      setRejectDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error rejecting payment:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Quản lý thanh toán
          </h2>
          <p className="text-muted-foreground">
            Xem và xử lý các yêu cầu nạp/rút tiền từ người dùng
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Yêu cầu thanh toán</CardTitle>
              <CardDescription>
                Danh sách các yêu cầu nạp/rút tiền của người dùng
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Bộ lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="deposit"
            className="w-full"
            onValueChange={(value) => {
              setSelectedType(value === "all" ? undefined : value);
              setPage(1);
            }}
          >
            <div className="flex justify-between mb-4">
              <TabsList>
                <TabsTrigger value="deposit">Nạp tiền</TabsTrigger>
                <TabsTrigger value="withdrawal">Rút tiền</TabsTrigger>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
              </TabsList>

              <TabsList>
                <TabsTrigger
                  value="pending"
                  onClick={() => {
                    setSelectedStatus("pending");
                    setPage(1);
                  }}
                >
                  Đang xử lý
                </TabsTrigger>
                <TabsTrigger
                  value="all_status"
                  onClick={() => {
                    setSelectedStatus(undefined);
                    setPage(1);
                  }}
                >
                  Tất cả trạng thái
                </TabsTrigger>
              </TabsList>
            </div>

            <PaymentRequestsTable
              paymentRequests={paymentRequests}
              isLoading={isLoading}
              formatMoney={formatMoney}
              onViewProof={handleViewProof}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </Tabs>

          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Proof Dialog */}
      <Dialog open={viewProofDialogOpen} onOpenChange={setViewProofDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bằng chứng thanh toán</DialogTitle>
            <DialogDescription>
              Xem bằng chứng thanh toán đã tải lên bởi người dùng
            </DialogDescription>
          </DialogHeader>

          {selectedRequest?.proof_url ? (
            <div className="flex justify-center">
              <img
                src={selectedRequest.proof_url}
                alt="Payment proof"
                className="max-h-[60vh] object-contain rounded-md border"
              />
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Người dùng chưa tải lên bằng chứng thanh toán
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewProofDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phê duyệt</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn phê duyệt yêu cầu nạp tiền này? Số tiền{" "}
              {selectedRequest ? formatMoney(selectedRequest.amount) : ""} sẽ
              được cộng vào tài khoản của người dùng.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">
              Ghi chú (không bắt buộc)
            </label>
            <Textarea
              placeholder="Nhập ghi chú cho người dùng"
              className="mt-1"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              disabled={approveMutation.isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Phê duyệt"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn từ chối yêu cầu nạp tiền này?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Nhập lý do từ chối cho người dùng"
              className="mt-1"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              required
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={rejectMutation.isLoading || !adminNotes.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {rejectMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Từ chối"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PaymentRequestsTableProps {
  paymentRequests: any[];
  isLoading: boolean;
  formatMoney: (amount: number) => string;
  onViewProof: (request: any) => void;
  onApprove: (request: any) => void;
  onReject: (request: any) => void;
}

function PaymentRequestsTable({
  paymentRequests,
  isLoading,
  formatMoney,
  onViewProof,
  onApprove,
  onReject,
}: PaymentRequestsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (paymentRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Không có yêu cầu nào.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={request.profiles?.avatar_url}
                      alt={
                        request.profiles?.display_name ||
                        request.profiles?.username
                      }
                    />
                    <AvatarFallback>
                      {(request.profiles?.display_name ||
                        request.profiles?.username ||
                        "U")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {request.profiles?.display_name ||
                        request.profiles?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.profiles?.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(request.created_at), "HH:mm, dd/MM/yyyy", {
                  locale: vi,
                })}
              </TableCell>
              <TableCell>
                {formatPaymentMethod(request.payment_method)}
              </TableCell>
              <TableCell>{formatMoney(request.amount)}</TableCell>
              <TableCell>
                <PaymentStatus status={request.status} />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {request.proof_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProof(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {request.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onApprove(request)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onReject(request)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper function to format payment method
function formatPaymentMethod(method: string) {
  switch (method) {
    case "bank_transfer":
      return "Chuyển khoản";
    case "momo":
      return "MoMo";
    case "zalopay":
      return "ZaloPay";
    case "card":
      return "Thẻ tín dụng";
    default:
      return method;
  }
}
