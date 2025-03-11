// src/components/game/WinnerList.jsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { RefreshCw, Trophy, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGameRoundWinners } from '@/hooks/queries/useGameQueries'

export function WinnerList({ gameRound }) {
  const [showAll, setShowAll] = useState(false)
  const { data, isLoading, error, refetch } = useGameRoundWinners(gameRound.id)

  // Nếu game round chưa kết thúc, không hiển thị danh sách người thắng
  if (gameRound.status !== 'completed') {
    return null
  }

  // Format tiền Việt Nam
  const formatMoney = value => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  if (isLoading) {
    return <WinnerListSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Người thắng cuộc</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center gap-4 py-6'>
          <p className='text-center text-muted-foreground'>
            Không thể tải danh sách người thắng. Vui lòng thử lại sau.
          </p>
          <Button variant='outline' onClick={() => refetch()}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    )
  }

  const winners = data?.winners || []
  const displayWinners = showAll ? winners : winners.slice(0, 5)

  if (winners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Người thắng cuộc</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center justify-center gap-4 py-6'>
          <p className='text-center text-muted-foreground'>Không có người thắng cuộc trong lượt chơi này.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-amber-500' />
            Người thắng cuộc
          </CardTitle>
          <CardDescription>
            {winners.length} người thắng số {gameRound.result}
          </CardDescription>
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
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người chơi</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className='text-right'>Cược</TableHead>
                <TableHead className='text-right'>Thắng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayWinners.map(winner => (
                <TableRow key={winner.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={winner.profiles?.avatar_url || ''}
                          alt={winner.profiles?.display_name || winner.profiles?.username}
                        />
                        <AvatarFallback>
                          {(winner.profiles?.display_name || winner.profiles?.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{winner.profiles?.display_name || winner.profiles?.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(winner.created_at || new Date()), 'HH:mm, dd/MM')}</TableCell>
                  <TableCell className='text-right'>{formatMoney(winner.amount)}</TableCell>
                  <TableCell className='text-right font-medium text-green-600 dark:text-green-400'>
                    {formatMoney(winner.potential_win)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {winners.length > 5 && (
          <div className='mt-4 text-center'>
            <Button variant='outline' onClick={() => setShowAll(!showAll)} className='w-full'>
              {showAll ? (
                'Thu gọn'
              ) : (
                <>
                  <Search className='mr-2 h-4 w-4' />
                  Xem tất cả {winners.length} người thắng
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function WinnerListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between'>
          <Skeleton className='h-6 w-40' />
          <Skeleton className='h-8 w-20' />
        </div>
        <Skeleton className='h-4 w-24 mt-1' />
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-20' />
                </TableHead>
                <TableHead className='text-right'>
                  <Skeleton className='h-4 w-16 ml-auto' />
                </TableHead>
                <TableHead className='text-right'>
                  <Skeleton className='h-4 w-16 ml-auto' />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-8 w-8 rounded-full' />
                      <Skeleton className='h-4 w-24' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Skeleton className='h-4 w-16 ml-auto' />
                  </TableCell>
                  <TableCell className='text-right'>
                    <Skeleton className='h-4 w-20 ml-auto' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
