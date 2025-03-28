import { Skeleton } from '@/components/ui/skeleton'

export function GameManagementSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-48 mt-2' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-36' />
        </div>
      </div>

      <Skeleton className='h-12 w-full rounded-lg' />

      <div className='border rounded-lg p-6'>
        <div className='flex justify-between mb-4'>
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-40' />
          </div>
          <Skeleton className='h-10 w-32' />
        </div>

        <div className='space-y-2 mb-4'>
          <Skeleton className='h-10 w-full' />
        </div>

        <div className='space-y-2'>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
        </div>

        <div className='flex justify-center mt-4'>
          <Skeleton className='h-8 w-64' />
        </div>
      </div>
    </div>
  )
}
