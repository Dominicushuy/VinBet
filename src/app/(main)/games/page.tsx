'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  ListFilter,
  LayoutGrid,
  LayoutList,
  Search,
  Calendar,
  Clock,
  Trophy,
  Filter,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { GameCard } from '@/components/game/GameCard'
import { GameListItem } from '@/components/game/GameListItem'
import { Pagination } from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { useGameRoundsQuery } from '@/hooks/queries/useGameQueries'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { GameRound } from '@/types/database'

export default function GamesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // View state
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') || ''
  )
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest')
  const [fromDate, setFromDate] = useState<Date | undefined>(
    searchParams.get('fromDate')
      ? new Date(searchParams.get('fromDate')!)
      : undefined
  )
  const [toDate, setToDate] = useState<Date | undefined>(
    searchParams.get('toDate')
      ? new Date(searchParams.get('toDate')!)
      : undefined
  )
  const [jackpotOnly, setJackpotOnly] = useState(
    searchParams.get('jackpotOnly') === 'true'
  )

  // Pagination
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('pageSize')) || 12
  )

  // Query data
  const { data, isLoading, error, refetch } = useGameRoundsQuery({
    status: status !== 'all' ? status : undefined,
    fromDate: fromDate?.toISOString(),
    toDate: toDate?.toISOString(),
    query: searchQuery || undefined,
    page,
    pageSize,
    sortBy,
    jackpotOnly: jackpotOnly ? 'true' : undefined,
  })

  const gameRounds = data?.gameRounds || []
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
  }

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchQuery) params.set('query', searchQuery)
    if (status !== 'all') params.set('status', status)
    if (sortBy !== 'newest') params.set('sortBy', sortBy)
    if (fromDate) params.set('fromDate', fromDate.toISOString())
    if (toDate) params.set('toDate', toDate.toISOString())
    if (jackpotOnly) params.set('jackpotOnly', 'true')
    if (page > 1) params.set('page', page.toString())
    if (pageSize !== 12) params.set('pageSize', pageSize.toString())

    router.push(`/games?${params.toString()}`)
    setIsFiltersOpen(false)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setStatus('all')
    setSortBy('newest')
    setFromDate(undefined)
    setToDate(undefined)
    setJackpotOnly(false)
    setPage(1)

    router.push('/games')
    setIsFiltersOpen(false)
    toast.success('Đã đặt lại bộ lọc')
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/games?${params.toString()}`)

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    status !== 'all' ? status : null,
    sortBy !== 'newest' ? sortBy : null,
    fromDate,
    toDate,
    jackpotOnly,
  ].filter(Boolean).length

  // Loading skeletons
  const GameCardSkeleton = () => (
    <Card className='overflow-hidden h-[280px]'>
      <CardContent className='p-0 flex flex-col h-full'>
        <div className='h-40 bg-muted animate-pulse'></div>
        <div className='p-4 space-y-3 flex-1'>
          <Skeleton className='h-5 w-3/4' />
          <div className='flex justify-between'>
            <Skeleton className='h-4 w-1/3' />
            <Skeleton className='h-4 w-1/4' />
          </div>
          <div className='flex justify-between items-center mt-auto pt-2'>
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-8 w-16 rounded-md' />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const GameListItemSkeleton = () => (
    <Card className='overflow-hidden'>
      <CardContent className='p-4 flex items-center gap-4'>
        <Skeleton className='h-16 w-16 rounded-md' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-5 w-3/4' />
          <div className='flex gap-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-24' />
          </div>
        </div>
        <Skeleton className='h-9 w-24 rounded-md' />
      </CardContent>
    </Card>
  )

  return (
    <div className='space-y-6'>
      {/* Page Header with Welcome Message */}
      <div className='relative bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 overflow-hidden mb-6'>
        <div className='absolute inset-0 bg-grid-white/10 bg-[size:16px_16px] opacity-10'></div>

        <div className='relative z-10 flex flex-col md:flex-row justify-between gap-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight flex items-center'>
              <Gamepad2 className='mr-2 h-6 w-6 text-primary' />
              Trò chơi
            </h1>
            <p className='text-muted-foreground mt-1'>
              Khám phá và tham gia các lượt chơi hấp dẫn, đặt cược và nhận
              thưởng lớn
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Sắp xếp theo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Mới nhất</SelectItem>
                <SelectItem value='endingSoon'>Sắp kết thúc</SelectItem>
                <SelectItem value='mostPlayed'>Nhiều lượt chơi</SelectItem>
                <SelectItem value='highestPot'>Tiền thưởng cao</SelectItem>
              </SelectContent>
            </Select>

            <div className='flex border rounded-md overflow-hidden'>
              <Button
                variant={view === 'grid' ? 'default' : 'ghost'}
                size='icon'
                onClick={() => setView('grid')}
                className='rounded-none border-0'>
                <LayoutGrid className='h-4 w-4' />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size='icon'
                onClick={() => setView('list')}
                className='rounded-none border-0'>
                <LayoutList className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Tìm kiếm lượt chơi...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9 pr-12'
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
          {searchQuery && (
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7'
              onClick={() => {
                setSearchQuery('')
                if (searchParams.has('query')) {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('query')
                  router.push(`/games?${params.toString()}`)
                }
              }}>
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        {/* Mobile Filters */}
        <div className='sm:hidden'>
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' className='w-full flex justify-between'>
                <span className='flex items-center'>
                  <Filter className='mr-2 h-4 w-4' />
                  Bộ lọc
                </span>
                {activeFiltersCount > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-[90vw] sm:w-[400px]'>
              <div className='space-y-6 py-4'>
                <div>
                  <h3 className='text-lg font-semibold'>Bộ lọc</h3>
                  <p className='text-sm text-muted-foreground'>
                    Lọc danh sách lượt chơi theo nhu cầu của bạn
                  </p>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium'>Trạng thái</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className='w-full mt-1'>
                        <SelectValue placeholder='Tất cả trạng thái' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Tất cả</SelectItem>
                        <SelectItem value='active'>Đang diễn ra</SelectItem>
                        <SelectItem value='scheduled'>Sắp diễn ra</SelectItem>
                        <SelectItem value='completed'>Đã kết thúc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Từ ngày</label>
                    <DatePicker
                      date={fromDate}
                      setDate={setFromDate}
                      className='w-full mt-1'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Đến ngày</label>
                    <DatePicker
                      date={toDate}
                      setDate={setToDate}
                      className='w-full mt-1'
                    />
                  </div>

                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='jackpotOnly-mobile'
                      checked={jackpotOnly}
                      onChange={(e) => setJackpotOnly(e.target.checked)}
                      className='rounded border-gray-300'
                    />
                    <label
                      htmlFor='jackpotOnly-mobile'
                      className='text-sm font-medium'>
                      Chỉ hiển thị Jackpot
                    </label>
                  </div>
                </div>

                <Separator />

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={resetFilters}
                    className='flex-1'>
                    <X className='mr-2 h-4 w-4' />
                    Đặt lại
                  </Button>
                  <Button onClick={applyFilters} className='flex-1'>
                    <Filter className='mr-2 h-4 w-4' />
                    Áp dụng
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className='hidden sm:block'>
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant='outline'>
                <ListFilter className='mr-2 h-4 w-4' />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <Badge variant='secondary' className='ml-2'>
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Bộ lọc nâng cao</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Trạng thái</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder='Tất cả trạng thái' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Tất cả</SelectItem>
                        <SelectItem value='active'>Đang diễn ra</SelectItem>
                        <SelectItem value='scheduled'>Sắp diễn ra</SelectItem>
                        <SelectItem value='completed'>Đã kết thúc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Sắp xếp theo</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder='Sắp xếp theo' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='newest'>Mới nhất</SelectItem>
                        <SelectItem value='endingSoon'>Sắp kết thúc</SelectItem>
                        <SelectItem value='mostPlayed'>
                          Nhiều lượt chơi
                        </SelectItem>
                        <SelectItem value='highestPot'>
                          Tiền thưởng cao
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Từ ngày</label>
                    <DatePicker date={fromDate} setDate={setFromDate} />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Đến ngày</label>
                    <DatePicker date={toDate} setDate={setToDate} />
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='jackpotOnly'
                    checked={jackpotOnly}
                    onChange={(e) => setJackpotOnly(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <label htmlFor='jackpotOnly' className='text-sm font-medium'>
                    Chỉ hiển thị Jackpot
                  </label>
                </div>
              </div>
              <div className='flex justify-between'>
                <Button variant='outline' onClick={resetFilters}>
                  <X className='mr-2 h-4 w-4' />
                  Đặt lại
                </Button>
                <Button onClick={applyFilters}>
                  <Filter className='mr-2 h-4 w-4' />
                  Áp dụng
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          variant='default'
          onClick={() => {
            applyFilters()
            refetch()
          }}>
          <Search className='mr-2 h-4 w-4' />
          Tìm kiếm
        </Button>
      </div>

      {/* Quick Filters Tabs */}
      <Tabs
        defaultValue='all'
        value={status}
        onValueChange={(value) => {
          setStatus(value)
          const params = new URLSearchParams(searchParams.toString())
          if (value === 'all') {
            params.delete('status')
          } else {
            params.set('status', value)
          }
          params.set('page', '1')
          router.push(`/games?${params.toString()}`)
        }}>
        <TabsList className='w-full grid grid-cols-4'>
          <TabsTrigger value='all' className='flex gap-1 items-center'>
            <Gamepad2 className='h-4 w-4' />
            <span className='hidden sm:inline'>Tất cả</span>
          </TabsTrigger>
          <TabsTrigger value='active' className='flex gap-1 items-center'>
            <Clock className='h-4 w-4' />
            <span className='hidden sm:inline'>Đang diễn ra</span>
          </TabsTrigger>
          <TabsTrigger value='scheduled' className='flex gap-1 items-center'>
            <Calendar className='h-4 w-4' />
            <span className='hidden sm:inline'>Sắp diễn ra</span>
          </TabsTrigger>
          <TabsTrigger value='completed' className='flex gap-1 items-center'>
            <Trophy className='h-4 w-4' />
            <span className='hidden sm:inline'>Đã kết thúc</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap gap-2 items-center p-2 bg-muted/50 rounded-lg'>
          <span className='text-sm text-muted-foreground font-medium px-2'>
            Bộ lọc:
          </span>

          {status !== 'all' && (
            <Badge variant='secondary' className='gap-1 group'>
              Trạng thái:{' '}
              {status === 'active'
                ? 'Đang diễn ra'
                : status === 'scheduled'
                ? 'Sắp diễn ra'
                : 'Đã kết thúc'}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setStatus('all')
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('status')
                  router.push(`/games?${params.toString()}`)
                }}
              />
            </Badge>
          )}

          {searchQuery && (
            <Badge variant='secondary' className='gap-1'>
              Tìm kiếm: {searchQuery}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setSearchQuery('')
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('query')
                  router.push(`/games?${params.toString()}`)
                }}
              />
            </Badge>
          )}

          {fromDate && (
            <Badge variant='secondary' className='gap-1'>
              Từ: {fromDate.toLocaleDateString('vi-VN')}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setFromDate(undefined)
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('fromDate')
                  router.push(`/games?${params.toString()}`)
                }}
              />
            </Badge>
          )}

          {toDate && (
            <Badge variant='secondary' className='gap-1'>
              Đến: {toDate.toLocaleDateString('vi-VN')}
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setToDate(undefined)
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('toDate')
                  router.push(`/games?${params.toString()}`)
                }}
              />
            </Badge>
          )}

          {jackpotOnly && (
            <Badge variant='secondary' className='gap-1'>
              Chỉ Jackpot
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setJackpotOnly(false)
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('jackpotOnly')
                  router.push(`/games?${params.toString()}`)
                }}
              />
            </Badge>
          )}

          <Button
            variant='ghost'
            size='sm'
            onClick={resetFilters}
            className='ml-auto'>
            <X className='mr-1 h-3 w-3' />
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div>
          {view === 'grid' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <GameListItemSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className='p-8 text-center bg-destructive/10 rounded-lg'>
          <p className='text-destructive font-medium'>
            Không thể tải dữ liệu trò chơi.
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            {(error as Error).message}
          </p>
          <Button variant='outline' onClick={() => refetch()} className='mt-4'>
            Thử lại
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && gameRounds.length === 0 && (
        <div className='p-12 text-center bg-muted/50 rounded-lg'>
          <Gamepad2 className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium'>Không tìm thấy lượt chơi nào</h3>
          <p className='text-muted-foreground mt-1 mb-4'>
            Không có lượt chơi nào phù hợp với các bộ lọc hiện tại
          </p>
          <Button variant='outline' onClick={resetFilters}>
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* Game List */}
      {!isLoading && !error && gameRounds.length > 0 && (
        <AnimatePresence mode='wait'>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}>
            {view === 'grid' ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {gameRounds.map((game: GameRound) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className='transform transition-all duration-200'>
                    <GameCard game={game} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className='space-y-3'>
                {gameRounds.map((game: GameRound) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className='hover:ring-1 hover:ring-primary/10 rounded-lg transition-all'>
                    <GameListItem game={game} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!isLoading &&
        !error &&
        gameRounds.length > 0 &&
        pagination.totalPages > 1 && (
          <div className='flex justify-center mt-8'>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      {/* Results Summary */}
      {!isLoading && !error && gameRounds.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Hiển thị <span className='font-medium'>{gameRounds.length}</span> trên
          tổng số <span className='font-medium'>{pagination.total}</span> lượt
          chơi
        </div>
      )}
    </div>
  )
}
