'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Plus, AlertCircle } from 'lucide-react'
import {
  useGameRoundsQuery,
  useCreateGameRoundMutation,
  useUpdateGameRoundMutation,
  useSetGameResultMutation
} from '@/hooks/queries/useGameQueries'
import { useDialogState } from '@/hooks/useDialogState'
import { useGameFilters } from '@/hooks/useGameFilters'
import { GameTable } from './GameTable'
import { GameFilters } from './GameFilters'
import { CreateGameDialog } from './CreateGameDialog'
import { UpdateGameDialog } from './UpdateGameDialog'
import { ResultDialog } from './ResultDialog'
import { EmptyState } from './EmptyState'

// Status labels for display
const STATUS_LABELS = {
  all: 'Tất cả',
  scheduled: 'Sắp diễn ra',
  active: 'Đang diễn ra',
  completed: 'Đã kết thúc',
  cancelled: 'Đã hủy'
}

export function AdminGameManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedGame, setSelectedGame] = useState(null)
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom hooks
  const { dialogs, openDialog, closeDialog } = useDialogState()
  const {
    filters,
    handlePageChange,
    handleStatusFilter,
    handleDateFilter,
    handleSearch,
    handlePageSizeChange,
    resetFilters
  } = useGameFilters()

  // Queries và Mutations
  const { data, isLoading, error, refetch } = useGameRoundsQuery({
    status: activeTab === 'all' ? filters.status : activeTab,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    sortBy: sortField,
    sortOrder: sortDirection
  })

  const createGameRoundMutation = useCreateGameRoundMutation()
  const updateGameRoundMutation = useUpdateGameRoundMutation()
  const setGameResultMutation = useSetGameResultMutation()

  // Memoize data to prevent unnecessary re-renders
  const gameRounds = useMemo(() => data?.gameRounds || [], [data])
  const pagination = useMemo(
    () =>
      data?.pagination || {
        total: 0,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: 0
      },
    [data, filters.page, filters.pageSize]
  )

  // Reset submitting state when mutations are done
  useEffect(() => {
    if (!createGameRoundMutation.isLoading && !updateGameRoundMutation.isLoading && !setGameResultMutation.isLoading) {
      setIsSubmitting(false)
    }
  }, [createGameRoundMutation.isLoading, updateGameRoundMutation.isLoading, setGameResultMutation.isLoading])

  // Xử lý khi thay đổi tab
  const handleTabChange = useCallback(
    value => {
      setActiveTab(value)
      handleStatusFilter(value === 'all' ? undefined : value)
    },
    [handleStatusFilter]
  )

  // Xử lý sắp xếp
  const handleSort = useCallback(
    field => {
      setSortDirection(current => (sortField === field && current === 'asc' ? 'desc' : 'asc'))
      setSortField(field)
    },
    [sortField]
  )

  // Xử lý mở dialog update
  const handleOpenUpdateDialog = useCallback(
    game => {
      setSelectedGame(game)
      openDialog('update')
    },
    [openDialog]
  )

  // Xử lý mở dialog result
  const handleOpenResultDialog = useCallback(
    game => {
      setSelectedGame(game)
      openDialog('result')
    },
    [openDialog]
  )

  // Chuyển đến trang chi tiết
  const handleViewGame = useCallback(
    gameId => {
      router.push(`/admin/games/${gameId}`)
    },
    [router]
  )

  // Xử lý tạo game round
  const handleCreateGameRound = useCallback(
    data => {
      setIsSubmitting(true)
      createGameRoundMutation.mutate(data, {
        onSuccess: () => {
          closeDialog('create')
        },
        onError: () => {
          setIsSubmitting(false)
        }
      })
    },
    [createGameRoundMutation, closeDialog]
  )

  // Xử lý cập nhật game round
  const handleUpdateGameRound = useCallback(
    data => {
      if (!selectedGame) return

      setIsSubmitting(true)
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
            closeDialog('update')
          },
          onError: () => {
            setIsSubmitting(false)
          }
        }
      )
    },
    [selectedGame, updateGameRoundMutation, closeDialog]
  )

  // Xử lý nhập kết quả
  const handleSubmitResult = useCallback(
    data => {
      if (!selectedGame) return

      setIsSubmitting(true)
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
            closeDialog('result')
          },
          onError: () => {
            setIsSubmitting(false)
          }
        }
      )
    },
    [selectedGame, setGameResultMutation, closeDialog]
  )

  // Determine if any operation is in progress
  const isOperationInProgress =
    isSubmitting ||
    createGameRoundMutation.isLoading ||
    updateGameRoundMutation.isLoading ||
    setGameResultMutation.isLoading

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý trò chơi</h2>
          <p className='text-muted-foreground'>Tạo và quản lý các lượt chơi trên hệ thống VinBet</p>
        </div>

        <div className='flex flex-wrap gap-2 w-full sm:w-auto'>
          <Button onClick={refetch} variant='outline' size='sm' className='w-full sm:w-auto'>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button
            onClick={() => openDialog('create')}
            size='sm'
            className='w-full sm:w-auto'
            disabled={isOperationInProgress}
          >
            <Plus className='mr-2 h-4 w-4' />
            Tạo lượt chơi mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className='px-6 py-4'>
          <div className='flex items-center justify-between overflow-x-auto'>
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
          <GameFilters
            onSearch={handleSearch}
            onDateFilter={handleDateFilter}
            onPageSizeChange={handlePageSizeChange}
            pageSize={filters.pageSize}
            resetFilters={resetFilters}
          />

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
                  <div key={i} className='h-4 bg-gray-200 animate-pulse rounded'></div>
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='grid grid-cols-7 gap-4'>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className='h-10 bg-gray-200 animate-pulse rounded'></div>
                  ))}
                </div>
              ))}
            </div>
          ) : gameRounds.length === 0 ? (
            <EmptyState activeTab={activeTab} onViewAll={() => handleTabChange('all')} statusLabels={STATUS_LABELS} />
          ) : (
            <GameTable
              gameRounds={gameRounds}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSort={handleSort}
              onView={handleViewGame}
              onUpdate={handleOpenUpdateDialog}
              onResult={handleOpenResultDialog}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateGameDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        onSubmit={handleCreateGameRound}
        isLoading={createGameRoundMutation.isLoading || isSubmitting}
      />

      <UpdateGameDialog
        open={dialogs.update}
        onClose={() => closeDialog('update')}
        onSubmit={handleUpdateGameRound}
        isLoading={updateGameRoundMutation.isLoading || isSubmitting}
        game={selectedGame}
      />

      <ResultDialog
        open={dialogs.result}
        onClose={() => closeDialog('result')}
        onSubmit={handleSubmitResult}
        isLoading={setGameResultMutation.isLoading || isSubmitting}
        game={selectedGame}
      />
    </div>
  )
}
