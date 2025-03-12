// src/app/(admin)/admin/payments/page.jsx
import { Suspense } from 'react'
import { AdminPaymentRequestsManagement } from '@/components/admin/payment-request'
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb'
import { PaymentRequestsSkeleton } from '@/components/admin/payment-request/PaymentRequestsSkeleton'

export const metadata = {
  title: 'Quản lý thanh toán - Admin - VinBet',
  description: 'Quản lý các yêu cầu nạp/rút tiền trên nền tảng VinBet'
}

export default function AdminPaymentsPage() {
  return (
    <div className='space-y-6'>
      <AdminBreadcrumb
        items={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Quản lý thanh toán', href: '/admin/payments', active: true }
        ]}
      />
      <Suspense fallback={<PaymentRequestsSkeleton />}>
        <AdminPaymentRequestsManagement />
      </Suspense>
    </div>
  )
}
