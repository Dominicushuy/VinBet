import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function GameDetailSkeleton() {
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

      {/* Live status skeleton */}
      <Skeleton className='h-12 w-full rounded-lg' />

      {/* Tabs skeleton */}
      <Skeleton className='h-10 w-full max-w-xs' />

      {/* Main content skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          {/* Game info skeleton */}
          <div className='border rounded-lg overflow-hidden p-6 space-y-6'>
            <Skeleton className='h-6 w-40' />
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
          </div>

          {/* Game leaderboard skeleton */}
          <div className='border rounded-lg overflow-hidden p-6 space-y-4'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-60' />
            <Skeleton className='h-8 w-full' />
            <div className='space-y-3'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <Skeleton className='h-8 w-8 rounded-full' />
                  <Skeleton className='h-5 w-40' />
                  <Skeleton className='h-5 w-20 ml-auto' />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className='space-y-6'>
          <div className='border rounded-lg overflow-hidden p-6 space-y-4'>
            <Skeleton className='h-6 w-20' />
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
          </div>

          <div className='border rounded-lg overflow-hidden p-6 space-y-4'>
            <Skeleton className='h-6 w-32' />
            <div className='space-y-3'>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
