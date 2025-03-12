// src/app/(admin)/admin/games/[id]/page.jsx
import { Suspense } from 'react'
import { AdminGameDetail } from '@/components/admin/game-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Thay metadata tĩnh bằng dynamic metadata
export async function generateMetadata({ params }) {
  return {
    title: `Game #${params.id.substring(0, 8)} - Admin - VinBet`,
    description: 'Quản lý chi tiết lượt chơi trên nền tảng VinBet'
  }
}

export default function GameDetailPage({ params }) {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb
        items={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Trò chơi', href: '/admin/games' },
          { label: `Chi tiết #${params.id.substring(0, 8)}`, href: '#' }
        ]}
      />

      <ErrorBoundary>
        <Suspense fallback={<GameDetailSkeleton />}>
          {params.id ? <AdminGameDetail gameId={params.id} /> : <NoGameSelected />}
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

function NoGameSelected() {
  return (
    <div className='flex items-center justify-center h-[400px] border border-dashed rounded-lg'>
      <div className='text-center'>
        <h3 className='text-lg font-medium'>Không tìm thấy thông tin lượt chơi</h3>
        <p className='text-muted-foreground mt-2'>ID lượt chơi không hợp lệ hoặc không tồn tại</p>
      </div>
    </div>
  )
}
