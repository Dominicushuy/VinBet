// src/app/(main)/games/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, User, Trophy, Calendar } from "lucide-react";
import { GameRound, Bet, Profile } from "@/types/database";
import { BetForm } from "@/components/bet/BetForm";
import { BetList } from "@/components/bet/BetList";
import { GameResult } from "@/components/game/GameResult";
import { WinnerList } from "@/components/game/WinnerList";

interface GamePageProps {
  params: {
    id: string;
  };
}

// Định nghĩa kiểu dữ liệu cho game với relationships
interface GameWithRelations extends GameRound {
  creator: Profile | null;
  bets: { count: number } | null;
}

export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const supabase = createServerClient();

  const { data: game } = await supabase
    .from("game_rounds")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!game) {
    return {
      title: "Game not found - VinBet",
    };
  }

  return {
    title: `Lượt chơi #${params.id.substring(0, 8)} - VinBet`,
    description: `Chi tiết lượt chơi VinBet từ ${format(
      new Date(game.start_time),
      "dd/MM/yyyy"
    )}`,
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const supabase = createServerClient();

  // Sử dụng kiểu dữ liệu rõ ràng cho kết quả trả về
  const { data, error } = await supabase
    .from("game_rounds")
    .select(
      `
      *,
      creator:profiles!game_rounds_created_by_fkey(id, username, display_name, avatar_url),
      bets:bets(count)
    `
    )
    .eq("id", params.id)
    .single();

  // Sử dụng type assertion
  const game = data as unknown as GameWithRelations;

  if (error || !game) {
    console.error("Game fetch error:", error);
    notFound();
  }

  // Lấy danh sách cược của người dùng hiện tại cho lượt chơi này
  const { data: userBets } = await supabase
    .from("bets")
    .select("*")
    .eq("game_round_id", params.id)
    .order("created_at", { ascending: false });

  // Format dates
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
  const formattedCreatedAt = format(
    new Date(game.created_at || ""),
    "dd/MM/yyyy",
    {
      locale: vi,
    }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Lượt chơi #{params.id.substring(0, 8)}
          </h2>
          <p className="text-muted-foreground">Chi tiết lượt chơi và kết quả</p>
        </div>
        <div>{getStatusBadge(game.status)}</div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin lượt chơi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Thời gian bắt đầu</span>
                  </div>
                  <p className="font-medium">{formattedStartTime}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Thời gian kết thúc</span>
                  </div>
                  <p className="font-medium">{formattedEndTime}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Người tạo</span>
                </div>
                <p className="font-medium">
                  {game.creator?.display_name ||
                    game.creator?.username ||
                    "Admin"}
                </p>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày tạo</span>
                </div>
                <p className="font-medium">{formattedCreatedAt}</p>
              </div>

              {game.status === "completed" && game.result && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>Kết quả</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold">{game.result}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Thêm form đặt cược cho lượt chơi đang active */}
          {game.status === "active" && <BetForm gameRound={game} />}
        </div>

        {/* Sidebar - Your bets / Leaderboard */}
        <div className="space-y-6">
          <BetList gameRoundId={params.id} initialBets={userBets as Bet[]} />
          <GameResult gameRound={game} />
          <WinnerList gameRound={game} />

          {game.status === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Người thắng cuộc</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-6 text-muted-foreground">
                  Đang tải danh sách người thắng...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
