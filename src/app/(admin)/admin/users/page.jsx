// src/app/(admin)/admin/users/page.jsx
import { Suspense } from 'react'
import { AdminUserManagement } from '@/components/admin/user'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata = {
  title: 'Quản lý người dùng - Admin - VinBet',
  description: 'Quản lý danh sách người dùng trên nền tảng VinBet'
}

export default function AdminUsersPage() {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb />
      <Suspense fallback={<UserManagementSkeleton />}>
        <AdminUserManagement />
      </Suspense>
    </div>
  )
}

function UserManagementSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-48 mt-2' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-24' />
        </div>
      </div>

      <div className='border rounded-lg p-6'>
        <div className='flex justify-between mb-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-8 w-32' />
        </div>

        <div className='flex items-center py-4'>
          <Skeleton className='h-10 w-64' />
          <div className='ml-auto'>
            <Skeleton className='h-10 w-32' />
          </div>
        </div>

        <div className='space-y-2'>
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
        </div>

        <div className='flex justify-between mt-4'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-8 w-64' />
        </div>
      </div>
    </div>
  )
}
