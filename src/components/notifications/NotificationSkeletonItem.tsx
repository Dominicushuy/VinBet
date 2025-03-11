// src/components/notifications/NotificationSkeletonItem.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationSkeletonItem() {
  return (
    <div className='p-4 border-b last:border-b-0'>
      <div className='flex gap-3'>
        <Skeleton className='h-9 w-9 rounded-full flex-shrink-0' />
        <div className='space-y-2 flex-1'>
          <div className='flex justify-between'>
            <Skeleton className='h-4 w-[180px]' />
            <Skeleton className='h-3 w-12' />
          </div>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-4/5' />
          <div className='flex justify-between pt-1'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-24' />
          </div>
        </div>
      </div>
    </div>
  )
}
