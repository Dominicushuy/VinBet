'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Trophy, Medal, Users, RefreshCw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function GameLeaderboard({ gameId, isCompleted = false }) {
  const [tab, setTab] = useState('bets')

  // Lấy dữ liệu bảng xếp hạng
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['games', gameId, 'leaderboard'],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}/leaderboard`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data')
      }
      return response.json()
    }
  })

  const topBets = data?.topBets || []
  const topWinners = data?.topWinners || []

  // Hàm định dạng tiền tệ
  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Trạng thái loading
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-7 w-48' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-64' />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-8 w-full mb-4' />
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='h-8 w-8 rounded-full' />
                <Skeleton className='h-5 w-1/3' />
                <Skeleton className='h-5 w-1/4 ml-auto' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Trạng thái lỗi hoặc dữ liệu rỗng
  if (error || (tab === 'bets' && topBets.length === 0) || (tab === 'winners' && topWinners.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5 text-amber-500' />
            Bảng xếp hạng
          </CardTitle>
          <CardDescription>Những người đặt cược nhiều nhất và thắng lớn nhất</CardDescription>
        </CardHeader>
        <CardContent className='text-center py-6'>
          <Users className='h-10 w-10 mx-auto text-muted-foreground mb-3' />
          <p className='text-muted-foreground mb-2'>
            {tab === 'bets'
              ? 'Chưa có người chơi nào đặt cược trong lượt này'
              : 'Chưa có người thắng cuộc trong lượt này'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Hàm tạo icon theo vị trí
  const getPositionIcon = position => {
    switch (position) {
      case 1:
        return <Trophy className='h-5 w-5 text-amber-500' />
      case 2:
        return <Medal className='h-5 w-5 text-slate-400' />
      case 3:
        return <Medal className='h-5 w-5 text-amber-700' />
      default:
        return <span className='w-5 text-center font-medium'>{position}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-start'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-amber-500' />
              Bảng xếp hạng
            </CardTitle>
            <CardDescription>Những người đặt cược nhiều nhất và thắng lớn nhất</CardDescription>
          </div>
          <Button variant='outline' size='icon' onClick={() => refetch()} className='h-8 w-8'>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2 mb-4'>
            <TabsTrigger value='bets'>Top đặt cược</TabsTrigger>
            <TabsTrigger value='winners' disabled={!isCompleted}>
              Top thắng cuộc
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode='wait'>
            <TabsContent value='bets' className='mt-0'>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='space-y-4'
              >
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12'>#</TableHead>
                        <TableHead>Người chơi</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className='text-right'>Số tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topBets.map((bet, index) => (
                        <TableRow key={bet.id}>
                          <TableCell className='p-2'>
                            <div className='flex items-center justify-center'>{getPositionIcon(index + 1)}</div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={bet.profile.avatar_url || ''} />
                                <AvatarFallback>
                                  {(bet.profile.display_name || bet.profile.username || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className='font-medium truncate max-w-[120px]'>
                                {bet.profile.display_name || bet.profile.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(bet.created_at), 'HH:mm, dd/MM', {
                              locale: vi
                            })}
                          </TableCell>
                          <TableCell className='text-right font-medium'>{formatMoney(bet.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value='winners' className='mt-0'>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='space-y-4'
              >
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-12'>#</TableHead>
                        <TableHead>Người chơi</TableHead>
                        <TableHead>Số đã chọn</TableHead>
                        <TableHead className='text-right'>Thắng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topWinners.map((winner, index) => (
                        <TableRow key={winner.id}>
                          <TableCell className='p-2'>
                            <div className='flex items-center justify-center'>{getPositionIcon(index + 1)}</div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Avatar className='h-6 w-6'>
                                <AvatarImage src={winner.profile.avatar_url || ''} />
                                <AvatarFallback>
                                  {(winner.profile.display_name || winner.profile.username || 'U')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className='font-medium truncate max-w-[120px]'>
                                {winner.profile.display_name || winner.profile.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className='font-bold'>
                              {winner.chosen_number}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right font-medium text-green-600 dark:text-green-400'>
                            {formatMoney(winner.potential_win)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  )
}
