'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'

export function BetsTab({ game, betStats, isLoading }) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (betStats.total_bets === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <Users className='h-12 w-12 text-gray-300 mb-2' />
        <p className='text-lg font-medium'>Chưa có lượt cược nào</p>
        <p className='text-sm text-muted-foreground'>Người dùng chưa đặt cược cho lượt chơi này</p>
      </div>
    )
  }

  // Ví dụ dữ liệu cược (placeholder). Trong thực tế, dữ liệu cược nên được truyền từ API.
  const placeholderBets = [...Array(5)].map((_, i) => ({
    id: i,
    username: `Người dùng ${i + 1}`,
    email: `user${i + 1}@example.com`,
    chosenNumber: Math.floor(Math.random() * 100),
    amount: 100000 * (i + 1),
    winAmount: game.status === 'completed' ? (i % 2 === 0 ? 900000 * (i + 1) : null) : null,
    status: game.status === 'completed' ? (i % 2 === 0 ? 'Thắng' : 'Thua') : 'Đang chờ',
    time: new Date(new Date().getTime() - i * 3600000)
  }))

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người chơi</TableHead>
            <TableHead>Số đã chọn</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Tiền thắng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placeholderBets.map(bet => (
            <TableRow key={bet.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback>{bet.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium'>{bet.username}</p>
                    <p className='text-xs text-muted-foreground'>{bet.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className='font-medium'>{bet.chosenNumber}</TableCell>
              <TableCell>{formatCurrency(bet.amount)}</TableCell>
              <TableCell>{bet.winAmount ? formatCurrency(bet.winAmount) : '-'}</TableCell>
              <TableCell>
                <Badge variant={bet.status === 'Thắng' ? 'default' : bet.status === 'Thua' ? 'outline' : 'secondary'}>
                  {bet.status}
                </Badge>
              </TableCell>
              <TableCell className='text-sm'>{format(bet.time, 'HH:mm, dd/MM/yyyy')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
