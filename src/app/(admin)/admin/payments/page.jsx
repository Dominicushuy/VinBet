// src/app/(admin)/admin/payments/page.jsx
import { PaymentRequestsManagement } from '@/components/admin/PaymentRequestsManagement'

export const metadata = {
  title: 'Quản lý thanh toán - Admin - VinBet',
  description: 'Quản lý các yêu cầu nạp/rút tiền trên nền tảng VinBet',
}

export default function AdminPaymentsPage() {
  return (
    <div className='space-y-6'>
      <PaymentRequestsManagement />
    </div>
  )
}
