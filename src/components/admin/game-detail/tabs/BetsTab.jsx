// src/components/admin/game-detail/tabs/BetsTab.jsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Search, Eye, BarChart2, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BetsTab({ game, betStats, isLoading, onViewUser, onSelectNumber, selectedNumber }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [bets, setBets] = useState([])

  // Giả lập việc lấy dữ liệu cược từ API
  useEffect(() => {
    // Trong thực tế, dữ liệu cược nên được truyền từ API hoặc parent component
    const placeholderBets = [...Array(10)].map((_, i) => ({
      id: `bet-${i}`,
      profile_id: `user-${i}`,
      username: `Người dùng ${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatar_url: null,
      chosen_number: `${Math.floor(Math.random() * 100)}`,
      amount: 100000 * (i + 1),
      potential_win: 900000 * (i + 1),
      status: game.status === 'completed' ? (i % 3 === 0 ? 'won' : 'lost') : 'pending',
      created_at: new Date(new Date().getTime() - i * 3600000).toISOString()
    }))

    setBets(placeholderBets)
  }, [game.status])

  // Lọc danh sách cược dựa trên tìm kiếm và filter
  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      // Lọc theo số được chọn
      if (selectedNumber && bet.chosen_number !== selectedNumber) {
        return false
      }

      // Lọc theo trạng thái
      if (statusFilter !== 'all' && bet.status !== statusFilter) {
        return false
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        return (
          bet.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bet.chosen_number.includes(searchTerm)
        )
      }

      return true
    })
  }, [bets, selectedNumber, statusFilter, searchTerm])

  // Hiển thị trạng thái cược
  const getStatusBadge = status => {
    switch (status) {
      case 'won':
        return (
          <Badge variant='default' className='bg-green-600'>
            Thắng
          </Badge>
        )
      case 'lost':
        return <Badge variant='outline'>Thua</Badge>
      case 'pending':
        return <Badge variant='secondary'>Đang chờ</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

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

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0'>
        <div className='flex items-center space-x-1 bg-muted rounded-md px-2 sm:w-auto w-full'>
          <Search className='h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm người chơi, số...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-9'
          />
        </div>

        <div className='flex items-center space-x-2 w-full sm:w-auto'>
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className='w-full sm:w-auto'>
            <TabsList className='grid grid-cols-3 h-9'>
              <TabsTrigger value='all' className='text-xs'>
                Tất cả
              </TabsTrigger>
              <TabsTrigger value='won' className='text-xs'>
                Thắng
              </TabsTrigger>
              <TabsTrigger value='lost' className='text-xs'>
                Thua
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedNumber && (
            <Button variant='outline' size='sm' onClick={() => onSelectNumber(null)} className='flex items-center h-9'>
              <Filter className='h-4 w-4 mr-1' />
              {selectedNumber}
              <span className='ml-1 text-xs'>×</span>
            </Button>
          )}
        </div>
      </div>

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
              <TableHead className='text-right'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center'>
                  Không có dữ liệu phù hợp
                </TableCell>
              </TableRow>
            ) : (
              filteredBets.map(bet => (
                <TableRow key={bet.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={bet.avatar_url} alt={bet.username} />
                        <AvatarFallback>{bet.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-sm font-medium'>{bet.username}</p>
                        <p className='text-xs text-muted-foreground'>{bet.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='font-medium px-2 py-0 h-6'
                      onClick={() => onSelectNumber(bet.chosen_number === selectedNumber ? null : bet.chosen_number)}
                    >
                      {bet.chosen_number}
                    </Button>
                  </TableCell>
                  <TableCell>{formatCurrency(bet.amount)}</TableCell>
                  <TableCell>{bet.status === 'won' ? formatCurrency(bet.potential_win) : '-'}</TableCell>
                  <TableCell>{getStatusBadge(bet.status)}</TableCell>
                  <TableCell className='text-sm'>{format(new Date(bet.created_at), 'HH:mm, dd/MM/yyyy')}</TableCell>
                  <TableCell className='text-right'>
                    <Button variant='ghost' size='sm' onClick={() => onViewUser(bet.profile_id)}>
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center text-sm text-muted-foreground'>
          <BarChart2 className='h-4 w-4 mr-2' />
          <span>
            Đang hiển thị {filteredBets.length} trên tổng số {betStats.total_bets} lượt cược
          </span>
        </div>
      </div>
    </div>
  )
}
