'use client'

import Link from 'next/link'
import { useMemo, useCallback } from 'react'
import { ArrowLeft, Share2, Trophy, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertCircle } from 'lucide-react'

export default function GameHeader({ id, game }) {
  // Check if game is jackpot
  const isJackpot = useMemo(
    () =>
      Boolean(
        game.is_jackpot || new Date(game.end_time).getTime() - new Date(game.start_time).getTime() > 24 * 60 * 60 * 1000
      ),
    [game?.is_jackpot, game?.end_time, game?.start_time]
  )

  // Copy to clipboard function
  const copyToClipboard = useCallback(() => {
    try {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Đã sao chép liên kết vào clipboard')
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      toast.error('Không thể sao chép liên kết')
    }
  }, [])

  // Share game function
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: `VinBet - Lượt chơi #${id}`,
          text: `Tham gia lượt chơi trên VinBet và có cơ hội thắng lớn!`,
          url: window.location.href
        })
        .catch(err => {
          console.error('Có lỗi khi chia sẻ:', err)
          copyToClipboard()
        })
    } else {
      copyToClipboard()
    }
  }, [id, copyToClipboard])

  // Get status badge function
  const getStatusBadge = useCallback(() => {
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
  }, [game?.status])

  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0'>
      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/games'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <h2 className='text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap'>
            Lượt chơi #{id.toString().substring(0, 8)}
            {isJackpot && (
              <Badge variant='default' className='bg-amber-500 ml-0 sm:ml-2 mt-1 sm:mt-0'>
                <Trophy className='mr-1 h-3.5 w-3.5' />
                JACKPOT
              </Badge>
            )}
          </h2>
          <p className='text-muted-foreground'>Chi tiết lượt chơi và đặt cược</p>
        </div>
      </div>
      <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
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
  )
}
