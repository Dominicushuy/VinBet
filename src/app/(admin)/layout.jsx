import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/middleware/adminAuth'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminFooter } from '@/components/admin/layout/AdminFooter'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Component để hiển thị loading state của content
function AdminContentLoading() {
  return (
    <div className='p-6 space-y-4'>
      <Skeleton className='h-8 w-64' />
      <Skeleton className='h-4 w-full max-w-md' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-32 w-full rounded-lg' />
        ))}
      </div>
      <Skeleton className='h-64 w-full rounded-lg mt-6' />
    </div>
  )
}

export default async function AdminLayout({ children }) {
  // Sử dụng middleware để kiểm tra quyền admin
  const { redirect: redirectInfo, userProfile } = await checkAdminAuth()

  // Nếu không có quyền, chuyển hướng
  if (redirectInfo) {
    redirect(redirectInfo.destination)
  }

  // Nếu có userProfile, render layout
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <AdminHeader userProfile={userProfile} />
      <div className='flex-1 flex'>
        <AdminSidebar />
        <main className='flex-1 p-0 md:p-6 overflow-auto'>
          <div className='container mx-auto max-w-7xl'>
            <Suspense fallback={<AdminContentLoading />}>{children}</Suspense>
          </div>
        </main>
      </div>
      <AdminFooter />
    </div>
  )
}

// Loading component cho Next.js App Router
export function Loading() {
  return <AdminContentLoading />
}

// Cấu hình metadata cho trang admin
export const metadata = {
  title: {
    default: 'Admin Dashboard - VinBet',
    template: '%s | Admin - VinBet'
  },
  description: 'Quản trị hệ thống VinBet',
  applicationName: 'VinBet Admin',
  colorScheme: 'light dark'
}
