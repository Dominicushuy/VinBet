'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useGameDetailQuery } from '@/hooks/queries/useGameQueries'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Tách thành các component riêng biệt
import GameHeader from '@/components/game/detail/GameHeader'
import GameStatusBar from '@/components/game/detail/GameStatusBar'
import GameTabs from '@/components/game/detail/GameTabs'
import GameSidebar from '@/components/game/detail/GameSidebar'
import GameDetailSkeleton from '@/components/game/detail/GameDetailSkeleton'
import { ArrowLeft } from 'lucide-react'
import RelatedGames from '@/components/game/RelatedGames'

export default function GameDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const relatedGamesRef = useRef(null)
  const [loadRelatedGames, setLoadRelatedGames] = useState(false)

  // Fetch game details
  const { data: gameData, isLoading, error } = useGameDetailQuery(id)
  const game = gameData?.gameRound

  // Lazy load related games
  useEffect(() => {
    if (!relatedGamesRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadRelatedGames(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(relatedGamesRef.current)

    return () => observer.disconnect()
  }, [])

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
          <h2 className='text-2xl font-bold tracking-tight'>Chi tiết lượt chơi</h2>
        </div>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin lượt chơi. Vui lòng thử lại sau.
            {error instanceof Error && error.message && <div className='mt-2 text-sm opacity-80'>{error.message}</div>}
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

  return (
    <div className='space-y-6'>
      {/* Game header with title and share button */}
      <GameHeader id={id} game={game} />

      {/* Game status banner and time progress */}
      <GameStatusBar game={game} />

      {/* Main content */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Left column: Game info */}
        <div className='md:col-span-2 space-y-6'>
          <GameTabs game={game} gameId={id} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Right column: Sidebar */}
        <GameSidebar game={game} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Related games section with lazy loading */}
      <div ref={relatedGamesRef} className='mt-8'>
        {loadRelatedGames && game && <RelatedGames currentGameId={id} />}
      </div>
    </div>
  )
}
