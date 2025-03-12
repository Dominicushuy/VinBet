// src/components/admin/user-detail/UserBetsTab.jsx
import React from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { ExternalLink, Activity, Award, PieChart } from 'lucide-react'

const UserBetsTab = React.memo(function UserBetsTab({ user, stats, recentBets, router }) {
  return (
    <div className='p-6 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-muted-foreground'>Tổng số cược</h3>
                <Activity className='h-5 w-5 text-blue-500' />
              </div>
              <p className='text-2xl font-bold'>{stats.total_bets || 0}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Giá trị: {formatCurrency(stats.total_bet_amount || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-muted-foreground'>Thắng cược</h3>
                <Award className='h-5 w-5 text-green-500' />
              </div>
              <p className='text-2xl font-bold'>{stats.won_bets || 0}</p>
              <p className='text-xs text-muted-foreground mt-1'>Giá trị: {formatCurrency(stats.total_winnings || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-muted-foreground'>Tỷ lệ thắng</h3>
                <PieChart className='h-5 w-5 text-orange-500' />
              </div>
              <p className='text-2xl font-bold'>{stats.win_rate ? stats.win_rate.toFixed(1) : '0'}%</p>
              <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                <span>Thắng: {stats.won_bets || 0}</span>
                <span>Thua: {(stats.total_bets || 0) - (stats.won_bets || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>Lịch sử đặt cược gần đây</CardTitle>
          <CardDescription>5 lượt cược gần nhất của người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBets.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-4'>Người dùng chưa đặt cược lần nào</p>
          ) : (
            <div className='rounded-md border overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Lượt chơi</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Số đã chọn</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Số tiền</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Kết quả</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBets.map(bet => (
                    <tr key={bet.id} className='border-b'>
                      <td className='py-2 px-3 text-sm'>
                        <div className='flex items-center'>
                          <span>#{bet.game_round_id.substring(0, 8)}</span>
                          <Button
                            variant='link'
                            size='sm'
                            className='h-4 p-0 ml-1'
                            onClick={() => router.push(`/admin/games/${bet.game_round_id}`)}
                          >
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        </div>
                      </td>
                      <td className='py-2 px-3 text-sm font-medium'>{bet.chosen_number}</td>
                      <td className='py-2 px-3 text-sm'>{formatCurrency(bet.amount)}</td>
                      <td className='py-2 px-3 text-sm'>
                        {bet.status === 'won' ? (
                          <span className='text-green-600 font-medium'>Thắng {formatCurrency(bet.potential_win)}</span>
                        ) : bet.status === 'lost' ? (
                          <span className='text-red-600'>Thua</span>
                        ) : (
                          <Badge variant='outline'>{bet.status === 'pending' ? 'Đang chờ' : bet.status}</Badge>
                        )}
                      </td>
                      <td className='py-2 px-3 text-sm'>{format(new Date(bet.created_at), 'dd/MM/yyyy HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant='outline' className='w-full' onClick={() => router.push(`/admin/users/${user.id}/bets`)}>
            Xem tất cả lượt cược
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
})

export { UserBetsTab }
