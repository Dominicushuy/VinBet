// src/components/admin/GameRoundManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GameFilters } from "@/components/game/GameFilters";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { GameRound } from "@/types/database";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Form schema for creating a new game round
const createGameRoundSchema = z.object({
  startTime: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Thời gian kết thúc là bắt buộc"),
});

// Form schema for updating a game round status
const updateGameRoundSchema = z.object({
  status: z.enum(["scheduled", "active", "completed", "cancelled"]),
  result: z.string().optional(),
});

export function GameRoundManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameRounds, setGameRounds] = useState<GameRound[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameRound | null>(null);

  const status = searchParams.get("status") || undefined;
  const fromDate = searchParams.get("fromDate") || undefined;
  const toDate = searchParams.get("toDate") || undefined;
  const page = Number(searchParams.get("page") || pagination.page);
  const pageSize = Number(searchParams.get("pageSize") || pagination.pageSize);

  // Form for creating a new game round
  const createForm = useForm<z.infer<typeof createGameRoundSchema>>({
    resolver: zodResolver(createGameRoundSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  // Form for updating a game round
  const updateForm = useForm<z.infer<typeof updateGameRoundSchema>>({
    resolver: zodResolver(updateGameRoundSchema),
    defaultValues: {
      status: "scheduled",
      result: "",
    },
  });

  // Fetch game rounds
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

  // Create a new game round
  const handleCreateGameRound = async (
    data: z.infer<typeof createGameRoundSchema>
  ) => {
    try {
      const response = await fetch("/api/game-rounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: data.startTime,
          endTime: data.endTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create game round");
      }

      toast.success("Lượt chơi đã được tạo thành công");
      setCreateDialogOpen(false);
      createForm.reset();
      fetchGameRounds();
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo lượt chơi");
      console.error("Create game round error:", err);
    }
  };

  // Update a game round
  const handleUpdateGameRound = async (
    data: z.infer<typeof updateGameRoundSchema>
  ) => {
    try {
      if (!selectedGame) return;

      // Validate result when status is completed
      if (data.status === "completed" && !data.result) {
        toast.error("Kết quả là bắt buộc khi trạng thái là 'Đã kết thúc'");
        return;
      }

      const response = await fetch(`/api/game-rounds/${selectedGame.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: data.status,
          result: data.result,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update game round");
      }

      toast.success("Lượt chơi đã được cập nhật thành công");
      setUpdateDialogOpen(false);
      updateForm.reset();
      fetchGameRounds();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật lượt chơi");
      console.error("Update game round error:", err);
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

  const openUpdateDialog = (game: GameRound) => {
    setSelectedGame(game);
    updateForm.reset({
      status: game.status as any,
      result: game.result || "",
    });
    setUpdateDialogOpen(true);
  };

  useEffect(() => {
    fetchGameRounds();
  }, [status, fromDate, toDate, page, pageSize]);

  // Format date for display
  const formatDate = (date: string) => {
    return format(new Date(date), "HH:mm, dd/MM/yyyy");
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Đang diễn ra</Badge>;
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
      <div className="flex items-center justify-between">
        <Button onClick={() => fetchGameRounds()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo lượt chơi mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo lượt chơi mới</DialogTitle>
              <DialogDescription>
                Thiết lập thông tin cho lượt chơi mới
              </DialogDescription>
            </DialogHeader>

            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateGameRound)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian kết thúc</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Tạo lượt chơi</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lượt chơi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4" />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-10" />
                  ))}
                </div>
              ))}
            </div>
          ) : gameRounds.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                Không tìm thấy lượt chơi nào.
              </p>
            </div>
          ) : (
            <div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Bắt đầu</TableHead>
                      <TableHead>Kết thúc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Kết quả</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameRounds.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">
                          {game.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{formatDate(game.start_time)}</TableCell>
                        <TableCell>{formatDate(game.end_time)}</TableCell>
                        <TableCell>{getStatusBadge(game.status)}</TableCell>
                        <TableCell>
                          {game.result ? (
                            <span className="font-medium">{game.result}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUpdateDialog(game)}
                          >
                            Cập nhật
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật lượt chơi</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái và kết quả của lượt chơi
            </DialogDescription>
          </DialogHeader>

          {selectedGame && (
            <Form {...updateForm}>
              <form
                onSubmit={updateForm.handleSubmit(handleUpdateGameRound)}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm font-medium mb-1">ID:</p>
                  <p className="text-sm">{selectedGame.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Bắt đầu:</p>
                    <p className="text-sm">
                      {formatDate(selectedGame.start_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Kết thúc:</p>
                    <p className="text-sm">
                      {formatDate(selectedGame.end_time)}
                    </p>
                  </div>
                </div>

                <FormField
                  control={updateForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Sắp diễn ra</SelectItem>
                          <SelectItem value="active">Đang diễn ra</SelectItem>
                          <SelectItem value="completed">Đã kết thúc</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {updateForm.watch("status") === "completed" && (
                  <FormField
                    control={updateForm.control}
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kết quả</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập kết quả" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button type="submit">Cập nhật</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
