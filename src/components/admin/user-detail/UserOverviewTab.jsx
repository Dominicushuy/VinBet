// src/components/admin/user-detail/UserOverviewTab.jsx
import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { ExternalLink, Clock, BadgeDollarSign, Activity } from 'lucide-react'

const UserOverviewTab = React.memo(function UserOverviewTab({ user, stats, recentBets, recentTransactions, router }) {
  return (
    <div className='p-6 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center'>
              <BadgeDollarSign className='h-4 w-4 mr-2 text-blue-500' />
              Tài chính
            </CardTitle>
          </CardHeader>
          <CardContent className='pb-4'>
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-1'>
                <div className='text-sm text-muted-foreground'>Tổng nạp</div>
                <div className='text-sm font-medium text-right'>{formatCurrency(stats.total_deposits || 0)}</div>
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <div className='text-sm text-muted-foreground'>Tổng rút</div>
                <div className='text-sm font-medium text-right'>{formatCurrency(stats.total_withdrawals || 0)}</div>
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <div className='text-sm text-muted-foreground'>Chênh lệch</div>
                <div className='text-sm font-medium text-right'>
                  {formatCurrency((stats.total_deposits || 0) - (stats.total_withdrawals || 0))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center'>
              <Activity className='h-4 w-4 mr-2 text-green-500' />
              Thống kê cược
            </CardTitle>
          </CardHeader>
          <CardContent className='pb-4'>
            <div className='grid grid-cols-3 gap-2'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>{stats.total_bets || 0}</div>
                <div className='text-xs text-muted-foreground'>Tổng cược</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>{stats.won_bets || 0}</div>
                <div className='text-xs text-muted-foreground'>Thắng</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>{stats.win_rate ? stats.win_rate.toFixed(1) : '0'}%</div>
                <div className='text-xs text-muted-foreground'>Tỷ lệ thắng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm font-medium flex items-center'>
            <Clock className='h-4 w-4 mr-2 text-orange-500' />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className='pb-4'>
          <div className='space-y-4'>
            {recentTransactions.length === 0 && recentBets.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>Người dùng này chưa có hoạt động nào</p>
            ) : (
              <>
                {recentTransactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium'>
                        {tx.type === 'deposit'
                          ? 'Nạp tiền'
                          : tx.type === 'withdrawal'
                          ? 'Rút tiền'
                          : tx.type === 'bet'
                          ? 'Đặt cược'
                          : tx.type === 'win'
                          ? 'Thắng cược'
                          : tx.type}
                      </p>
                      <div className='flex items-center'>
                        <p className='text-xs text-muted-foreground'>
                          {format(new Date(tx.created_at), 'HH:mm - dd/MM/yyyy')}
                        </p>
                        {tx.payment_request_id && (
                          <Button
                            variant='link'
                            size='sm'
                            className='h-4 p-0 ml-1'
                            onClick={() => router.push(`/admin/payments/${tx.payment_request_id}`)}
                          >
                            <ExternalLink className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}

                {recentBets.slice(0, 3).map(bet => (
                  <div key={bet.id} className='flex items-center justify-between'>
                    <div>
                      <div className='flex items-center'>
                        <p className='text-sm font-medium'>Đặt cược #{bet.game_round_id.substring(0, 8)}</p>
                        <Button
                          variant='link'
                          size='sm'
                          className='h-4 p-0 ml-1'
                          onClick={() => router.push(`/admin/games/${bet.game_round_id}`)}
                        >
                          <ExternalLink className='h-3 w-3' />
                        </Button>
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        {format(new Date(bet.created_at), 'HH:mm - dd/MM/yyyy')}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        bet.status === 'won'
                          ? 'text-green-600'
                          : bet.status === 'lost'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {bet.status === 'won'
                        ? `+${formatCurrency(bet.potential_win)}`
                        : `${formatCurrency(-bet.amount)}`}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className='pt-0 flex justify-between'>
          <Button variant='link' size='sm' onClick={() => router.push(`/admin/users/${user.id}/transactions`)}>
            Xem tất cả giao dịch
          </Button>
          <Button variant='link' size='sm' onClick={() => router.push(`/admin/users/${user.id}/bets`)}>
            Xem tất cả cược
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
})

export { UserOverviewTab }
