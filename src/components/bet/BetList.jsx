'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { Loader2, RefreshCw } from 'lucide-react'
import { useUserBetsQuery } from '@/hooks/queries/useBetQueries'

export function BetList({ gameRoundId, initialBets, showAllTabs = false }) {
  const [selectedStatus, setSelectedStatus] = useState(undefined)

  const { data, isLoading, refetch } = useUserBetsQuery({
    gameRoundId,
    status: selectedStatus
  })

  const bets = (data && data.bets) || initialBets || []

  // Format tiền Việt Nam
  const formatMoney = value => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const getBetStatusBadge = status => {
    switch (status) {
      case 'pending':
        return <Badge variant='outline'>Đang chờ</Badge>
      case 'won':
        return (
          <Badge variant='default' className='bg-green-500'>
            Thắng
          </Badge>
        )
      case 'lost':
        return <Badge variant='secondary'>Thua</Badge>
      case 'cancelled':
        return <Badge variant='destructive'>Đã hủy</Badge>
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  if (bets.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cược của bạn</CardTitle>
          <CardDescription>Bạn chưa đặt cược nào {gameRoundId ? 'trong lượt này' : ''}</CardDescription>
        </CardHeader>
        <CardContent className='text-center py-6'>
          <p className='text-muted-foreground'>Không có cược nào để hiển thị.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>Cược của bạn</CardTitle>
          <CardDescription>Danh sách các cược bạn đã đặt</CardDescription>
        </div>
        <Button
          variant='outline'
          size='sm'
          className='ml-auto h-8 gap-1'
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Làm mới</span>
        </Button>
      </CardHeader>
      <CardContent>
        {showAllTabs ? (
          <Tabs
            defaultValue='all'
            className='w-full'
            onValueChange={value => setSelectedStatus(value === 'all' ? undefined : value)}
          >
            <TabsList className='mb-4 grid w-full grid-cols-4'>
              <TabsTrigger value='all'>Tất cả</TabsTrigger>
              <TabsTrigger value='pending'>Đang chờ</TabsTrigger>
              <TabsTrigger value='won'>Thắng</TabsTrigger>
              <TabsTrigger value='lost'>Thua</TabsTrigger>
            </TabsList>

            <BetTable
              bets={bets}
              isLoading={isLoading}
              formatMoney={formatMoney}
              getBetStatusBadge={getBetStatusBadge}
            />
          </Tabs>
        ) : (
          <BetTable bets={bets} isLoading={isLoading} formatMoney={formatMoney} getBetStatusBadge={getBetStatusBadge} />
        )}
      </CardContent>
    </Card>
  )
}

function BetTable({ bets, isLoading, formatMoney, getBetStatusBadge }) {
  if (isLoading) {
    return (
      <div className='flex justify-center py-6'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Số đã chọn</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Tiềm năng</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.map(bet => (
            <TableRow key={bet.id}>
              <TableCell className='font-medium'>
                {bet.created_at ? format(new Date(bet.created_at), 'HH:mm, dd/MM') : 'N/A'}
              </TableCell>
              <TableCell className='font-bold'>{bet.chosen_number}</TableCell>
              <TableCell>{formatMoney(bet.amount)}</TableCell>
              <TableCell>{formatMoney(bet.potential_win)}</TableCell>
              <TableCell>{getBetStatusBadge(bet.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
