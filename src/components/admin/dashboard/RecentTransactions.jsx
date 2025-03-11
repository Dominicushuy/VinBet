'use client'

import { useState, useEffect } from 'react'
import { useAdminTransactionsQuery } from '@/hooks/queries/useAdminQueries'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export function RecentTransactions() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useAdminTransactionsQuery({
    pageSize: 10,
    page: 1,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const transactions = data?.transactions || []

  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getTransactionIcon = type => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className='h-4 w-4 text-green-500' />
      case 'withdrawal':
        return <ArrowDownRight className='h-4 w-4 text-red-500' />
      default:
        return null
    }
  }

  const getTransactionStatusBadge = status => {
    switch (status) {
      case 'completed':
        return <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>Hoàn thành</Badge>
      case 'pending':
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'>
            Đang xử lý
          </Badge>
        )
      case 'failed':
        return <Badge variant='destructive'>Thất bại</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-8 w-full' />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-2'>
            {[...Array(4)].map((_, j) => (
              <Skeleton key={j} className='h-10 w-full' />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[200px] bg-muted/20 rounded-md'>
        <p className='text-muted-foreground text-center'>Không có giao dịch nào gần đây</p>
      </div>
    )
  }

  return (
    <div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className='text-right'>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={transaction.display_name?.avatar_url} />
                      <AvatarFallback>{transaction.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium leading-none'>
                        {transaction.display_name || transaction.username || 'Người dùng'}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        ID: {transaction.profile_id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1.5'>
                    {getTransactionIcon(transaction.type)}
                    <span>
                      {transaction.type === 'deposit'
                        ? 'Nạp tiền'
                        : transaction.type === 'withdrawal'
                        ? 'Rút tiền'
                        : transaction.type === 'bet'
                        ? 'Đặt cược'
                        : transaction.type === 'win'
                        ? 'Thắng cược'
                        : transaction.type === 'referral_reward'
                        ? 'Thưởng giới thiệu'
                        : transaction.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className={
                    transaction.type === 'deposit' ||
                    transaction.type === 'win' ||
                    transaction.type === 'referral_reward'
                      ? 'text-green-600 font-medium'
                      : 'text-red-600 font-medium'
                  }
                >
                  {transaction.type === 'deposit' ||
                  transaction.type === 'win' ||
                  transaction.type === 'referral_reward'
                    ? '+'
                    : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </TableCell>
                <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                <TableCell>{format(new Date(transaction.created_at), 'HH:mm, dd/MM/yyyy')}</TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => router.push(`/admin/transactions/${transaction.id}`)}
                  >
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button
        variant='ghost'
        className='w-full text-center text-sm text-muted-foreground mt-4'
        onClick={() => router.push('/admin/transactions')}
      >
        Xem tất cả
      </Button>
    </div>
  )
}
