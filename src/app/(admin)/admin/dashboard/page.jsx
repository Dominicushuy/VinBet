// src/app/(admin)/admin/dashboard/page.jsx
import { Suspense } from 'react'
import { AdminDashboard } from '@/components/admin/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Admin Dashboard - VinBet',
  description: 'Tổng quan hệ thống VinBet'
}

export default function AdminDashboardPage() {
  return (
    <div className='space-y-6'>
      <Suspense fallback={<DashboardSkeleton />}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-48 mt-2' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-40' />
          <Skeleton className='h-10 w-24' />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className='h-32 w-full rounded-lg' />
          ))}
      </div>

      {/* Charts */}
      <div className='grid grid-cols-12 gap-4'>
        <Skeleton className='col-span-12 lg:col-span-8 h-96 rounded-lg' />
        <Skeleton className='col-span-12 lg:col-span-4 h-96 rounded-lg' />
      </div>

      {/* Tables */}
      <div className='grid grid-cols-12 gap-4'>
        <Skeleton className='col-span-12 md:col-span-8 h-64 rounded-lg' />
        <Skeleton className='col-span-12 md:col-span-4 h-64 rounded-lg' />
      </div>
    </div>
  )
}
