// src/components/game/GameResultNotification.tsx
"use client";

import { useEffect, useState } from "react";
import { X, Trophy, AlertCircle } from "lucide-react";
import { useGameRoundResults } from "@/hooks/queries/useGameQueries";
import { GameRound } from "@/types/database";

interface GameResultNotificationProps {
  gameRound: GameRound;
  onClose: () => void;
}

export function GameResultNotification({
  gameRound,
  onClose,
}: GameResultNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data, isLoading, error } = useGameRoundResults(gameRound.id);

  useEffect(() => {
    // Tự động đóng thông báo sau 10 giây
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Đợi animation hoàn thành
  };

  // Format tiền Việt Nam
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div
      className={`fixed right-4 bottom-4 max-w-sm w-full z-50 ${
        isVisible ? "opacity-100" : "opacity-0 translate-y-10"
      } transition-all duration-300`}
    >
      <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : error ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <Trophy className="h-6 w-6 text-amber-500" />
              )}
              <h3 className="font-semibold">
                {isLoading
                  ? "Đang tải kết quả..."
                  : error
                  ? "Lỗi"
                  : `Kết quả lượt chơi #${gameRound.id.substring(0, 8)}`}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </button>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <p className="text-center text-muted-foreground text-sm">
                Đang tải thông tin kết quả...
              </p>
            ) : error ? (
              <p className="text-center text-destructive text-sm">
                Không thể tải kết quả. Vui lòng thử lại sau.
              </p>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">
                      {gameRound.result}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">Tổng cược</p>
                    <p className="font-medium">
                      {data?.betStats.total_bets || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Người thắng</p>
                    <p className="font-medium">
                      {data?.betStats.winning_bets || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Tổng cược</p>
                    <p className="font-medium">
                      {formatMoney(data?.betStats.total_bet_amount || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Tổng thắng</p>
                    <p className="font-medium">
                      {formatMoney(data?.betStats.total_win_amount || 0)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-muted/50 text-sm text-center">
          <a
            href={`/games/${gameRound.id}`}
            className="text-primary hover:underline"
          >
            Xem chi tiết lượt chơi
          </a>
        </div>
      </div>
    </div>
  );
}
