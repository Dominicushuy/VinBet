// src/hooks/queries/useGameQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { toast } from "react-hot-toast";

// Query keys
export const GAME_QUERY_KEYS = {
  activeGames: ["games", "active"],
  gamesList: (filters?: any) => ["games", "list", { ...filters }],
  gameDetail: (id: string) => ["games", "detail", id],
};

// Queries
export function useActiveGamesQuery() {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.activeGames,
    queryFn: () => apiService.games.getActiveGames(),
    refetchInterval: 60000, // 1 minute
  });
}

export function useGameRoundsQuery(params?: any) {
  return useQuery({
    queryKey: GAME_QUERY_KEYS.gamesList(params),
    queryFn: () => apiService.games.getGameRounds(params),
    keepPreviousData: true,
  });
}

// Mutations
export function useCreateGameRoundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { startTime: string; endTime: string }) =>
      apiService.games.createGameRound(data),
    onSuccess: () => {
      toast.success("Lượt chơi đã được tạo thành công");
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.activeGames });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.gamesList() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể tạo lượt chơi");
    },
  });
}

export function useUpdateGameRoundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.games.updateGameRound(id, data),
    onSuccess: (_, variables) => {
      toast.success("Lượt chơi đã được cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.activeGames });
      queryClient.invalidateQueries({ queryKey: GAME_QUERY_KEYS.gamesList() });
      queryClient.invalidateQueries({
        queryKey: GAME_QUERY_KEYS.gameDetail(variables.id),
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể cập nhật lượt chơi");
    },
  });
}
