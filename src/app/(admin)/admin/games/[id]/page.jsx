// src/app/(admin)/admin/games/[id]/page.jsx
import { Suspense } from 'react'
import { AdminGameDetail } from '@/components/admin/game-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'Chi tiết lượt chơi - Admin - VinBet',
  description: 'Xem và quản lý thông tin chi tiết lượt chơi trên VinBet'
}

export default function GameDetailPage({ params }) {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb
        items={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Trò chơi', href: '/admin/games' },
          { label: 'Chi tiết', href: '#' }
        ]}
      />

      <ErrorBoundary>
        <Suspense fallback={<GameDetailSkeleton />}>
          <AdminGameDetail gameId={params.id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function GameDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-6 w-24' />
        </div>
        <div className='flex flex-wrap gap-2 mt-4 sm:mt-0'>
          <Skeleton className='h-10 w-10 rounded-md' />
          <Skeleton className='h-10 w-28 rounded-md' />
          <Skeleton className='h-10 w-28 rounded-md' />
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <Skeleton className='h-[400px] md:col-span-1 rounded-lg' />
        <Skeleton className='h-[400px] md:col-span-2 rounded-lg' />
      </div>
    </div>
  )
}
