import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Trophy, Users, DollarSign, CircleDollarSign, Award } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export function GameInfoCard({ game, betStats, timeInfo, onStatusChange, onResultChange, canSetResult }) {
  // Utility functions
  const formatDate = date => {
    if (!date) return 'N/A'
    return format(new Date(date), 'HH:mm, dd/MM/yyyy')
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

  return (
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
              <Button variant='ghost' size='sm' onClick={onStatusChange}>
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
                {game.creator ? game.creator.display_name || game.creator.username || 'N/A' : 'N/A'}
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
            <Button variant='outline' className='w-full justify-start' onClick={onStatusChange}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Cập nhật trạng thái
            </Button>
          )}

          {game.status === 'active' && (
            <Button
              variant='outline'
              className='w-full justify-start'
              onClick={onResultChange}
              disabled={!canSetResult}
            >
              <Trophy className='mr-2 h-4 w-4' />
              Nhập kết quả
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
