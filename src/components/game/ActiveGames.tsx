// src/components/game/ActiveGames.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameCard } from "@/components/game/GameCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useActiveGamesQuery } from "@/hooks/queries/useGameQueries";
import { GameRound } from "@/types/database";

export function ActiveGames() {
  const { data, isLoading, error } = useActiveGamesQuery();

  const activeGames = data?.active || [];
  const upcomingGames = data?.upcoming || [];

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-[120px]" />
              <Skeleton className="h-6 w-[80px]" />
            </div>
          </CardHeader>
          <CardContent className="pb-2 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-[140px]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lượt chơi</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(error as Error).message || "Không thể tải thông tin lượt chơi"}
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="active">
                Đang diễn ra ({isLoading ? "..." : activeGames.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Sắp diễn ra ({isLoading ? "..." : upcomingGames.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {isLoading ? (
                <LoadingSkeleton />
              ) : activeGames.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  Không có lượt chơi nào đang diễn ra.
                </p>
              ) : (
                <div className="space-y-4">
                  {activeGames.map((game: GameRound) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {isLoading ? (
                <LoadingSkeleton />
              ) : upcomingGames.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground">
                  Không có lượt chơi nào sắp diễn ra.
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingGames.map((game: GameRound) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
