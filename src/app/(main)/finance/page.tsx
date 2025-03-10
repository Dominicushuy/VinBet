// src/app/(main)/finance/page.tsx
import { Metadata } from 'next'
import { getSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Banknote,
  Calculator,
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tài chính - VinBet',
  description: 'Quản lý tài chính trong tài khoản VinBet của bạn',
}

export default async function FinancePage() {
  const supabase = getSupabaseServer()

  // Lấy thông tin profile của người dùng
  const { data: profile } = await supabase.auth.getUser()

  // Lấy thống kê từ bảng profiles
  const { data: userData } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', profile.user?.id)
    .single()

  // Lấy thống kê tổng tiền đã nạp
  const { data: depositData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('profile_id', profile.user?.id)
    .eq('type', 'deposit')
    .eq('status', 'completed')

  // Lấy thống kê tổng tiền đã rút
  const { data: withdrawalData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('profile_id', profile.user?.id)
    .eq('type', 'withdrawal')
    .eq('status', 'completed')

  // Tính toán tổng tiền đã nạp
  const totalDeposit = depositData?.reduce((sum, tx) => sum + tx.amount, 0) || 0

  // Tính toán tổng tiền đã rút
  const totalWithdrawal =
    withdrawalData?.reduce((sum, tx) => sum + tx.amount, 0) || 0

  // Format tiền Việt Nam
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Tài chính</h2>
        <p className='text-muted-foreground'>
          Quản lý tài chính và giao dịch trong tài khoản của bạn
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Số dư hiện tại
            </CardTitle>
            <Calculator className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatMoney(userData?.balance || 0)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Số tiền bạn có thể dùng để đặt cược
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng nạp</CardTitle>
            <ArrowUpRight className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatMoney(totalDeposit)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Tổng số tiền bạn đã nạp vào tài khoản
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng rút</CardTitle>
            <ArrowDownRight className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatMoney(totalWithdrawal)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Tổng số tiền bạn đã rút
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Nạp tiền</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p>
              Nạp tiền vào tài khoản để tham gia các lượt chơi. Chúng tôi hỗ trợ
              nhiều phương thức thanh toán khác nhau.
            </p>
            <Button asChild>
              <Link href='/finance/deposit'>
                <Banknote className='mr-2 h-4 w-4' />
                Nạp tiền ngay
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rút tiền</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p>
              Rút tiền thắng cược về tài khoản ngân hàng của bạn. Thời gian xử
              lý từ 1-3 ngày làm việc.
            </p>
            <Button variant='outline' asChild>
              <Link href='/finance/withdrawal'>
                <ArrowDownRight className='mr-2 h-4 w-4' />
                Rút tiền
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p>
            Xem lịch sử chi tiết tất cả các giao dịch trong tài khoản của bạn,
            bao gồm nạp tiền, rút tiền, đặt cược và trúng thưởng.
          </p>
          <Button variant='outline' asChild>
            <Link href='/finance/transactions'>
              <BarChart2 className='mr-2 h-4 w-4' />
              Xem lịch sử giao dịch
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
