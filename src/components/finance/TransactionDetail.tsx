// src/components/finance/TransactionDetail.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TransactionDetailProps {
  transaction: any;
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết giao dịch</DialogTitle>
          <DialogDescription>Thông tin chi tiết về giao dịch</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-1">ID Giao dịch:</h4>
              <p className="text-sm">{transaction.id}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Thời gian:</h4>
              <p className="text-sm">
                {format(
                  new Date(transaction.created_at),
                  "HH:mm:ss, dd/MM/yyyy"
                )}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Loại:</h4>
              <p className="text-sm">
                {getTransactionTypeBadge(transaction.type)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Trạng thái:</h4>
              <p className="text-sm">
                {getTransactionStatusBadge(transaction.status)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Số tiền:</h4>
              <p
                className={`text-sm font-semibold ${
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
              </p>
            </div>
            {transaction.description && (
              <div className="col-span-2">
                <h4 className="font-medium text-sm mb-1">Mô tả:</h4>
                <p className="text-sm">{transaction.description}</p>
              </div>
            )}
            {transaction.reference_id && (
              <div className="col-span-2">
                <h4 className="font-medium text-sm mb-1">Reference ID:</h4>
                <p className="text-sm">{transaction.reference_id}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
