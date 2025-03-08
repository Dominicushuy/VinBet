// src/components/game/GameResult.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameRoundResults } from "@/hooks/queries/useGameQueries";
import { GameRound } from "@/types/database";

interface GameResultProps {
  gameRound: GameRound;
}

export function GameResult({ gameRound }: GameResultProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const { data, isLoading, error } = useGameRoundResults(gameRound.id);

  // Nếu game round chưa kết thúc, không hiển thị kết quả
  if (gameRound.status !== "completed") {
    return null;
  }

  // Format tiền Việt Nam
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleShowAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 3000);
  };

  if (isLoading) {
    return <ResultSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kết quả</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
          <p className="text-center text-muted-foreground">
            Không thể tải kết quả. Vui lòng thử lại sau.
          </p>
        </CardContent>
      </Card>
    );
  }

  const betStats = data?.betStats || {
    total_bets: 0,
    winning_bets: 0,
    total_bet_amount: 0,
    total_win_amount: 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Kết quả
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        {showAnimation ? (
          <ResultAnimation result={gameRound.result!} />
        ) : (
          <>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                Số trúng thưởng
              </div>
              <div className="text-5xl font-bold text-primary">
                {gameRound.result}
              </div>
            </div>

            <div className="grid grid-cols-2 w-full gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Tổng cược</div>
                <div className="text-lg font-semibold">
                  {betStats.total_bets}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Người thắng</div>
                <div className="text-lg font-semibold">
                  {betStats.winning_bets}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Tổng đặt cược
                </div>
                <div className="text-lg font-semibold">
                  {formatMoney(betStats.total_bet_amount)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Tổng trả thưởng
                </div>
                <div className="text-lg font-semibold">
                  {formatMoney(betStats.total_win_amount)}
                </div>
              </div>
            </div>

            <Button onClick={handleShowAnimation} variant="outline">
              Xem lại animation
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Animation kết quả
function ResultAnimation({ result }: { result: string }) {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const animationSteps = 20; // Số bước trong animation
    const animationDuration = 2000; // Thời gian animation (ms)
    const stepInterval = animationDuration / animationSteps;

    const intervalId = setInterval(() => {
      if (animationStep < animationSteps - 1) {
        setCurrentNumber(Math.floor(Math.random() * 10));
        setAnimationStep((prev) => prev + 1);
      } else {
        // Bước cuối, hiển thị kết quả thật
        setCurrentNumber(parseInt(result));
        clearInterval(intervalId);
      }
    }, stepInterval);

    return () => clearInterval(intervalId);
  }, [result, animationStep]);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="text-sm text-muted-foreground mb-4">Đang quay số...</div>
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-5xl font-bold text-primary animate-pulse">
          {currentNumber}
        </span>
      </div>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="grid grid-cols-2 w-full gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-6 w-16 mx-auto" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-32" />
      </CardContent>
    </Card>
  );
}
