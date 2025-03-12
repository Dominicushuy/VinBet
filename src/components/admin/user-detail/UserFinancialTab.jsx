// src/components/admin/user-detail/UserFinancialTab.jsx
import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { formatCurrency } from '@/utils/formatUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Landmark, Activity, CreditCard } from 'lucide-react'

const UserFinancialTab = React.memo(function UserFinancialTab({ user, stats, recentTransactions, router }) {
  const [balanceForm, setBalanceForm] = useState({
    amount: '',
    action: 'add',
    adminNote: '',
    userNote: ''
  })

  const handleBalanceChange = e => {
    const { name, value } = e.target
    setBalanceForm(prev => ({ ...prev, [name]: value }))
  }

  const handleBalanceActionChange = value => {
    setBalanceForm(prev => ({ ...prev, action: value }))
  }

  const handleBalanceSubmit = async e => {
    e.preventDefault()

    if (!balanceForm.amount || isNaN(balanceForm.amount) || Number(balanceForm.amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ')
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/adjust-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...balanceForm,
          amount: Number(balanceForm.amount)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể điều chỉnh số dư')
      }

      const result = await response.json()
      toast.success(result.message || 'Số dư đã được cập nhật')

      // Reset form
      setBalanceForm({
        amount: '',
        action: 'add',
        adminNote: '',
        userNote: ''
      })

      // Refresh data
      window.location.reload()
    } catch (error) {
      toast.error(error.message || 'Không thể điều chỉnh số dư')
    }
  }

  return (
    <div className='p-6 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='bg-gradient-to-br from-blue-50 to-blue-100'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium text-blue-800'>Số dư hiện tại</h3>
                <p className='text-2xl font-bold text-blue-900'>{formatCurrency(user.balance || 0)}</p>
              </div>
              <Landmark className='h-10 w-10 text-blue-500 opacity-80' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-muted-foreground'>Lợi nhuận từ cược</h3>
                <Activity className='h-5 w-5 text-green-500' />
              </div>
              <p className={`text-xl font-bold ${stats.net_gambling > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.net_gambling > 0 ? '+' : ''}
                {formatCurrency(stats.net_gambling || 0)}
              </p>
              <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                <span>Tổng cược: {formatCurrency(stats.total_bet_amount || 0)}</span>
                <span>Tổng thắng: {formatCurrency(stats.total_winnings || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-muted-foreground'>Nạp/Rút</h3>
                <CreditCard className='h-5 w-5 text-indigo-500' />
              </div>
              <p className='text-xl font-bold'>
                {formatCurrency((stats.total_deposits || 0) - (stats.total_withdrawals || 0))}
              </p>
              <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                <span>Nạp: {formatCurrency(stats.total_deposits || 0)}</span>
                <span>Rút: {formatCurrency(stats.total_withdrawals || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base flex items-center'>Lịch sử giao dịch gần đây</CardTitle>
          <CardDescription>5 giao dịch gần nhất của người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-4'>Người dùng chưa có giao dịch nào</p>
          ) : (
            <div className='rounded-md border overflow-hidden'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Loại</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Số tiền</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Trạng thái</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Thời gian</th>
                    <th className='py-2 px-3 text-left text-sm font-medium'>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className='border-b'>
                      <td className='py-2 px-3 text-sm'>
                        {tx.type === 'deposit'
                          ? 'Nạp tiền'
                          : tx.type === 'withdrawal'
                          ? 'Rút tiền'
                          : tx.type === 'bet'
                          ? 'Đặt cược'
                          : tx.type === 'win'
                          ? 'Thắng cược'
                          : tx.type === 'referral_reward'
                          ? 'Thưởng giới thiệu'
                          : tx.type}
                      </td>
                      <td
                        className={`py-2 px-3 text-sm font-medium ${
                          tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_reward'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_reward' ? '+' : '-'}
                        {formatCurrency(Math.abs(tx.amount))}
                      </td>
                      <td className='py-2 px-3 text-sm'>
                        <Badge
                          variant={
                            tx.status === 'completed' ? 'outline' : tx.status === 'failed' ? 'destructive' : 'secondary'
                          }
                          className={
                            tx.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : undefined
                          }
                        >
                          {tx.status === 'completed'
                            ? 'Hoàn thành'
                            : tx.status === 'pending'
                            ? 'Đang xử lý'
                            : tx.status === 'failed'
                            ? 'Thất bại'
                            : tx.status}
                        </Badge>
                      </td>
                      <td className='py-2 px-3 text-sm'>{format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm')}</td>
                      <td className='py-2 px-3 text-sm max-w-[200px] truncate'>{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => router.push(`/admin/users/${user.id}/transactions`)}
          >
            Xem tất cả giao dịch
          </Button>
        </CardFooter>
      </Card>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Điều chỉnh số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBalanceSubmit} className='space-y-3'>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  placeholder='Nhập số tiền'
                  min='0'
                  step='10000'
                  name='amount'
                  value={balanceForm.amount}
                  onChange={handleBalanceChange}
                  required
                />
                <Select defaultValue='add' value={balanceForm.action} onValueChange={handleBalanceActionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Hành động' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='add'>Cộng tiền</SelectItem>
                    <SelectItem value='subtract'>Trừ tiền</SelectItem>
                    <SelectItem value='set'>Đặt số dư</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder='Lý do (hiển thị cho admin)'
                name='adminNote'
                value={balanceForm.adminNote}
                onChange={handleBalanceChange}
              />
              <Input
                placeholder='Ghi chú (hiển thị cho người dùng)'
                name='userNote'
                value={balanceForm.userNote}
                onChange={handleBalanceChange}
              />
              <Button type='submit' className='w-full'>
                Xác nhận
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Tặng thưởng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-2'>
                <Input type='number' placeholder='Số tiền' min='0' step='10000' />
                <Select defaultValue='bonus'>
                  <SelectTrigger>
                    <SelectValue placeholder='Loại' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='bonus'>Thưởng</SelectItem>
                    <SelectItem value='jackpot'>Jackpot</SelectItem>
                    <SelectItem value='event'>Sự kiện</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder='Lý do tặng thưởng' />
              <Button className='w-full'>Tặng thưởng</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export { UserFinancialTab }
