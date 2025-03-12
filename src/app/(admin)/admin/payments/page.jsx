// src/app/(admin)/admin/payments/page.tsx
import { Suspense } from 'react'
import { PaymentRequestsManagement } from '@/components/admin/payment-request'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'

export const metadata = {
  title: 'Quản lý thanh toán - Admin - VinBet',
  description: 'Quản lý các yêu cầu nạp/rút tiền trên nền tảng VinBet'
}

export default function AdminPaymentsPage() {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb />
      <Suspense fallback={<PaymentRequestsSkeleton />}>
        <PaymentRequestsManagement />
      </Suspense>
    </div>
  )
}

function PaymentRequestsSkeleton() {
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
