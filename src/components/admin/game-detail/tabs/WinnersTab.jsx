'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, UserCheck, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'

export function WinnersTab({ game, winners, isLoading, onViewUser }) {
  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-12 w-full' />
        ))}
      </div>
    )
  }

  if (game.status !== 'completed') {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <Trophy className='h-12 w-12 text-gray-300 mb-2' />
        <p className='text-lg font-medium'>Chưa có kết quả</p>
        <p className='text-sm text-muted-foreground'>Danh sách người thắng sẽ hiển thị sau khi lượt chơi kết thúc</p>
      </div>
    )
  }

  if (winners.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12'>
        <UserCheck className='h-12 w-12 text-gray-300 mb-2' />
        <p className='text-lg font-medium'>Không có người thắng</p>
        <p className='text-sm text-muted-foreground'>Không có người chơi nào đoán đúng kết quả {game.result}</p>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người chơi</TableHead>
            <TableHead>Số đã chọn</TableHead>
            <TableHead>Số tiền đặt</TableHead>
            <TableHead>Tiền thắng</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className='text-right'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {winners.map(winner => (
            <TableRow key={winner.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={winner.profiles?.avatar_url} />
                    <AvatarFallback>
                      {(winner.profiles?.display_name || winner.profiles?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium'>{winner.profiles?.display_name || winner.profiles?.username}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className='font-medium'>{winner.chosen_number}</TableCell>
              <TableCell>{formatCurrency(winner.amount)}</TableCell>
              <TableCell className='font-medium text-green-600'>{formatCurrency(winner.potential_win)}</TableCell>
              <TableCell className='text-sm'>{format(new Date(winner.created_at), 'HH:mm, dd/MM/yyyy')}</TableCell>
              <TableCell className='text-right'>
                <Button variant='ghost' size='sm' onClick={() => onViewUser(winner.profiles?.id)}>
                  <Eye className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
