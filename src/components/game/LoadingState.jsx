// src/app/(main)/games/components/LoadingState.jsx
import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const GameCardSkeleton = () => (
  <Card className='overflow-hidden h-[280px]'>
    <CardContent className='p-0 flex flex-col h-full'>
      <div className='h-40 bg-muted animate-pulse'></div>
      <div className='p-4 space-y-3 flex-1'>
        <Skeleton className='h-5 w-3/4' />
        <div className='flex justify-between'>
          <Skeleton className='h-4 w-1/3' />
          <Skeleton className='h-4 w-1/4' />
        </div>
        <div className='flex justify-between items-center mt-auto pt-2'>
          <Skeleton className='h-4 w-1/2' />
          <Skeleton className='h-8 w-16 rounded-md' />
        </div>
      </div>
    </CardContent>
  </Card>
)

const GameListItemSkeleton = () => (
  <Card className='overflow-hidden'>
    <CardContent className='p-4 flex items-center gap-4'>
      <Skeleton className='h-16 w-16 rounded-md' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-5 w-3/4' />
        <div className='flex gap-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-24' />
        </div>
      </div>
      <Skeleton className='h-9 w-24 rounded-md' />
    </CardContent>
  </Card>
)

const LoadingState = memo(function LoadingState({ viewType = 'grid', count = 6 }) {
  return (
    <div>
      {viewType === 'grid' ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: count }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className='space-y-3'>
          {Array.from({ length: count }).map((_, i) => (
            <GameListItemSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  )
})

export default LoadingState
