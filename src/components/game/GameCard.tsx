// src/components/game/GameCard.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, ExternalLink } from "lucide-react";
import { GameRound } from "@/types/database";

interface GameCardProps {
  game: GameRound;
}

export function GameCard({ game }: GameCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLive, setIsLive] = useState<boolean>(false);

  const formattedStartTime = format(
    new Date(game.start_time),
    "HH:mm, dd/MM/yyyy",
    { locale: vi }
  );
  const formattedEndTime = format(
    new Date(game.end_time),
    "HH:mm, dd/MM/yyyy",
    { locale: vi }
  );

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const startTime = new Date(game.start_time);
      const endTime = new Date(game.end_time);

      if (now >= startTime && now < endTime) {
        setIsLive(true);
        setTimeLeft(
          `Kết thúc trong ${formatDistanceToNow(endTime, { locale: vi })}`
        );
      } else if (now < startTime) {
        setIsLive(false);
        setTimeLeft(
          `Bắt đầu trong ${formatDistanceToNow(startTime, { locale: vi })}`
        );
      } else {
        setIsLive(false);
        setTimeLeft("Đã kết thúc");
      }
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(intervalId);
  }, [game.start_time, game.end_time]);

  const getStatusBadge = () => {
    switch (game.status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Đang diễn ra
          </Badge>
        );
      case "scheduled":
        return <Badge variant="outline">Sắp diễn ra</Badge>;
      case "completed":
        return <Badge variant="secondary">Đã kết thúc</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{game.status}</Badge>;
    }
  };

  return (
    <Card className={isLive ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {isLive ? "🔴 " : ""}
            Lượt chơi #{game.id.substring(0, 8)}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{timeLeft}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p>Bắt đầu:</p>
              <p className="font-medium text-foreground">
                {formattedStartTime}
              </p>
            </div>
            <div>
              <p>Kết thúc:</p>
              <p className="font-medium text-foreground">{formattedEndTime}</p>
            </div>
          </div>

          {game.result && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Kết quả:</span>
                </div>
                <span className="text-xl font-bold">{game.result}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Link href={`/games/${game.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Chi tiết
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
