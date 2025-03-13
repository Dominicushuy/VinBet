import { redirect } from 'next/navigation'
import { checkAdminAuth } from '@/middleware/adminAuth'
import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminFooter } from '@/components/admin/layout/AdminFooter'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import AdminErrorFallback from '@/components/admin/layout/AdminErrorFallback'

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
  try {
    // Sử dụng middleware để kiểm tra quyền admin
    const { redirect: redirectInfo, userProfile } = await checkAdminAuth()

    // Nếu không có quyền, chuyển hướng
    if (redirectInfo) {
      redirect(redirectInfo.destination)
    }

    // Nếu có userProfile, render layout
    return (
      <div className='flex min-h-screen flex-col'>
        <AdminHeader userProfile={userProfile || {}} />

        <div className='flex-1'>
          <div className='max-w-screen-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-[288px_1fr]'>
              <AdminSidebar />

              <main className='w-full overflow-hidden'>
                <ErrorBoundary fallback={AdminErrorFallback}>
                  <div className='bg-background rounded-xl p-4 sm:p-6 shadow-sm border overflow-hidden'>
                    <Suspense fallback={<AdminContentLoading />}>{children}</Suspense>
                  </div>
                </ErrorBoundary>
              </main>
            </div>
          </div>
        </div>

        <AdminFooter />
      </div>
    )
  } catch (error) {
    console.error('Admin layout error:', error)
    redirect('/login')
  }
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
