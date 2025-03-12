'use client'

import { useAdminTransactionsQuery } from '@/hooks/queries/useAdminQueries'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowUpRight, ArrowDownRight, ExternalLink, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/utils/formatUtils'
import { cn } from '@/lib/utils'

export function RecentTransactions() {
  const router = useRouter()

  // Sử dụng trực tiếp react-query thay vì state để theo dõi mounted
  const { data, isLoading, error } = useAdminTransactionsQuery({
    pageSize: 10,
    page: 1,
    sortBy: 'created_at',
    sortOrder: 'desc',
    onError: err => {
      console.error('Failed to fetch transactions:', err)
    }
  })

  const transactions = data?.transactions || []

  // Xử lý lỗi nếu có
  if (error) {
    return (
      <div className='rounded-md bg-destructive/10 p-4 border border-destructive/20'>
        <div className='flex items-center'>
          <AlertCircle className='h-4 w-4 mr-2 text-destructive' />
          <div className='text-sm text-destructive'>Không thể tải dữ liệu giao dịch. Vui lòng thử lại sau.</div>
        </div>
      </div>
    )
  }

  const getTransactionIcon = type => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className='h-4 w-4 text-success' />
      case 'withdrawal':
        return <ArrowDownRight className='h-4 w-4 text-destructive' />
      default:
        return null
    }
  }

  const getTransactionStatusBadge = status => {
    switch (status) {
      case 'completed':
        return <Badge variant='success'>Hoàn thành</Badge>
      case 'pending':
        return (
          <Badge variant='outline' className='bg-warning/20 text-warning'>
            Đang xử lý
          </Badge>
        )
      case 'failed':
        return <Badge variant='destructive'>Thất bại</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  const getTransactionType = type => {
    switch (type) {
      case 'deposit':
        return 'Nạp tiền'
      case 'withdrawal':
        return 'Rút tiền'
      case 'bet':
        return 'Đặt cược'
      case 'win':
        return 'Thắng cược'
      case 'referral_reward':
        return 'Thưởng giới thiệu'
      default:
        return type || 'Không xác định'
    }
  }

  // Hàm format an toàn cho ngày tháng
  const safeFormat = (dateString, formatString = 'HH:mm, dd/MM/yyyy') => {
    try {
      return format(new Date(dateString), formatString)
    } catch (err) {
      console.error('Date formatting error:', err, dateString)
      return 'N/A'
    }
  }

  // Hàm format an toàn cho tiền tệ
  const safeFormatCurrency = amount => {
    try {
      const numAmount = Number(amount)
      if (isNaN(numAmount)) return '0 ₫'
      return formatCurrency(Math.abs(numAmount))
    } catch (err) {
      console.error('Currency formatting error:', err)
      return '0 ₫'
    }
  }

  // Hàm an toàn lấy ID profile
  const getProfileIdDisplay = profileId => {
    if (!profileId) return 'N/A'
    try {
      return `ID: ${profileId.substring(0, 8)}...`
    } catch (err) {
      return 'ID: N/A'
    }
  }

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

  if (!transactions || transactions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[200px] bg-muted/20 rounded-md'>
        <p className='text-muted-foreground text-center'>Không có giao dịch nào gần đây</p>
      </div>
    )
  }

  return (
    <div>
      <div className='rounded-md border overflow-x-auto'>
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
                        {getProfileIdDisplay(transaction.profile_id)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1.5'>
                    {getTransactionIcon(transaction.type)}
                    <span>{getTransactionType(transaction.type)}</span>
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'font-medium',
                    transaction.type === 'deposit' ||
                      transaction.type === 'win' ||
                      transaction.type === 'referral_reward'
                      ? 'text-success'
                      : 'text-destructive'
                  )}
                >
                  {transaction.type === 'deposit' ||
                  transaction.type === 'win' ||
                  transaction.type === 'referral_reward'
                    ? '+'
                    : '-'}
                  {safeFormatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                <TableCell>{safeFormat(transaction.created_at)}</TableCell>
                <TableCell className='text-right'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`/admin/transactions/${transaction.id}`)
                    }}
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
