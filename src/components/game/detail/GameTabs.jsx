'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertCircle, BadgeCheck, Calendar, Clock, Gamepad, User } from 'lucide-react'

import { BetForm } from '@/components/bet/BetForm'
import { BetList } from '@/components/bet/BetList'
import { WinnerList } from '@/components/game/WinnerList'
import GameResultAnimation from '@/components/game/GameResultAnimation'
import GameLeaderboard from '@/components/game/GameLeaderboard'
import { Trophy } from 'lucide-react'

export default function GameTabs({ game, gameId, activeTab, setActiveTab }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && ['overview', 'bets', 'results'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, setActiveTab])

  // Update URL when tab changes
  const handleTabChange = value => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Format dates
  const formatDate = dateString => {
    return format(new Date(dateString), 'HH:mm, dd/MM/yyyy', { locale: vi })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className='mb-4 w-full overflow-x-auto flex-nowrap'>
        <TabsTrigger value='overview' className='whitespace-nowrap flex-1'>
          <span>Tổng quan</span>
        </TabsTrigger>
        <TabsTrigger value='bets' className='whitespace-nowrap flex-1'>
          <span>Đặt cược</span>
        </TabsTrigger>
        <TabsTrigger value='results' disabled={game.status !== 'completed'} className='whitespace-nowrap flex-1'>
          <span>Kết quả</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview tab */}
      <TabsContent value='overview' className='space-y-6'>
        {/* Game info card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lượt chơi</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Time info */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Calendar className='h-4 w-4' />
                  <span>Thời gian bắt đầu</span>
                </div>
                <div className='font-medium'>{formatDate(game.start_time)}</div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4' />
                  <span>Thời gian kết thúc</span>
                </div>
                <div className='font-medium'>{formatDate(game.end_time)}</div>
              </div>
            </div>

            <Separator />

            {/* Creator info */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <User className='h-4 w-4' />
                <span>Người tạo</span>
              </div>
              <div className='flex items-center gap-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage src={game.creator?.avatar_url || ''} />
                  <AvatarFallback>{(game.creator?.display_name || 'A')[0]}</AvatarFallback>
                </Avatar>
                <span className='font-medium'>{game.creator?.display_name || game.creator?.username || 'Admin'}</span>
                <Badge variant='outline' className='ml-1 h-5 flex items-center'>
                  <BadgeCheck className='h-3 w-3 mr-1' />
                  Admin
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Game rules */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Gamepad className='h-4 w-4' />
                <span>Luật chơi</span>
              </div>
              <div className='text-sm space-y-2'>
                <p>
                  Người chơi có thể đặt cược vào một số từ 0-9. Nếu kết quả trùng khớp với số bạn chọn, bạn sẽ nhận được
                  tiền thưởng gấp 9 lần số tiền cược.
                </p>
                <p>
                  Kết quả sẽ được công bố ngay sau khi lượt chơi kết thúc. Tiền thưởng sẽ được cộng trực tiếp vào tài
                  khoản của bạn.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Leaderboard */}
        <GameLeaderboard gameId={gameId} isCompleted={game.status === 'completed'} />

        {/* User's bets in this game */}
        <BetList gameRoundId={gameId} />

        {/* Game result and winners (if completed) */}
        {game.status === 'completed' && game.result && (
          <>
            <Separator />
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Trophy className='h-4 w-4 text-amber-500' />
                <span>Kết quả</span>
              </div>
              <div className='flex justify-center py-4'>
                <GameResultAnimation result={game.result} autoPlay={false} />
              </div>
            </div>
          </>
        )}

        {/* Winner list */}
        {game.status === 'completed' && <WinnerList gameRound={game} />}
      </TabsContent>

      {/* Betting tab */}
      <TabsContent value='bets' className='space-y-6'>
        <BetForm gameRound={game} />
        <BetList gameRoundId={gameId} />
      </TabsContent>

      {/* Results tab */}
      <TabsContent value='results' className='space-y-6'>
        {game.status === 'completed' ? (
          <>
            <GameResultAnimation result={game.result} autoPlay={false} />
            <WinnerList gameRound={game} />
          </>
        ) : (
          <Card>
            <CardContent className='pt-6 pb-6 text-center'>
              <AlertCircle className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
              <CardDescription>Kết quả sẽ được hiển thị sau khi lượt chơi kết thúc</CardDescription>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
