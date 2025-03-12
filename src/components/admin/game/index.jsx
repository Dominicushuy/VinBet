'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  RefreshCw,
  Plus,
  Calendar,
  Filter,
  Eye,
  ChevronDown,
  AlertCircle,
  ArrowUpDown,
  Users,
  DollarSign,
  Award,
  Search,
  Edit
} from 'lucide-react'
import { format, addHours, isAfter } from 'date-fns'
import {
  useGameRoundsQuery,
  useCreateGameRoundMutation,
  useUpdateGameRoundMutation,
  useSetGameResultMutation
} from '@/hooks/queries/useGameQueries'
import { formatCurrency } from '@/utils/formatUtils'

// Schema để tạo game round mới
const createGameRoundSchema = z.object({
  startTime: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
  endTime: z.string().min(1, 'Thời gian kết thúc là bắt buộc')
})

// Schema để cập nhật trạng thái game round
const updateGameRoundSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']),
  result: z.string().optional()
})

// Schema để nhập kết quả game
const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả là bắt buộc'),
  notes: z.string().optional()
})

export function AdminGameManagement() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const status = searchParams.get('status') || undefined
  const fromDate = searchParams.get('fromDate') || undefined
  const toDate = searchParams.get('toDate') || undefined
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 10)

  // Form để tạo game round mới
  const createForm = useForm({
    resolver: zodResolver(createGameRoundSchema),
    defaultValues: {
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
    }
  })

  // Form để cập nhật game round
  const updateForm = useForm({
    resolver: zodResolver(updateGameRoundSchema),
    defaultValues: {
      status: 'scheduled',
      result: ''
    }
  })

  // Form để nhập kết quả
  const resultForm = useForm({
    resolver: zodResolver(gameResultSchema),
    defaultValues: {
      result: '',
      notes: ''
    }
  })

  // Queries và Mutations
  const { data, isLoading, error, refetch } = useGameRoundsQuery({
    status: activeTab === 'all' ? status : activeTab,
    fromDate,
    toDate,
    page,
    pageSize
  })

  const createGameRoundMutation = useCreateGameRoundMutation()
  const updateGameRoundMutation = useUpdateGameRoundMutation()
  const setGameResultMutation = useSetGameResultMutation()

  const gameRounds = data?.gameRounds || []
  const pagination = data?.pagination || {
    total: 0,
    page,
    pageSize,
    totalPages: 0
  }

  // Effect để đặt lại selectedGame khi tab thay đổi
  useEffect(() => {
    setSelectedGame(null)
  }, [activeTab])

  // Xử lý khi thay đổi tab
  const handleTabChange = value => {
    setActiveTab(value)
    updateFilters({ status: value === 'all' ? undefined : value, page: 1 })
  }

  // Xử lý cập nhật bộ lọc
  const updateFilters = filters => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  // Xử lý thay đổi trang
  const handlePageChange = newPage => {
    updateFilters({ page: newPage })
  }

  // Xử lý filter theo trạng thái
  const handleStatusFilter = status => {
    updateFilters({ status, page: 1 })
  }

  // Xử lý sắp xếp
  const handleSort = column => {
    // Implement sorting logic here
  }

  // Mở dialog cập nhật
  const openUpdateDialog = game => {
    setSelectedGame(game)
    updateForm.reset({
      status: game.status,
      result: game.result || ''
    })
    setUpdateDialogOpen(true)
  }

  // Mở dialog nhập kết quả
  const openResultDialog = game => {
    setSelectedGame(game)
    resultForm.reset({
      result: '',
      notes: ''
    })
    setResultDialogOpen(true)
  }

  // Xử lý tạo game round
  const handleCreateGameRound = data => {
    createGameRoundMutation.mutate(data, {
      onSuccess: () => {
        setCreateDialogOpen(false)
        createForm.reset({
          startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          endTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm")
        })
      }
    })
  }

  // Xử lý cập nhật game round
  const handleUpdateGameRound = data => {
    if (!selectedGame) return

    // Cập nhật game round
    updateGameRoundMutation.mutate(
      {
        id: selectedGame.id,
        data: {
          status: data.status,
          result: data.result
        }
      },
      {
        onSuccess: () => {
          setUpdateDialogOpen(false)
        }
      }
    )
  }

  // Xử lý nhập kết quả
  const handleSubmitResult = data => {
    if (!selectedGame) return

    // Gọi API để nhập kết quả
    setGameResultMutation.mutate(
      {
        gameId: selectedGame.id,
        data: {
          result: data.result,
          notes: data.notes
        }
      },
      {
        onSuccess: () => {
          setResultDialogOpen(false)
        }
      }
    )
  }

  // Format date
  const formatDate = date => {
    return format(new Date(date), 'HH:mm, dd/MM/yyyy')
  }

  // Get status badge
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

  // Kiểm tra game có thể nhập kết quả
  const canEnterResult = game => {
    // Game đang diễn ra và đã hết thời gian kết thúc
    return game.status === 'active' && isAfter(new Date(), new Date(game.end_time))
  }

  // Kiểm tra game có thể kích hoạt
  const canActivate = game => {
    // Game chưa bắt đầu và thời gian hiện tại đã đến hoặc qua thời gian bắt đầu
    return game.status === 'scheduled' && !isAfter(new Date(game.start_time), new Date())
  }

  // Kiểm tra game có thể hủy
  const canCancel = game => {
    // Game chưa kết thúc
    return game.status !== 'completed' && game.status !== 'cancelled'
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý trò chơi</h2>
          <p className='text-muted-foreground'>Tạo và quản lý các lượt chơi trên hệ thống VinBet</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button onClick={() => refetch()} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Làm mới
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                Tạo lượt chơi mới
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo lượt chơi mới</DialogTitle>
                <DialogDescription>Thiết lập thông tin cho lượt chơi mới</DialogDescription>
              </DialogHeader>

              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateGameRound)} className='space-y-4'>
                  <FormField
                    control={createForm.control}
                    name='startTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian bắt đầu</FormLabel>
                        <FormControl>
                          <Input type='datetime-local' {...field} />
                        </FormControl>
                        <FormDescription>Thời điểm lượt chơi bắt đầu và người dùng có thể đặt cược</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name='endTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian kết thúc</FormLabel>
                        <FormControl>
                          <Input type='datetime-local' {...field} />
                        </FormControl>
                        <FormDescription>Thời điểm lượt chơi kết thúc và không thể đặt cược</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type='submit' disabled={createGameRoundMutation.isLoading}>
                      {createGameRoundMutation.isLoading ? (
                        <>
                          <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                          Đang tạo...
                        </>
                      ) : (
                        'Tạo lượt chơi'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className='px-6 py-4'>
          <div className='flex items-center justify-between'>
            <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
              <TabsList className='grid grid-cols-5'>
                <TabsTrigger value='all'>Tất cả</TabsTrigger>
                <TabsTrigger value='scheduled'>Sắp diễn ra</TabsTrigger>
                <TabsTrigger value='active'>Đang diễn ra</TabsTrigger>
                <TabsTrigger value='completed'>Đã kết thúc</TabsTrigger>
                <TabsTrigger value='cancelled'>Đã hủy</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center space-x-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='mr-2 h-4 w-4' />
                    Bộ lọc
                    <ChevronDown className='ml-2 h-4 w-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='grid gap-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium leading-none'>Khoảng thời gian</h4>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='date'
                          placeholder='Từ ngày'
                          onChange={e => updateFilters({ fromDate: e.target.value, page: 1 })}
                        />
                        <Input
                          type='date'
                          placeholder='Đến ngày'
                          onChange={e => updateFilters({ toDate: e.target.value, page: 1 })}
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        variant='outline'
                        className='justify-start'
                        onClick={() => {
                          updateFilters({
                            fromDate: format(new Date(), 'yyyy-MM-dd'),
                            toDate: format(new Date(), 'yyyy-MM-dd'),
                            page: 1
                          })
                        }}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        Hôm nay
                      </Button>
                      <Button
                        variant='outline'
                        className='justify-start'
                        onClick={() => {
                          const today = new Date()
                          const yesterday = new Date(today)
                          yesterday.setDate(yesterday.getDate() - 1)

                          updateFilters({
                            fromDate: format(yesterday, 'yyyy-MM-dd'),
                            toDate: format(yesterday, 'yyyy-MM-dd'),
                            page: 1
                          })
                        }}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        Hôm qua
                      </Button>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        variant='outline'
                        className='justify-start'
                        onClick={() => {
                          const today = new Date()
                          const weekStart = new Date(today)
                          weekStart.setDate(today.getDate() - today.getDay())

                          updateFilters({
                            fromDate: format(weekStart, 'yyyy-MM-dd'),
                            toDate: format(today, 'yyyy-MM-dd'),
                            page: 1
                          })
                        }}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        Tuần này
                      </Button>
                      <Button
                        variant='outline'
                        className='justify-start'
                        onClick={() => {
                          const today = new Date()
                          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

                          updateFilters({
                            fromDate: format(monthStart, 'yyyy-MM-dd'),
                            toDate: format(today, 'yyyy-MM-dd'),
                            page: 1
                          })
                        }}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        Tháng này
                      </Button>
                    </div>
                    <Button
                      variant='outline'
                      onClick={() => updateFilters({ fromDate: undefined, toDate: undefined, page: 1 })}
                    >
                      Reset
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className='flex items-center space-x-1'>
                <Input placeholder='Tìm kiếm...' className='w-[150px] h-8' />
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <Search className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Select value={pageSize.toString()} onValueChange={value => updateFilters({ pageSize: value, page: 1 })}>
                <SelectTrigger className='w-[120px] h-8'>
                  <SelectValue placeholder='10 mỗi trang' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10 mỗi trang</SelectItem>
                  <SelectItem value='20'>20 mỗi trang</SelectItem>
                  <SelectItem value='50'>50 mỗi trang</SelectItem>
                  <SelectItem value='100'>100 mỗi trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-7 gap-4'>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className='h-4' />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='grid grid-cols-7 gap-4'>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className='h-10' />
                  ))}
                </div>
              ))}
            </div>
          ) : gameRounds.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-muted-foreground'>Không tìm thấy lượt chơi nào.</p>
            </div>
          ) : (
            <div>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className='flex items-center space-x-1 cursor-pointer' onClick={() => handleSort('id')}>
                          <span>ID</span>
                          <ArrowUpDown className='h-3 w-3' />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className='flex items-center space-x-1 cursor-pointer'
                          onClick={() => handleSort('start_time')}
                        >
                          <span>Bắt đầu</span>
                          <ArrowUpDown className='h-3 w-3' />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className='flex items-center space-x-1 cursor-pointer'
                          onClick={() => handleSort('end_time')}
                        >
                          <span>Kết thúc</span>
                          <ArrowUpDown className='h-3 w-3' />
                        </div>
                      </TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Kết quả</TableHead>
                      <TableHead>Thống kê</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameRounds.map(game => (
                      <TableRow key={game.id}>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger className='cursor-help font-mono text-xs'>
                              {game.id.substring(0, 8)}...
                            </HoverCardTrigger>
                            <HoverCardContent side='right'>
                              <p className='text-xs font-mono'>{game.id}</p>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span>{format(new Date(game.start_time), 'HH:mm')}</span>
                            <span className='text-xs text-muted-foreground'>
                              {format(new Date(game.start_time), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span>{format(new Date(game.end_time), 'HH:mm')}</span>
                            <span className='text-xs text-muted-foreground'>
                              {format(new Date(game.end_time), 'dd/MM/yyyy')}
                            </span>
                            {game.status === 'active' && isAfter(new Date(), new Date(game.end_time)) && (
                              <span className='text-xs text-red-500'>Đã hết thời gian</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(game.status)}</TableCell>
                        <TableCell>
                          {game.result ? (
                            <span className='font-medium'>{game.result}</span>
                          ) : (
                            <span className='text-muted-foreground text-sm'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <div className='flex items-center'>
                              <Users className='h-3 w-3 mr-1 text-blue-500' />
                              <span className='text-xs'>{game.bets_count || 0} lượt cược</span>
                            </div>
                            <div className='flex items-center'>
                              <DollarSign className='h-3 w-3 mr-1 text-green-500' />
                              <span className='text-xs'>{formatCurrency(game.total_amount || 0)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end space-x-1'>
                            <Button variant='outline' size='sm' onClick={() => router.push(`/admin/games/${game.id}`)}>
                              <Eye className='h-4 w-4' />
                            </Button>

                            {canEnterResult(game) && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                onClick={() => openResultDialog(game)}
                              >
                                <Award className='h-4 w-4' />
                              </Button>
                            )}

                            <Button variant='outline' size='sm' onClick={() => openUpdateDialog(game)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className='mt-4 flex justify-center'>
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

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật lượt chơi</DialogTitle>
            <DialogDescription>Cập nhật trạng thái và kết quả của lượt chơi</DialogDescription>
          </DialogHeader>

          {selectedGame && (
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(handleUpdateGameRound)} className='space-y-4'>
                <div>
                  <p className='text-sm font-medium mb-1'>ID:</p>
                  <p className='text-sm font-mono'>{selectedGame.id}</p>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm font-medium mb-1'>Bắt đầu:</p>
                    <p className='text-sm'>{formatDate(selectedGame.start_time)}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium mb-1'>Kết thúc:</p>
                    <p className='text-sm'>{formatDate(selectedGame.end_time)}</p>
                  </div>
                </div>

                <FormField
                  control={updateForm.control}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {updateForm.watch('status') === 'completed' && (
                  <FormField
                    control={updateForm.control}
                    name='result'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kết quả</FormLabel>
                        <FormControl>
                          <Input placeholder='Nhập kết quả' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button type='button' variant='outline' onClick={() => setUpdateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type='submit' disabled={updateGameRoundMutation.isLoading}>
                    {updateGameRoundMutation.isLoading ? (
                      <>
                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                        Đang cập nhật...
                      </>
                    ) : (
                      'Cập nhật'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập kết quả lượt chơi</DialogTitle>
            <DialogDescription>Nhập kết quả trò chơi để xác định người thắng cuộc</DialogDescription>
          </DialogHeader>

          {selectedGame && (
            <Form {...resultForm}>
              <form onSubmit={resultForm.handleSubmit(handleSubmitResult)} className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-medium'>Thông tin lượt chơi</h3>
                    <Badge>{selectedGame.status}</Badge>
                  </div>
                  <div className='bg-muted p-3 rounded-md text-sm'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <p className='text-muted-foreground'>ID:</p>
                        <p className='font-mono text-xs'>{selectedGame.id.substring(0, 12)}...</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Số lượt cược:</p>
                        <p>{selectedGame.bets_count || 0}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Bắt đầu:</p>
                        <p>{format(new Date(selectedGame.start_time), 'HH:mm - dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground'>Kết thúc:</p>
                        <p>{format(new Date(selectedGame.end_time), 'HH:mm - dd/MM/yyyy')}</p>
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
                  <Button type='submit' disabled={setGameResultMutation.isLoading}>
                    {setGameResultMutation.isLoading ? (
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
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lượt chơi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lượt chơi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-600 hover:bg-red-700'
              onClick={() => {
                // Handle delete
                setConfirmDeleteDialogOpen(false)
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
