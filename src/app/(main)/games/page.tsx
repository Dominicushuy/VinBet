// src/app/(main)/games/page.tsx
import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { GameList } from "@/components/game/GameList";

export const metadata: Metadata = {
  title: "Trò chơi - VinBet",
  description: "Danh sách các lượt chơi trên nền tảng VinBet",
};

interface GamesPageProps {
  searchParams: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: string;
    pageSize?: string;
  };
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const supabase = createServerClient();

  const status = searchParams.status;
  const fromDate = searchParams.fromDate;
  const toDate = searchParams.toDate;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 12;

  const { data, error } = await supabase.rpc("get_game_rounds", {
    status_filter: status || null,
    from_date: fromDate || null,
    to_date: toDate || null,
    page_number: page,
    page_size: pageSize,
  });

  let gameRounds = [];
  let totalCount = 0;

  if (!error && data && data.length > 0) {
    totalCount = data[0].total_count;
    gameRounds = data.map(({ total_count, ...rest }) => rest);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trò chơi</h2>
        <p className="text-muted-foreground">
          Xem các lượt chơi và đặt cược tại đây
        </p>
      </div>

      <GameList
        initialData={{
          gameRounds,
          pagination: {
            total: totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
          },
        }}
      />
    </div>
  );
}
