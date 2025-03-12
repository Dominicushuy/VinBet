// src/app/(admin)/admin/users/[id]/page.jsx
import { Suspense } from 'react'
import { AdminUserDetail } from '@/components/admin/user-detail'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata = {
  title: 'Chi tiết người dùng - Admin - VinBet',
  description: 'Xem và quản lý thông tin chi tiết người dùng trên VinBet'
}

export default function AdminUserDetailPage({ params }) {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb />
      <Suspense fallback={<UserDetailSkeleton />}>
        <AdminUserDetail userId={params.id} />
      </Suspense>
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-6 w-24' />
        </div>
        <div className='flex space-x-2'>
          <Skeleton className='h-10 w-10 rounded-md' />
          <Skeleton className='h-10 w-28 rounded-md' />
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <Skeleton className='h-[600px] md:col-span-1 rounded-lg' />
        <Skeleton className='h-[600px] md:col-span-2 rounded-lg' />
      </div>
    </div>
  )
}
