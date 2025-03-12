// src/components/admin/payment-request/skeletons.jsx
import { Skeleton } from '@/components/ui/skeleton'

export function PaymentRequestsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-48 mt-2' />
        </div>
        <Skeleton className='h-10 w-24' />
      </div>

      <div className='border rounded-lg p-6'>
        <div className='flex justify-between mb-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-8 w-24' />
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

        <div className='flex justify-between mt-4'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-8 w-64' />
        </div>
      </div>
    </div>
  )
}

export function PaymentRequestDetailSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-6 w-24' />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-24 w-full' />
        </div>

        <div className='col-span-2 space-y-4'>
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-24 w-full' />
        </div>
      </div>
    </div>
  )
}
