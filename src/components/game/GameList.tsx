// src/components/game/GameList.tsx
"use client";

import { GameCard } from "@/components/game/GameCard";
import { GameFilters } from "@/components/game/GameFilters";
import { GameListSkeleton } from "@/components/game/GameListSkeleton";
import { Pagination } from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGameRoundsQuery } from "@/hooks/queries/useGameQueries";
import { GameRound } from "@/types/database";

interface GameListProps {
  initialData?: {
    gameRounds: GameRound[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export function GameList({ initialData }: GameListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;
  const page = Number(
    searchParams.get("page") || initialData?.pagination.page || 1
  );
  const pageSize = Number(
    searchParams.get("pageSize") || initialData?.pagination.pageSize || 10
  );

  const queryParams = {
    status,
    fromDate,
    toDate,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useGameRoundsQuery(queryParams);

  const gameRounds = data?.gameRounds || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  };

  const updateFilters = (filters: any) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    });

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <GameFilters
        status={status}
        fromDate={fromDate}
        toDate={toDate}
        onFilterChange={updateFilters}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as Error).message || "Không thể tải dữ liệu"}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <GameListSkeleton count={pageSize} />
      ) : gameRounds.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Không tìm thấy lượt chơi nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gameRounds.map((game: GameRound) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
