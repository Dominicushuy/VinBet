// src/app/(main)/games/page.jsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, ListFilter, LayoutGrid, LayoutList, Search, Calendar, Clock, Trophy, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { useGameRoundsQuery } from '@/hooks/queries/useGameQueries'
import { toast } from 'react-hot-toast'
import { useGameFilters } from '@/hooks/useGameFilters'

// Import components
import SearchBar from '@/components/game/SearchBar'
import FilterBadges from '@/components/game/FilterBadges'
import FilterDialog from '@/components/game/FilterDialog'
import MobileFilterSheet from '@/components/game/MobileFilterSheet'
import GameGrid from '@/components/game/GameGrid'
import GameList from '@/components/game/GameList'
import LoadingState from '@/components/game/LoadingState'
import ErrorState from '@/components/game/ErrorState'
import EmptyState from '@/components/game/EmptyState'

export default function GamesPage() {
  // View state
  const [view, setView] = useState('grid')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Filter management via custom hook
  const {
    searchQuery,
    setSearchQuery,
    status,
    setStatus,
    sortBy,
    setSortBy,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    jackpotOnly,
    setJackpotOnly,
    page,
    pageSize,
    activeFiltersCount,
    queryParams,
    applyFilters,
    resetFilters,
    handlePageChange,
    removeFilter
  } = useGameFilters()

  // Query data with memoized params
  const { data, isLoading, error, refetch } = useGameRoundsQuery(queryParams)

  // Memoize game data to prevent unnecessary renders
  const gameRounds = useMemo(() => data?.gameRounds || [], [data])
  const pagination = useMemo(
    () =>
      data?.pagination || {
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 0
      },
    [data]
  )

  // Handle search action
  const handleSearch = useCallback(() => {
    applyFilters()
  }, [applyFilters])

  // Clear search query
  const clearSearchQuery = useCallback(() => {
    setSearchQuery('')
    removeFilter('query')
  }, [setSearchQuery, removeFilter])

  // Apply filter with validation
  const handleApplyFilters = useCallback(() => {
    if (applyFilters()) {
      setIsFiltersOpen(false)
    }
  }, [applyFilters])

  // Reset filters with toast feedback
  const handleResetFilters = useCallback(() => {
    if (resetFilters()) {
      toast.success('Đã đặt lại bộ lọc')
    }
  }, [resetFilters])

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
              Khám phá và tham gia các lượt chơi hấp dẫn, đặt cược và nhận thưởng lớn
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
                className='rounded-none border-0'
              >
                <LayoutGrid className='h-4 w-4' />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size='icon'
                onClick={() => setView('list')}
                className='rounded-none border-0'
              >
                <LayoutList className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={clearSearchQuery}
          onSearch={handleSearch}
          hasValue={!!searchQuery}
        />

        {/* Mobile Filters */}
        <div className='sm:hidden'>
          <MobileFilterSheet
            open={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            activeFiltersCount={activeFiltersCount}
            status={status}
            fromDate={fromDate}
            toDate={toDate}
            jackpotOnly={jackpotOnly}
            onStatusChange={setStatus}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onJackpotOnlyChange={setJackpotOnly}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Desktop Filters */}
        <div className='hidden sm:block'>
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant='outline'>
                <ListFilter className='mr-2 h-4 w-4' />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <span className='ml-1 rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs flex items-center justify-center'>
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <FilterDialog
              status={status}
              sortBy={sortBy}
              fromDate={fromDate}
              toDate={toDate}
              jackpotOnly={jackpotOnly}
              onStatusChange={setStatus}
              onSortByChange={setSortBy}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onJackpotOnlyChange={setJackpotOnly}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </Dialog>
        </div>

        <Button variant='default' onClick={handleSearch}>
          <Search className='mr-2 h-4 w-4' />
          Tìm kiếm
        </Button>
      </div>

      {/* Quick Filters Tabs */}
      <Tabs
        defaultValue='all'
        value={status}
        onValueChange={value => {
          setStatus(value)
          // Update page to 1 when changing status
          if (page !== 1) {
            const newParams = { ...queryParams, status: value, page: 1 }
            removeFilter('page')
          }
          applyFilters()
        }}
      >
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
      <FilterBadges
        activeFiltersCount={activeFiltersCount}
        status={status}
        searchQuery={searchQuery}
        fromDate={fromDate}
        toDate={toDate}
        jackpotOnly={jackpotOnly}
        onRemoveFilter={removeFilter}
        onResetAllFilters={handleResetFilters}
      />

      {/* Loading State */}
      {isLoading && <LoadingState viewType={view} />}

      {/* Error State */}
      {error && !isLoading && <ErrorState error={error} onRetry={refetch} />}

      {/* Empty State */}
      {!isLoading && !error && gameRounds.length === 0 && <EmptyState onResetFilters={handleResetFilters} />}

      {/* Game List */}
      {!isLoading && !error && gameRounds.length > 0 && (
        <AnimatePresence mode='wait'>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'grid' ? <GameGrid games={gameRounds} /> : <GameList games={gameRounds} />}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!isLoading && !error && gameRounds.length > 0 && pagination.totalPages > 1 && (
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
          Hiển thị <span className='font-medium'>{gameRounds.length}</span> trên tổng số{' '}
          <span className='font-medium'>{pagination.total}</span> lượt chơi
        </div>
      )}
    </div>
  )
}
