// src/components/notifications/NotificationSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationSkeleton({ count = 3 }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='border rounded-lg p-4'>
          <div className='flex gap-3'>
            <Skeleton className='h-10 w-10 rounded-full flex-shrink-0' />
            <div className='space-y-2 flex-1'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-5 w-[200px]' />
                <Skeleton className='h-4 w-16' />
              </div>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-[90%]' />
              <div className='flex justify-end pt-2'>
                <Skeleton className='h-8 w-28' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
