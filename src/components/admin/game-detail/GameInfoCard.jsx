import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Trophy,
  Users,
  DollarSign,
  CircleDollarSign,
  Award,
  Clock,
  Calendar,
  User,
  Info,
  Tag
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function GameInfoCard({ game, betStats, timeInfo, onStatusChange, onResultChange, canSetResult }) {
  // Utility functions
  const formatDate = date => {
    if (!date) return 'N/A'
    return format(new Date(date), 'HH:mm, dd/MM/yyyy')
  }

  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <Badge className='bg-green-500 hover:bg-green-600 text-white px-3 py-1'>Đang diễn ra</Badge>
      case 'scheduled':
        return <Badge className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1'>Sắp diễn ra</Badge>
      case 'completed':
        return <Badge className='bg-slate-500 hover:bg-slate-600 text-white px-3 py-1'>Đã kết thúc</Badge>
      case 'cancelled':
        return <Badge className='bg-red-500 hover:bg-red-600 text-white px-3 py-1'>Đã hủy</Badge>
      default:
        return (
          <Badge variant='outline' className='px-3 py-1'>
            {status}
          </Badge>
        )
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
      case 'completed':
        return 'bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
      case 'cancelled':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
      default:
        return ''
    }
  }

  return (
    <Card
      className={`md:col-span-1 overflow-hidden border-2 shadow-lg transition-all duration-200 ${getStatusColor(
        game.status
      )}`}
    >
      <CardHeader className='pb-2 pt-6 px-6'>
        <div className='flex justify-between items-start mb-2'>
          <CardTitle className='text-xl font-bold'>Thông tin lượt chơi</CardTitle>
          <div className='flex items-center space-x-2'>
            {getStatusBadge(game.status)}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full' onClick={onStatusChange}>
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cập nhật trạng thái</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription className='text-sm'>{timeInfo.text}</CardDescription>
      </CardHeader>

      <CardContent className='px-6'>
        <div className='space-y-6'>
          {/* Game ID Section */}
          <div className='flex items-center py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800'>
            <Tag className='h-5 w-5 mr-2 text-slate-500' />
            <div className='flex-1 min-w-0'>
              <span className='text-xs text-slate-500 block'>ID Lượt chơi</span>
              <span className='text-xs font-mono block truncate hover:text-clip' title={game.id}>
                {game.id}
              </span>
            </div>
          </div>

          {/* Timeline Section */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold flex items-center'>
              <Calendar className='h-4 w-4 mr-2 text-slate-500' />
              Dòng thời gian
            </h3>
            <div className='grid grid-cols-1 gap-3 pl-2'>
              <div className='relative pl-5 pb-2 border-l-2 border-slate-200 dark:border-slate-700'>
                <div className='absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-blue-500'></div>
                <span className='text-xs text-slate-500 block'>Tạo lượt chơi</span>
                <div className='flex items-center'>
                  <span className='text-sm font-medium'>{formatDate(game.created_at)}</span>
                  <User className='h-3 w-3 ml-2 text-slate-400' />
                  <span className='text-xs text-slate-500 ml-1'>
                    {game.creator ? game.creator.display_name || game.creator.username || 'N/A' : 'N/A'}
                  </span>
                </div>
              </div>

              <div className='relative pl-5 pb-2 border-l-2 border-slate-200 dark:border-slate-700'>
                <div className='absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-green-500'></div>
                <span className='text-xs text-slate-500 block'>Bắt đầu</span>
                <span className='text-sm font-medium'>{formatDate(game.start_time)}</span>
              </div>

              <div className='relative pl-5'>
                <div className='absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-red-500'></div>
                <span className='text-xs text-slate-500 block'>Kết thúc</span>
                <span className='text-sm font-medium'>{formatDate(game.end_time)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Game Result */}
          <div className='bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-800'>
            <h3 className='text-sm font-semibold mb-1'>Kết quả</h3>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <Trophy className='h-5 w-5 mr-2 text-amber-500' />
                <span className='text-base font-bold'>{game.result || 'Chưa có kết quả'}</span>
              </div>
              {game.status === 'active' && canSetResult && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onResultChange}
                  className='text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950'
                >
                  Nhập kết quả
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Statistics Section */}
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold flex items-center'>
              <Info className='h-4 w-4 mr-2 text-slate-500' />
              Thống kê
            </h3>

            <div className='grid grid-cols-2 gap-3'>
              {/* Bets count */}
              <div className='bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-100 dark:border-blue-900'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-blue-600 dark:text-blue-400'>Lượt cược</span>
                  <Users className='h-4 w-4 text-blue-500' />
                </div>
                <span className='text-xl font-bold text-blue-700 dark:text-blue-300'>{betStats.total_bets}</span>
              </div>

              {/* Total bet amount */}
              <div className='bg-green-50 dark:bg-green-950 rounded-lg p-3 border border-green-100 dark:border-green-900'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-green-600 dark:text-green-400'>Tổng cược</span>
                  <DollarSign className='h-4 w-4 text-green-500' />
                </div>
                <span className='text-xl font-bold text-green-700 dark:text-green-300'>
                  {formatCurrency(betStats.total_bet_amount)}
                </span>
              </div>

              {/* Win amount */}
              <div className='bg-orange-50 dark:bg-orange-950 rounded-lg p-3 border border-orange-100 dark:border-orange-900'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-orange-600 dark:text-orange-400'>Tổng thắng</span>
                  <Award className='h-4 w-4 text-orange-500' />
                </div>
                <span className='text-xl font-bold text-orange-700 dark:text-orange-300'>
                  {formatCurrency(betStats.total_win_amount)}
                </span>
              </div>

              {/* Profit */}
              <div className='bg-indigo-50 dark:bg-indigo-950 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-indigo-600 dark:text-indigo-400'>Lợi nhuận</span>
                  <CircleDollarSign className='h-4 w-4 text-indigo-500' />
                </div>
                <span className='text-xl font-bold text-indigo-700 dark:text-indigo-300'>
                  {formatCurrency(betStats.total_bet_amount - betStats.total_win_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {(game.status === 'active' || game.status === 'scheduled') && (
        <CardFooter className='pt-0 px-6 pb-6'>
          <Button
            variant='default'
            className='w-full justify-center py-5 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            onClick={onStatusChange}
          >
            <RefreshCw className='mr-2 h-5 w-5' />
            Cập nhật trạng thái
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
