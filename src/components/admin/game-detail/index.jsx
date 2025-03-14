'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useGameDetailQuery, useGameRoundResultsQuery, useGameRoundWinnersQuery } from '@/hooks/queries/useGameQueries'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { useDialogState } from '@/hooks/useDialogState'
import { useGameMutations } from '@/hooks/useGameMutations'
import { useGameConditions } from '@/hooks/useGameConditions'
import { GameDetailHeader } from './GameDetailHeader'
import { GameInfoCard } from './GameInfoCard'
import { GameDetailTabs } from './GameDetailTabs'
import { ResultDialog } from './dialogs/ResultDialog'
import { UpdateGameDialog } from './dialogs/UpdateGameDialog'
import { CancelGameDialog } from './dialogs/CancelGameDialog'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function AdminGameDetail({ gameId }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedNumber, setSelectedNumber] = useState(null)

  // Custom hook để quản lý dialog states
  const { dialogs, openDialog, closeDialog } = useDialogState({
    result: false,
    status: false,
    cancel: false
  })

  // Queries cho việc lấy dữ liệu game
  const {
    data: gameData,
    isLoading: isGameLoading,
    error: gameError,
    refetch: refetchGame
  } = useGameDetailQuery(gameId)

  const { data: resultsData, isLoading: isResultsLoading } = useGameRoundResultsQuery(gameId)
  const { data: winnersData, isLoading: isWinnersLoading } = useGameRoundWinnersQuery(gameId)

  // Lấy dữ liệu từ queries với memoization
  const game = useMemo(() => gameData?.gameRound, [gameData])
  const betStats = useMemo(
    () =>
      resultsData?.betStats || {
        total_bets: 0,
        winning_bets: 0,
        total_bet_amount: 0,
        total_win_amount: 0
      },
    [resultsData]
  )
  const winners = useMemo(() => winnersData?.winners || [], [winnersData])

  // Custom hooks cho mutations và game conditions
  const { updateGameMutation, setResultMutation, timeInfo } = useGameMutations(game)
  const { canSetResult, canActivate, canCancel } = useGameConditions(game, timeInfo)

  // Handlers cho các actions
  const handleUpdateStatus = status => {
    updateGameMutation.mutate(
      {
        id: gameId,
        data: status
      },
      {
        onSuccess: () => {
          closeDialog('status')
          refetchGame()
        }
      }
    )
  }

  const handleSubmitResult = formData => {
    setResultMutation.mutate(
      {
        gameId,
        data: formData
      },
      {
        onSuccess: () => {
          closeDialog('result')
          refetchGame()
        }
      }
    )
  }

  const handleCancelGame = () => {
    updateGameMutation.mutate(
      {
        id: gameId,
        data: 'cancelled'
      },
      {
        onSuccess: () => {
          closeDialog('cancel')
          refetchGame()
        }
      }
    )
  }

  // Render loading state
  if (isGameLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-8 w-[300px]' />
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          <Skeleton className='h-[400px]' />
          <Skeleton className='h-[400px] md:col-span-2' />
        </div>
      </div>
    )
  }

  // Render error state
  if (gameError || !game) {
    return (
      <div className='space-y-6'>
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
      {/* Header với các actions */}
      <GameDetailHeader
        game={game}
        gameId={gameId}
        onRefresh={refetchGame}
        canSetResult={canSetResult}
        canActivate={canActivate}
        canCancel={canCancel}
        onOpenResultDialog={() => openDialog('result')}
        onOpenStatusDialog={() => openDialog('status')}
        onOpenCancelDialog={() => openDialog('cancel')}
        onBack={() => router.back()}
      />

      {/* Game info và content */}
      <div className='grid gap-6 md:grid-cols-3'>
        <GameInfoCard
          game={game}
          betStats={betStats}
          timeInfo={timeInfo}
          onStatusChange={() => openDialog('status')}
          onResultChange={() => openDialog('result')}
          canSetResult={canSetResult}
        />

        <ErrorBoundary fallback={<TabErrorState />}>
          <GameDetailTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            game={game}
            betStats={betStats}
            winners={winners}
            timeInfo={timeInfo}
            isResultsLoading={isResultsLoading}
            isWinnersLoading={isWinnersLoading}
            onSetResult={() => openDialog('result')}
            onViewUser={userId => router.push(`/admin/users/${userId}`)}
            onSelectNumber={setSelectedNumber}
            selectedNumber={selectedNumber}
            gameId={gameId}
          />
        </ErrorBoundary>
      </div>

      {/* Dialogs */}
      <ResultDialog
        open={dialogs.result}
        onClose={() => closeDialog('result')}
        onSubmit={handleSubmitResult}
        isLoading={setResultMutation.isLoading}
        game={game}
        betStats={betStats}
      />

      <UpdateGameDialog
        open={dialogs.status}
        onClose={() => closeDialog('status')}
        onSubmit={handleUpdateStatus}
        isLoading={updateGameMutation.isLoading}
        game={game}
      />

      <CancelGameDialog
        open={dialogs.cancel}
        onClose={() => closeDialog('cancel')}
        onConfirm={handleCancelGame}
        isLoading={updateGameMutation.isLoading}
        game={game}
        betStats={betStats}
      />
    </div>
  )
}

function TabErrorState() {
  return (
    <div className='md:col-span-2 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg'>
      <h3 className='text-red-700 dark:text-red-400 font-medium mb-2'>Đã xảy ra lỗi khi tải dữ liệu tab</h3>
      <p className='text-red-600 dark:text-red-300 text-sm'>Vui lòng thử tải lại trang hoặc liên hệ đội kỹ thuật</p>
    </div>
  )
}
