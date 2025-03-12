import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Trophy, Clock, XCircle } from 'lucide-react'

export function GameDetailHeader({
  game,
  gameId,
  onRefresh,
  canSetResult,
  canActivate,
  canCancel,
  onOpenResultDialog,
  onOpenStatusDialog,
  onOpenCancelDialog,
  onBack
}) {
  // Status badge component
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

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0 w-full sm:w-auto'>
        <Button variant='outline' size='sm' onClick={onBack} className='w-full sm:w-auto'>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <h2 className='text-xl sm:text-2xl font-bold'>Chi tiết lượt chơi #{gameId.substring(0, 8)}</h2>
        {getStatusBadge(game.status)}
      </div>

      <div className='flex flex-wrap gap-2 mt-4 sm:mt-0 w-full sm:w-auto'>
        <Button onClick={onRefresh} variant='outline' size='sm' className='w-full sm:w-auto'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Làm mới
        </Button>

        {canSetResult && (
          <Button
            onClick={onOpenResultDialog}
            variant='default'
            className='bg-green-600 hover:bg-green-700 w-full sm:w-auto'
          >
            <Trophy className='mr-2 h-4 w-4' />
            Nhập kết quả
          </Button>
        )}

        {canActivate && (
          <Button onClick={onOpenStatusDialog} variant='default' className='w-full sm:w-auto'>
            <Clock className='mr-2 h-4 w-4' />
            Kích hoạt
          </Button>
        )}

        {canCancel && (
          <Button
            onClick={onOpenCancelDialog}
            variant='outline'
            className='text-red-500 border-red-300 hover:bg-red-50 w-full sm:w-auto'
          >
            <XCircle className='mr-2 h-4 w-4' />
            Hủy lượt chơi
          </Button>
        )}
      </div>
    </div>
  )
}
