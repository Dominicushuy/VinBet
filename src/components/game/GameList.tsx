// src/components/game/GameList.tsx
"use client";

import { useState, useEffect } from "react";
import { GameCard } from "@/components/game/GameCard";
import { GameFilters } from "@/components/game/GameFilters";
import { GameListSkeleton } from "@/components/game/GameListSkeleton";
import { Pagination } from "@/components/ui/pagination";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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

  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [gameRounds, setGameRounds] = useState<GameRound[]>(
    initialData?.gameRounds || []
  );
  const [pagination, setPagination] = useState({
    total: initialData?.pagination.total || 0,
    page: initialData?.pagination.page || 1,
    pageSize: initialData?.pagination.pageSize || 10,
    totalPages: initialData?.pagination.totalPages || 0,
  });

  const status = searchParams.get("status") || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;
  const page = Number(searchParams.get("page") || pagination.page);
  const pageSize = Number(searchParams.get("pageSize") || pagination.pageSize);

  const fetchGameRounds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      params.append("page", page.toString());
      params.append("pageSize", pageSize.toString());

      const response = await fetch(`/api/game-rounds?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch game rounds");
      }

      const data = await response.json();
      setGameRounds(data.gameRounds);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching game rounds");
      console.error("Game rounds fetch error:", err);
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    if (
      !initialData ||
      status !== undefined ||
      fromDate !== undefined ||
      toDate !== undefined ||
      page !== pagination.page ||
      pageSize !== pagination.pageSize
    ) {
      fetchGameRounds();
    }
  }, [status, fromDate, toDate, page, pageSize]);

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
          <AlertDescription>{error}</AlertDescription>
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
          {gameRounds.map((game) => (
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
