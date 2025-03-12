'use client'

import { useActiveGamesQuery } from '@/hooks/queries/useGameQueries'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, PlayCircle, Users, AlertCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export function ActiveGamesList() {
  const router = useRouter()
  const { data, isLoading, error } = useActiveGamesQuery({
    onError: err => {
      console.error('Failed to fetch active games:', err)
    }
  })

  // Xử lý trường hợp lỗi
  if (error) {
    return (
      <div className='border border-destructive/20 bg-destructive/10 p-4 rounded-md'>
        <div className='flex items-center text-destructive mb-2'>
          <AlertCircle className='h-4 w-4 mr-2' />
          <p className='text-sm font-medium'>Không thể tải dữ liệu</p>
        </div>
        <p className='text-sm text-muted-foreground'>Đã xảy ra lỗi khi tải danh sách trò chơi.</p>
        <Button variant='outline' size='sm' className='mt-2' onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex flex-col gap-2'>
            <Skeleton className='h-6 w-full' />
            <div className='flex justify-between'>
              <Skeleton className='h-4 w-[140px]' />
              <Skeleton className='h-4 w-[80px]' />
            </div>
            <Skeleton className='h-4 w-[120px]' />
          </div>
        ))}
      </div>
    )
  }

  const activeGames = (data && data.active) || []

  if (activeGames.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-[200px] bg-muted/20 rounded-md'>
        <p className='text-muted-foreground text-center'>Không có lượt chơi nào đang diễn ra</p>
        <Button variant='outline' className='mt-2' onClick={() => router.push('/admin/games')}>
          <PlayCircle className='h-4 w-4 mr-2' />
          Tạo lượt mới
        </Button>
      </div>
    )
  }

  // Hàm an toàn để format ngày tháng
  const safeFormatDistance = dateString => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi
      })
    } catch (err) {
      console.error('Date parsing error:', err)
      return 'Không xác định'
    }
  }

  const safeFormat = (dateString, formatString) => {
    try {
      return format(new Date(dateString), formatString)
    } catch (err) {
      console.error('Date formatting error:', err)
      return 'N/A'
    }
  }

  return (
    <div className='space-y-3'>
      {activeGames.map(game => (
        <div
          key={game.id}
          className='border rounded-md p-3 hover:bg-muted/30 transition-colors cursor-pointer'
          onClick={() => router.push(`/admin/games/${game.id}`)}
        >
          <div className='flex justify-between items-start mb-1'>
            <div className='font-medium truncate'>Game #{game.id ? game.id.substring(0, 8) : 'N/A'}</div>
            <Badge variant='success' className='bg-success/20 text-success'>
              Đang diễn ra
            </Badge>
          </div>

          <div className='flex items-center text-sm text-muted-foreground mb-1'>
            <Clock className='h-3.5 w-3.5 mr-1' />
            <span>{game.end_time ? safeFormatDistance(game.end_time) : 'Thời gian không xác định'}</span>
          </div>

          <div className='flex justify-between items-center mt-2 text-sm'>
            <div className='flex items-center'>
              <Users className='h-3.5 w-3.5 mr-1' />
              <span>{(game.bets_count && game.bets_count.count) || 0} lượt cược</span>
            </div>
            <span className='text-xs font-medium'>
              {game.start_time ? safeFormat(game.start_time, 'HH:mm, dd/MM/yyyy') : 'N/A'}
            </span>
          </div>
        </div>
      ))}

      {activeGames.length > 0 && (
        <Button
          variant='ghost'
          className='w-full text-center text-sm text-muted-foreground mt-2'
          onClick={() => router.push('/admin/games?status=active')}
        >
          Xem tất cả
        </Button>
      )}
    </div>
  )
}
