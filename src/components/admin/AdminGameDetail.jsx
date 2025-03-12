'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  useGameDetailQuery,
  useGameRoundResultsQuery,
  useGameRoundWinnersQuery,
  useUpdateGameRoundMutation,
  useSetGameResultMutation
} from '@/hooks/queries/useGameQueries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, formatDistance, isAfter, isBefore } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  ArrowLeft,
  Users,
  Award,
  Clock,
  DollarSign,
  CircleDollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Timer,
  BarChart2,
  Trophy,
  UserCheck,
  Eye,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'

// Schema for game result form
const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả là bắt buộc'),
  notes: z.string().optional()
})

// Schema for updating game status
const updateGameStatusSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled'])
})

export function AdminGameDetail({ gameId }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Queries for fetching game data
  const {
    data: gameData,
    isLoading: isGameLoading,
    error: gameError,
    refetch: refetchGame
  } = useGameDetailQuery(gameId)

  const { data: resultsData, isLoading: isResultsLoading } = useGameRoundResultsQuery(gameId)

  const { data: winnersData, isLoading: isWinnersLoading } = useGameRoundWinnersQuery(gameId)

  // Mutations for admin actions
  const updateGameMutation = useUpdateGameRoundMutation()
  const setResultMutation = useSetGameResultMutation()

  const game = gameData?.gameRound
  const betStats = resultsData?.betStats || {
    total_bets: 0,
    winning_bets: 0,
    total_bet_amount: 0,
    total_win_amount: 0
  }
  const winners = winnersData?.winners || []

  // Forms for dialogs
  const resultForm = useForm({
    resolver: zodResolver(gameResultSchema),
    defaultValues: {
      result: '',
      notes: ''
    }
  })

  const statusForm = useForm({
    resolver: zodResolver(updateGameStatusSchema),
    defaultValues: {
      status: game?.status || 'scheduled'
    },
    values: {
      status: game?.status || 'scheduled'
    }
  })

  // Reset form when game data changes
  useEffect(() => {
    if (game) {
      statusForm.reset({ status: game.status })
    }
  }, [game, statusForm])

  // Handlers for admin actions
  const handleSubmitResult = values => {
    setResultMutation.mutate(
      {
        gameId,
        data: values
      },
      {
        onSuccess: () => {
          setResultDialogOpen(false)
          refetchGame()
        }
      }
    )
  }

  const handleUpdateStatus = values => {
    updateGameMutation.mutate(
      {
        id: gameId,
        data: { status: values.status }
      },
      {
        onSuccess: () => {
          setStatusDialogOpen(false)
          refetchGame()
        }
      }
    )
  }

  const handleCancelGame = () => {
    updateGameMutation.mutate(
      {
        id: gameId,
        data: { status: 'cancelled' }
      },
      {
        onSuccess: () => {
          setCancelDialogOpen(false)
          refetchGame()
        }
      }
    )
  }

  // Utility functions
  const formatDate = date => {
    if (!date) return 'N/A'
    return format(new Date(date), 'HH:mm, dd/MM/yyyy', { locale: vi })
  }

  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>Đang diễn ra</Badge>
      case 'scheduled':
        return (
          <Badge variant='outline' className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'>
            Sắp diễn ra
          </Badge>
        )
      case 'completed':
        return <Badge variant='secondary'>Đã kết thúc</Badge>
      case 'cancelled':
        return <Badge variant='destructive'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Calculate time remaining (for active games) or time until start (for scheduled games)
  const getTimeInfo = () => {
    if (!game) return { text: '', isExpired: false }

    const now = new Date()

    if (game.status === 'active') {
      const endTime = new Date(game.end_time)
      const isExpired = isAfter(now, endTime)

      return {
        text: isExpired
          ? 'Đã hết thời gian'
          : `Kết thúc ${formatDistance(endTime, now, { locale: vi, addSuffix: true })}`,
        isExpired
      }
    }

    if (game.status === 'scheduled') {
      const startTime = new Date(game.start_time)
      const canStart = isAfter(now, startTime)

      return {
        text: canStart
          ? 'Có thể bắt đầu ngay'
          : `Bắt đầu ${formatDistance(startTime, now, { locale: vi, addSuffix: true })}`,
        canStart
      }
    }

    return { text: '', isExpired: false }
  }

  const timeInfo = game ? getTimeInfo() : { text: '', isExpired: false }

  // Check if admin can perform certain actions
  const canSetResult = game?.status === 'active' && timeInfo.isExpired
  const canActivate = game?.status === 'scheduled' && timeInfo.canStart
  const canCancel = game?.status !== 'completed' && game?.status !== 'cancelled'

  if (isGameLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <Skeleton className='h-8 w-[300px]' />
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-[400px]' />
          <Skeleton className='h-[400px]' />
        </div>
      </div>
    )
  }

  if (gameError || !game) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
        </div>

        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{gameError ? gameError.message : 'Không tìm thấy thông tin lượt chơi'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <h2 className='text-2xl font-bold'>Chi tiết lượt chơi #{gameId.substring(0, 8)}</h2>
          {getStatusBadge(game.status)}
        </div>

        <div className='flex items-center space-x-2'>
          <Button onClick={() => refetchGame()} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Làm mới
          </Button>

          {canSetResult && (
            <Button
              onClick={() => setResultDialogOpen(true)}
              variant='default'
              className='bg-green-600 hover:bg-green-700'
            >
              <Trophy className='mr-2 h-4 w-4' />
              Nhập kết quả
            </Button>
          )}

          {canActivate && (
            <Button
              onClick={() => {
                statusForm.setValue('status', 'active')
                setStatusDialogOpen(true)
              }}
              variant='default'
            >
              <Clock className='mr-2 h-4 w-4' />
              Kích hoạt
            </Button>
          )}

          {canCancel && (
            <Button
              onClick={() => setCancelDialogOpen(true)}
              variant='outline'
              className='text-red-500 border-red-300 hover:bg-red-50'
            >
              <XCircle className='mr-2 h-4 w-4' />
              Hủy lượt chơi
            </Button>
          )}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* Game info column */}
        <Card className='md:col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle>Thông tin lượt chơi</CardTitle>
            <CardDescription>Chi tiết và trạng thái lượt chơi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium text-muted-foreground'>Trạng thái</span>
                <div className='flex items-center space-x-2'>
                  {getStatusBadge(game.status)}
                  <Button variant='ghost' size='sm' onClick={() => setStatusDialogOpen(true)}>
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>Thời gian</span>
                <span className='text-sm font-medium'>{timeInfo.text}</span>
              </div>

              <div className='space-y-2'>
                <div className='grid grid-cols-3 gap-1'>
                  <span className='text-xs text-muted-foreground col-span-1'>ID</span>
                  <span className='text-xs font-mono break-all col-span-2'>{game.id}</span>
                </div>

                <div className='grid grid-cols-3 gap-1'>
                  <span className='text-xs text-muted-foreground col-span-1'>Bắt đầu</span>
                  <span className='text-xs col-span-2'>{formatDate(game.start_time)}</span>
                </div>

                <div className='grid grid-cols-3 gap-1'>
                  <span className='text-xs text-muted-foreground col-span-1'>Kết thúc</span>
                  <span className='text-xs col-span-2'>{formatDate(game.end_time)}</span>
                </div>

                <div className='grid grid-cols-3 gap-1'>
                  <span className='text-xs text-muted-foreground col-span-1'>Kết quả</span>
                  <span className='text-xs font-medium col-span-2'>{game.result || 'Chưa có kết quả'}</span>
                </div>

                <div className='grid grid-cols-3 gap-1'>
                  <span className='text-xs text-muted-foreground col-span-1'>Người tạo</span>
                  <span className='text-xs col-span-2'>
                    {game.creator?.display_name || game.creator?.username || 'N/A'}
                  </span>
                </div>

                <div className='grid grid-cols-3 gap-1'>
                  <span className='text-xs text-muted-foreground col-span-1'>Ngày tạo</span>
                  <span className='text-xs col-span-2'>{formatDate(game.created_at)}</span>
                </div>
              </div>

              <div className='flex flex-col space-y-1'>
                <span className='text-xs font-medium text-muted-foreground'>Số đặt cược</span>
                <div className='flex items-center'>
                  <Users className='h-4 w-4 mr-2 text-blue-500' />
                  <span className='text-sm font-medium'>{betStats.total_bets} lượt cược</span>
                </div>

                <span className='text-xs font-medium text-muted-foreground'>Tổng tiền đặt cược</span>
                <div className='flex items-center'>
                  <DollarSign className='h-4 w-4 mr-2 text-green-500' />
                  <span className='text-sm font-medium'>{formatCurrency(betStats.total_bet_amount)}</span>
                </div>

                <span className='text-xs font-medium text-muted-foreground'>Tổng tiền thắng</span>
                <div className='flex items-center'>
                  <Award className='h-4 w-4 mr-2 text-orange-500' />
                  <span className='text-sm font-medium'>{formatCurrency(betStats.total_win_amount)}</span>
                </div>

                <span className='text-xs font-medium text-muted-foreground'>Lợi nhuận</span>
                <div className='flex items-center'>
                  <CircleDollarSign className='h-4 w-4 mr-2 text-indigo-500' />
                  <span className='text-sm font-medium'>
                    {formatCurrency(betStats.total_bet_amount - betStats.total_win_amount)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className='pt-0'>
            <div className='flex flex-col w-full space-y-2'>
              {(game.status === 'active' || game.status === 'scheduled') && (
                <Button variant='outline' className='w-full justify-start' onClick={() => setStatusDialogOpen(true)}>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Cập nhật trạng thái
                </Button>
              )}

              {game.status === 'active' && (
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => setResultDialogOpen(true)}
                  disabled={!canSetResult}
                >
                  <Trophy className='mr-2 h-4 w-4' />
                  Nhập kết quả
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Tabs column for bets, winners, etc. */}
        <Card className='md:col-span-2'>
          <CardHeader className='px-6 py-4'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='grid grid-cols-3'>
                <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
                <TabsTrigger value='bets'>Danh sách cược</TabsTrigger>
                <TabsTrigger value='winners'>Người thắng</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value='overview' className='mt-0'>
              <div className='space-y-4'>
                {/* Time Status Card */}
                <Card>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <Calendar className='h-5 w-5 mr-2 text-blue-500' />
                        <div>
                          <h3 className='text-sm font-medium'>Thời gian</h3>
                          <p className='text-xs text-muted-foreground'>
                            {formatDate(game.start_time)} - {formatDate(game.end_time)}
                          </p>
                        </div>
                      </div>

                      <div>
                        {game.status === 'active' && (
                          <div className='flex items-center'>
                            <Timer className='h-4 w-4 mr-1 text-green-500' />
                            <span
                              className={`text-sm ${
                                timeInfo.isExpired ? 'text-red-500 font-medium' : 'text-green-500'
                              }`}
                            >
                              {timeInfo.text}
                            </span>
                          </div>
                        )}
                        {game.status === 'scheduled' && (
                          <div className='flex items-center'>
                            <Clock className='h-4 w-4 mr-1 text-blue-500' />
                            <span className='text-sm'>{timeInfo.text}</span>
                          </div>
                        )}
                        {game.status === 'completed' && (
                          <div className='flex items-center'>
                            <CheckCircle className='h-4 w-4 mr-1 text-green-500' />
                            <span className='text-sm'>Đã hoàn thành</span>
                          </div>
                        )}
                        {game.status === 'cancelled' && (
                          <div className='flex items-center'>
                            <XCircle className='h-4 w-4 mr-1 text-red-500' />
                            <span className='text-sm'>Đã hủy</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Card>
                    <CardContent className='p-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <h3 className='text-sm font-medium'>Thống kê cược</h3>
                        <Users className='h-4 w-4 text-blue-500' />
                      </div>
                      <div className='grid grid-cols-2 gap-y-3'>
                        <div>
                          <p className='text-xs text-muted-foreground'>Tổng số cược</p>
                          <p className='text-lg font-medium'>{betStats.total_bets}</p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>Cược thắng</p>
                          <p className='text-lg font-medium'>{betStats.winning_bets}</p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>Tỷ lệ thắng</p>
                          <p className='text-lg font-medium'>
                            {betStats.total_bets > 0
                              ? `${((betStats.winning_bets / betStats.total_bets) * 100).toFixed(1)}%`
                              : '0%'}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>Số chọn phổ biến</p>
                          <p className='text-lg font-medium'>-</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='p-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <h3 className='text-sm font-medium'>Thống kê tài chính</h3>
                        <BarChart2 className='h-4 w-4 text-green-500' />
                      </div>
                      <div className='grid grid-cols-2 gap-y-3'>
                        <div>
                          <p className='text-xs text-muted-foreground'>Tổng cược</p>
                          <p className='text-lg font-medium'>{formatCurrency(betStats.total_bet_amount)}</p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>Tổng thắng</p>
                          <p className='text-lg font-medium'>{formatCurrency(betStats.total_win_amount)}</p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>Lợi nhuận</p>
                          <p
                            className={`text-lg font-medium ${
                              betStats.total_bet_amount - betStats.total_win_amount >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(betStats.total_bet_amount - betStats.total_win_amount)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>Đặt cược TB</p>
                          <p className='text-lg font-medium'>
                            {betStats.total_bets > 0
                              ? formatCurrency(betStats.total_bet_amount / betStats.total_bets)
                              : formatCurrency(0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Result Section */}
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>Kết quả lượt chơi</CardTitle>
                    <CardDescription>
                      {game.status === 'completed'
                        ? 'Lượt chơi đã kết thúc với kết quả bên dưới'
                        : 'Lượt chơi chưa có kết quả'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {game.status === 'completed' ? (
                      <div className='flex flex-col items-center py-4'>
                        <div className='text-5xl font-bold mb-2'>{game.result}</div>
                        <div className='flex items-center text-sm text-muted-foreground'>
                          <Trophy className='h-4 w-4 mr-1 text-yellow-500' />
                          <span>{betStats.winning_bets} người thắng</span>
                        </div>
                        <div className='flex items-center text-sm text-muted-foreground mt-1'>
                          <Award className='h-4 w-4 mr-1 text-green-500' />
                          <span>Tổng thưởng: {formatCurrency(betStats.total_win_amount)}</span>
                        </div>
                      </div>
                    ) : game.status === 'cancelled' ? (
                      <div className='flex flex-col items-center justify-center py-6'>
                        <AlertTriangle className='h-12 w-12 text-red-500 mb-2' />
                        <p className='text-lg font-medium'>Lượt chơi đã bị hủy</p>
                        <p className='text-sm text-muted-foreground'>Tất cả các cược đã được hoàn tiền</p>
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center py-6'>
                        {timeInfo.isExpired && game.status === 'active' ? (
                          <>
                            <div className='flex items-center mb-4 text-amber-500'>
                              <AlertCircle className='h-8 w-8 mr-2' />
                              <div>
                                <p className='font-medium'>Lượt chơi đã hết thời gian</p>
                                <p className='text-sm'>Vui lòng nhập kết quả</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => setResultDialogOpen(true)}
                              variant='default'
                              className='bg-green-600 hover:bg-green-700'
                            >
                              <Trophy className='mr-2 h-4 w-4' />
                              Nhập kết quả ngay
                            </Button>
                          </>
                        ) : (
                          <>
                            <Clock className='h-12 w-12 text-blue-500 mb-2' />
                            <p className='text-lg font-medium'>Đang chờ kết quả</p>
                            <p className='text-sm text-muted-foreground'>
                              {game.status === 'active'
                                ? 'Kết quả sẽ được công bố sau khi lượt chơi kết thúc'
                                : 'Lượt chơi chưa bắt đầu'}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='bets' className='mt-0'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-medium'>Danh sách cược</h3>
                  <div className='flex items-center gap-2'>
                    <Input placeholder='Tìm kiếm...' className='max-w-xs h-8' />
                    <Select defaultValue='all'>
                      <SelectTrigger className='w-[180px] h-8'>
                        <SelectValue placeholder='Trạng thái' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                        <SelectItem value='pending'>Đang chờ</SelectItem>
                        <SelectItem value='won'>Thắng</SelectItem>
                        <SelectItem value='lost'>Thua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isResultsLoading ? (
                  <div className='space-y-2'>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className='h-12 w-full' />
                    ))}
                  </div>
                ) : betStats.total_bets === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <Users className='h-12 w-12 text-gray-300 mb-2' />
                    <p className='text-lg font-medium'>Chưa có lượt cược nào</p>
                    <p className='text-sm text-muted-foreground'>Người dùng chưa đặt cược cho lượt chơi này</p>
                  </div>
                ) : (
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người chơi</TableHead>
                          <TableHead>Số đã chọn</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Tiền thắng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Thời gian</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* This would typically come from an API call to fetch bets for this game */}
                        {/* Placeholder data for now */}
                        {[...Array(5)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='text-sm font-medium'>Người dùng {i + 1}</p>
                                  <p className='text-xs text-muted-foreground'>user{i + 1}@example.com</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='font-medium'>{Math.floor(Math.random() * 100)}</TableCell>
                            <TableCell>{formatCurrency(100000 * (i + 1))}</TableCell>
                            <TableCell>
                              {game.status === 'completed'
                                ? i % 2 === 0
                                  ? formatCurrency(900000 * (i + 1))
                                  : '-'
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {game.status === 'completed' ? (
                                i % 2 === 0 ? (
                                  <Badge className='bg-green-100 text-green-800'>Thắng</Badge>
                                ) : (
                                  <Badge variant='outline'>Thua</Badge>
                                )
                              ) : (
                                <Badge variant='secondary'>Đang chờ</Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {format(new Date(new Date().getTime() - i * 3600000), 'HH:mm, dd/MM/yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value='winners' className='mt-0'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='text-lg font-medium'>Người thắng cuộc</h3>
                  <div className='flex items-center gap-2'>
                    <Input placeholder='Tìm kiếm...' className='max-w-xs h-8' />
                  </div>
                </div>

                {isWinnersLoading ? (
                  <div className='space-y-2'>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className='h-12 w-full' />
                    ))}
                  </div>
                ) : game.status !== 'completed' ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <Trophy className='h-12 w-12 text-gray-300 mb-2' />
                    <p className='text-lg font-medium'>Chưa có kết quả</p>
                    <p className='text-sm text-muted-foreground'>
                      Danh sách người thắng sẽ hiển thị sau khi lượt chơi kết thúc
                    </p>
                  </div>
                ) : winners.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <UserCheck className='h-12 w-12 text-gray-300 mb-2' />
                    <p className='text-lg font-medium'>Không có người thắng</p>
                    <p className='text-sm text-muted-foreground'>
                      Không có người chơi nào đoán đúng kết quả {game.result}
                    </p>
                  </div>
                ) : (
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người chơi</TableHead>
                          <TableHead>Số đã chọn</TableHead>
                          <TableHead>Số tiền đặt</TableHead>
                          <TableHead>Tiền thắng</TableHead>
                          <TableHead>Thời gian</TableHead>
                          <TableHead className='text-right'>Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {winners.map(winner => (
                          <TableRow key={winner.id}>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarImage src={winner.profiles?.avatar_url} />
                                  <AvatarFallback>
                                    {(winner.profiles?.display_name ||
                                      winner.profiles?.username ||
                                      'U')[0].toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='text-sm font-medium'>
                                    {winner.profiles?.display_name || winner.profiles?.username}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='font-medium'>{winner.chosen_number}</TableCell>
                            <TableCell>{formatCurrency(winner.amount)}</TableCell>
                            <TableCell className='font-medium text-green-600'>
                              {formatCurrency(winner.potential_win)}
                            </TableCell>
                            <TableCell className='text-sm'>
                              {format(new Date(winner.created_at), 'HH:mm, dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => router.push(`/admin/users/${winner.profiles?.id}`)}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập kết quả lượt chơi</DialogTitle>
            <DialogDescription>Nhập kết quả trò chơi để xác định người thắng cuộc</DialogDescription>
          </DialogHeader>

          <Form {...resultForm}>
            <form onSubmit={resultForm.handleSubmit(handleSubmitResult)} className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-medium'>Thông tin lượt chơi</h3>
                  <Badge>{game.status}</Badge>
                </div>
                <div className='bg-muted p-3 rounded-md text-sm'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <p className='text-muted-foreground'>ID:</p>
                      <p className='font-mono text-xs'>{game.id.substring(0, 12)}...</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground'>Số lượt cược:</p>
                      <p>{betStats.total_bets}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground'>Bắt đầu:</p>
                      <p>{formatDate(game.start_time)}</p>
                    </div>
                    <div>
                      <p className='text-muted-foreground'>Kết thúc:</p>
                      <p>{formatDate(game.end_time)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={resultForm.control}
                name='result'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kết quả</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập kết quả' {...field} />
                    </FormControl>
                    <FormDescription>
                      Kết quả sẽ được dùng để xác định người thắng cuộc và phân phối tiền thưởng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={resultForm.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input placeholder='Ghi chú (tùy chọn)' {...field} />
                    </FormControl>
                    <FormDescription>Ghi chú nội bộ, chỉ admin có thể xem</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800'>
                <div className='flex items-center'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  <p className='font-medium'>Lưu ý quan trọng</p>
                </div>
                <p className='mt-1 text-xs'>
                  Sau khi nhập kết quả, hệ thống sẽ tự động xác định người thắng cuộc và phân phối tiền thưởng. Hành
                  động này không thể hoàn tác.
                </p>
              </div>

              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setResultDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type='submit' disabled={setResultMutation.isLoading}>
                  {setResultMutation.isLoading ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận kết quả'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái lượt chơi</DialogTitle>
            <DialogDescription>Thay đổi trạng thái của lượt chơi này</DialogDescription>
          </DialogHeader>

          <Form {...statusForm}>
            <form onSubmit={statusForm.handleSubmit(handleUpdateStatus)} className='space-y-4'>
              <FormField
                control={statusForm.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn trạng thái' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='scheduled'>Sắp diễn ra</SelectItem>
                        <SelectItem value='active'>Đang diễn ra</SelectItem>
                        <SelectItem value='completed'>Đã kết thúc</SelectItem>
                        <SelectItem value='cancelled'>Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Thay đổi trạng thái sẽ ảnh hưởng đến khả năng đặt cược và hiển thị của lượt chơi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setStatusDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type='submit' disabled={updateGameMutation.isLoading}>
                  {updateGameMutation.isLoading ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Đang xử lý...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy lượt chơi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy lượt chơi này? Tất cả các cược sẽ được hoàn tiền.
              {betStats.total_bets > 0 && (
                <p className='mt-2 font-medium'>
                  Có {betStats.total_bets} lượt cược với tổng số tiền {formatCurrency(betStats.total_bet_amount)} sẽ
                  được hoàn trả.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Không, giữ nguyên</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelGame} className='bg-red-600 hover:bg-red-700'>
              {updateGameMutation.isLoading ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Có, hủy lượt chơi'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
