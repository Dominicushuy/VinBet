'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  User,
  Users,
  AlertCircle,
  Share2,
  Gamepad,
  BadgeCheck,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { BetForm } from '@/components/bet/BetForm'
import { BetList } from '@/components/bet/BetList'
import { WinnerList } from '@/components/game/WinnerList'
import { useGameDetailQuery } from '@/hooks/queries/useGameQueries'
import { toast } from 'react-hot-toast'
import RelatedGames from '@/components/game/RelatedGames'
import GameResultAnimation from '@/components/game/GameResultAnimation'
import GameLeaderboard from '@/components/game/GameLeaderboard'

export default function GameDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [timeLeft, setTimeLeft] = useState('')
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isLive, setIsLive] = useState(false)

  // Fetch game details
  const { data: gameData, isLoading, error } = useGameDetailQuery(id)
  const game = gameData?.gameRound

  // Update time remaining and progress
  useEffect(() => {
    if (!game) return

    const updateTimeAndProgress = () => {
      const now = new Date()
      const startTime = new Date(game.start_time)
      const endTime = new Date(game.end_time)
      const totalDuration = endTime.getTime() - startTime.getTime()

      if (now >= startTime && now < endTime) {
        setIsLive(true)
        const elapsed = now.getTime() - startTime.getTime()
        const progress = Math.min((elapsed / totalDuration) * 100, 100)
        setProgressPercentage(progress)

        const timeRemaining = formatDistanceToNow(endTime, {
          locale: vi,
          addSuffix: false,
        })
        setTimeLeft(`Kết thúc trong ${timeRemaining}`)
      } else if (now < startTime) {
        setIsLive(false)
        setProgressPercentage(0)

        const timeToStart = formatDistanceToNow(startTime, {
          locale: vi,
          addSuffix: false,
        })
        setTimeLeft(`Bắt đầu trong ${timeToStart}`)
      } else {
        setIsLive(false)
        setProgressPercentage(100)
        setTimeLeft('Đã kết thúc')
      }
    }

    updateTimeAndProgress()
    const intervalId = setInterval(updateTimeAndProgress, 60000)

    return () => clearInterval(intervalId)
  }, [game])

  // Share game
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `VinBet - Lượt chơi #${id}`,
          text: `Tham gia lượt chơi trên VinBet và có cơ hội thắng lớn!`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error('Có lỗi khi chia sẻ:', err)
          copyToClipboard()
        })
    } else {
      copyToClipboard()
    }
  }

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép liên kết vào clipboard')
  }

  // Format dates
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'HH:mm, dd/MM/yyyy', { locale: vi })
  }

  // Loading state
  if (isLoading) {
    return <GameDetailSkeleton />
  }

  // Error state
  if (error || !game) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/games'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <h2 className='text-2xl font-bold tracking-tight'>
            Chi tiết lượt chơi
          </h2>
        </div>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin lượt chơi. Vui lòng thử lại sau.
            {error instanceof Error && error.message && (
              <div className='mt-2 text-sm opacity-80'>{error.message}</div>
            )}
          </AlertDescription>
        </Alert>
        <div className='flex justify-center'>
          <Button asChild>
            <Link href='/games'>Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check if game is jackpot
  const isJackpot = Boolean(
    game.is_jackpot ||
      new Date(game.end_time).getTime() - new Date(game.start_time).getTime() >
        24 * 60 * 60 * 1000
  )

  // Get status badge
  const getStatusBadge = () => {
    switch (game.status) {
      case 'active':
        return (
          <Badge variant='default' className='bg-green-500'>
            <span className='mr-1 h-2 w-2 rounded-full bg-white inline-block animate-pulse'></span>
            Đang diễn ra
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant='outline' className='border-blue-500 text-blue-500'>
            <Calendar className='mr-1 h-3 w-3' />
            Sắp diễn ra
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant='secondary'>
            <Trophy className='mr-1 h-3 w-3' />
            Đã kết thúc
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='destructive'>
            <AlertCircle className='mr-1 h-3 w-3' />
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant='outline'>{game.status}</Badge>
    }
  }

  // Calculate a gradient based on time progress
  const getProgressGradient = () => {
    if (progressPercentage < 30) {
      return 'from-green-500 to-green-400'
    } else if (progressPercentage < 70) {
      return 'from-yellow-500 to-amber-400'
    } else {
      return 'from-red-500 to-orange-400'
    }
  }

  return (
    <div className='space-y-6'>
      {/* Back button and header */}
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' asChild>
            <Link href='/games'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2'>
              Lượt chơi #{id.toString().substring(0, 8)}
              {isJackpot && (
                <Badge variant='default' className='bg-amber-500 ml-2'>
                  <Trophy className='mr-1 h-3.5 w-3.5' />
                  JACKPOT
                </Badge>
              )}
            </h2>
            <p className='text-muted-foreground'>
              Chi tiết lượt chơi và đặt cược
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {getStatusBadge()}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='icon'>
                <Share2 className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-52' align='end'>
              <div className='text-sm font-medium mb-2'>Chia sẻ lượt chơi</div>
              <div className='flex gap-2'>
                <Button size='sm' className='w-full' onClick={handleShare}>
                  <Share2 className='mr-2 h-4 w-4' />
                  Chia sẻ
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Game status banner */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-3 flex justify-between items-center'>
            <div className='flex items-center'>
              <span className='h-3 w-3 rounded-full bg-green-500 animate-pulse mr-3'></span>
              <span className='font-medium'>Lượt chơi đang diễn ra</span>
              <span className='ml-2 text-muted-foreground'>{timeLeft}</span>
            </div>
            <div className='flex items-center'>
              <div className='flex gap-1 items-center text-sm text-muted-foreground mr-3'>
                <Users className='h-4 w-4' />
                <span>{game.bets_count?.count || 0} người chơi</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time progress for active games */}
      {isLive && (
        <div className='relative pt-1'>
          <div className='flex items-center justify-between mb-1'>
            <div className='text-xs text-muted-foreground'>
              Tiến độ: {progressPercentage.toFixed(0)}%
            </div>
            <div className='text-xs text-muted-foreground'>{timeLeft}</div>
          </div>
          <Progress
            value={progressPercentage}
            className='h-2'
            indicatorClassName={`bg-gradient-to-r ${getProgressGradient()}`}
          />
        </div>
      )}

      {/* Main content */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Left column: Game info */}
        <div className='md:col-span-2 space-y-6'>
          {/* Game tabs */}
          <Tabs
            defaultValue='overview'
            value={activeTab}
            onValueChange={setActiveTab}>
            <TabsList className='mb-4 w-full overflow-auto'>
              <TabsTrigger value='overview' className='whitespace-nowrap'>
                <span className='sm:hidden'>Tổng quan</span>
                <span className='hidden sm:inline'>Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value='bets' className='whitespace-nowrap'>
                <span className='sm:hidden'>Đặt cược</span>
                <span className='hidden sm:inline'>Đặt cược</span>
              </TabsTrigger>
              <TabsTrigger
                value='results'
                disabled={game.status !== 'completed'}
                className='whitespace-nowrap'>
                <span className='sm:hidden'>Kết quả</span>
                <span className='hidden sm:inline'>Kết quả</span>
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
                      <div className='font-medium'>
                        {formatDate(game.start_time)}
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                        <span>Thời gian kết thúc</span>
                      </div>
                      <div className='font-medium'>
                        {formatDate(game.end_time)}
                      </div>
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
                        <AvatarFallback>
                          {(game.creator?.display_name || 'A')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium'>
                        {game.creator?.display_name ||
                          game.creator?.username ||
                          'Admin'}
                      </span>
                      <Badge
                        variant='outline'
                        className='ml-1 h-5 flex items-center'>
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
                        Người chơi có thể đặt cược vào một số từ 0-9. Nếu kết
                        quả trùng khớp với số bạn chọn, bạn sẽ nhận được tiền
                        thưởng gấp 9 lần số tiền cược.
                      </p>
                      <p>
                        Kết quả sẽ được công bố ngay sau khi lượt chơi kết thúc.
                        Tiền thưởng sẽ được cộng trực tiếp vào tài khoản của
                        bạn.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Game Leaderboard */}
              <GameLeaderboard
                gameId={id}
                isCompleted={game.status === 'completed'}
              />

              {/* User's bets in this game */}
              <BetList gameRoundId={id} />

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
                      <GameResultAnimation
                        result={game.result}
                        autoPlay={false}
                      />
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
              <BetList gameRoundId={id} />
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
                    <CardDescription>
                      Kết quả sẽ được hiển thị sau khi lượt chơi kết thúc
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column: Sidebar */}
        <div className='space-y-6'>
          {/* Bet form in sidebar for active games */}
          {game.status === 'active' && (
            <div className='block md:hidden'>
              <BetForm gameRound={game} />
            </div>
          )}
          {/* Game status card */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Trạng thái:
                  </span>
                  <div>{getStatusBadge()}</div>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Người tham gia:
                  </span>
                  <div className='font-medium'>
                    {game.bets_count?.count || 0}
                  </div>
                </div>
                {isLive && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Thời gian còn lại:
                    </span>
                    <div className='font-medium text-green-600 dark:text-green-400'>
                      {timeLeft}
                    </div>
                  </div>
                )}
                {game.status === 'completed' && game.result && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Kết quả:
                    </span>
                    <div className='font-bold text-xl'>{game.result}</div>
                  </div>
                )}
              </div>
              {/* Call to action */}
              {game.status === 'active' && !isLoading && (
                <div className='pt-2'>
                  <Button
                    className='w-full'
                    onClick={() => setActiveTab('bets')}>
                    Đặt cược ngay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          {/* User's bets */}
          <div className='hidden md:block'>
            <BetList gameRoundId={id} />
          </div>
        </div>
      </div>

      {/* Related games section */}
      {game && (
        <div className='mt-8'>
          <RelatedGames currentGameId={id} />
        </div>
      )}
    </div>
  )
}

// Loading skeleton
function GameDetailSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Header skeleton */}
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-9 w-9 rounded-md' />
          <div>
            <Skeleton className='h-7 w-60' />
            <Skeleton className='h-4 w-40 mt-1' />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-20 rounded-full' />
          <Skeleton className='h-9 w-9 rounded-md' />
        </div>
      </div>

      {/* Tabs skeleton */}
      <Skeleton className='h-10 w-full max-w-xs' />

      {/* Main content skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          {/* Game info skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-5 w-44' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-5 w-44' />
                </div>
              </div>
              <Separator />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-6 w-6 rounded-full' />
                  <Skeleton className='h-5 w-32' />
                </div>
              </div>
              <Separator />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar skeleton */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-20' />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-5 w-20' />
                </div>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-5 w-8' />
                </div>
                <div className='flex justify-between items-center'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-5 w-24' />
                </div>
              </div>
              <Skeleton className='h-9 w-full mt-2' />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
            </CardHeader>
            <CardContent className='space-y-2'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
