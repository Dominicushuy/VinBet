// src/components/admin/game-detail/tabs/OverviewTab.jsx
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Trophy, Timer, Clock, CheckCircle, XCircle, AlertCircle, BarChart2, Users } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'

export function OverviewTab({ game, betStats, timeInfo, onSetResult }) {
  const formatDate = date => format(new Date(date), 'dd/MM/yyyy HH:mm')

  // Calculate stats based on betStats
  const stats = useMemo(() => {
    return {
      winRate: betStats.total_bets > 0 ? ((betStats.winning_bets / betStats.total_bets) * 100).toFixed(1) : 0,
      averageBet: betStats.total_bets > 0 ? betStats.total_bet_amount / betStats.total_bets : 0,
      profit: betStats.total_bet_amount - betStats.total_win_amount
    }
  }, [betStats])

  return (
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
                  <span className={`text-sm ${timeInfo.isExpired ? 'text-red-500 font-medium' : 'text-green-500'}`}>
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
                <p className='text-lg font-medium'>{stats.winRate}%</p>
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
                <p className={`text-lg font-medium ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.profit)}
                </p>
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Đặt cược TB</p>
                <p className='text-lg font-medium'>{formatCurrency(stats.averageBet)}</p>
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
            {game.status === 'completed' ? 'Lượt chơi đã kết thúc với kết quả bên dưới' : 'Lượt chơi chưa có kết quả'}
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
                <Trophy className='h-4 w-4 mr-1 text-green-500' />
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
                  <Button onClick={onSetResult} variant='default' className='bg-green-600 hover:bg-green-700'>
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
  )
}
