// src/components/admin/game-detail/tabs/WinnersTab.jsx
'use client'

import { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Trophy, UserCheck, Eye, Search, Download, BarChart2 } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'

export function WinnersTab({ game, winners, isLoading, onViewUser }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Lọc danh sách người thắng theo từ khóa tìm kiếm
  const filteredWinners = useMemo(() => {
    if (!searchTerm.trim()) return winners

    return winners.filter(winner => {
      const displayName = winner.profiles?.display_name || ''
      const username = winner.profiles?.username || ''
      return (
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        winner.chosen_number.includes(searchTerm)
      )
    })
  }, [winners, searchTerm])

  // Tính tổng số tiền thắng
  const totalWinAmount = useMemo(() => {
    return winners.reduce((sum, winner) => sum + (winner.potential_win || 0), 0)
  }, [winners])

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
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0'>
        <div className='flex items-center space-x-1 bg-muted rounded-md px-2 sm:w-auto w-full'>
          <Search className='h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm người thắng...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9'
          />
        </div>

        <Button variant='outline' size='sm' className='w-full sm:w-auto'>
          <Download className='h-4 w-4 mr-2' />
          Xuất danh sách
        </Button>
      </div>

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
            {filteredWinners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  Không tìm thấy người thắng phù hợp
                </TableCell>
              </TableRow>
            ) : (
              filteredWinners.map(winner => (
                <TableRow key={winner.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={winner.profiles?.avatar_url} alt={winner.profiles?.display_name} />
                        <AvatarFallback>
                          {(winner.profiles?.display_name || winner.profiles?.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-sm font-medium'>
                          {winner.profiles?.display_name || winner.profiles?.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>
                    <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
                      {winner.chosen_number}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(winner.amount)}</TableCell>
                  <TableCell className='font-medium text-green-600'>{formatCurrency(winner.potential_win)}</TableCell>
                  <TableCell className='text-sm'>{format(new Date(winner.created_at), 'HH:mm, dd/MM/yyyy')}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='ghost' size='sm' onClick={() => onViewUser(winner.profiles?.id)}>
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0'>
        <div className='flex items-center text-sm text-muted-foreground'>
          <BarChart2 className='h-4 w-4 mr-2' />
          <span>
            Đang hiển thị {filteredWinners.length} trên tổng số {winners.length} người thắng
          </span>
        </div>

        <div className='flex items-center'>
          <Trophy className='h-5 w-5 text-yellow-500 mr-2' />
          <div className='text-sm'>
            <span className='font-medium'>Tổng tiền thưởng:</span>
            <span className='ml-2 text-green-600 font-bold'>{formatCurrency(totalWinAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
