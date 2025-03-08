// src/components/bet/BetSuccess.tsx
"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bet } from "@/types/database";

interface BetSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bet: Bet;
}

export function BetSuccess({ open, onOpenChange, bet }: BetSuccessProps) {
  // Format tiền Việt Nam
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Đặt cược thành công
          </DialogTitle>
          <DialogDescription>
            Cược của bạn đã được ghi nhận thành công
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Mã cược:</div>
            <div>#{bet.id.substring(0, 8)}</div>

            <div className="font-medium">Số đã chọn:</div>
            <div className="font-bold text-primary">{bet.chosen_number}</div>

            <div className="font-medium">Số tiền cược:</div>
            <div>{formatMoney(bet.amount)}</div>

            <div className="font-medium">Tiền thưởng tiềm năng:</div>
            <div className="font-bold text-primary">
              {formatMoney(bet.potential_win)}
            </div>
          </div>

          <div className="rounded-md bg-primary/10 p-4 text-sm">
            <p className="font-medium text-primary">Lưu ý:</p>
            <p className="mt-1">
              Kết quả sẽ được công bố sau khi lượt chơi kết thúc. Tiền thưởng sẽ
              được tự động cộng vào tài khoản của bạn nếu bạn thắng.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
          <Button type="button" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
