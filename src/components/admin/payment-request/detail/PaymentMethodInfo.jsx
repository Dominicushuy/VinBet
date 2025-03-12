// src/components/admin/payment-request/detail/PaymentMethodInfo.jsx
import { CreditCard } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function PaymentMethodInfo({ request }) {
  // Format the payment details
  const formatPaymentDetails = details => {
    if (!details) return 'Không có thông tin'

    try {
      const detailsObj = typeof details === 'string' ? JSON.parse(details) : details

      return (
        <div className='space-y-2'>
          {Object.entries(detailsObj).map(([key, value]) => (
            <div key={key} className='grid grid-cols-3 gap-2'>
              <span className='font-medium'>{formatDetailKey(key)}:</span>
              <span className='col-span-2'>{value}</span>
            </div>
          ))}
        </div>
      )
    } catch (e) {
      return 'Định dạng không hợp lệ'
    }
  }

  const formatDetailKey = key => {
    const mapping = {
      accountNumber: 'Số tài khoản',
      accountName: 'Tên tài khoản',
      bankName: 'Ngân hàng',
      branch: 'Chi nhánh',
      phoneNumber: 'Số điện thoại',
      cardNumber: 'Số thẻ',
      cardHolder: 'Chủ thẻ',
      expiryDate: 'Ngày hết hạn'
    }

    return mapping[key] || key
  }

  return (
    <>
      <Separator />
      <div className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <CreditCard className='h-5 w-5 text-indigo-500' />
          <h3 className='font-medium'>Phương thức thanh toán</h3>
        </div>

        <div className='grid gap-3'>
          <div className='bg-muted/50 p-3 rounded-md space-y-2'>
            <div className='text-sm text-muted-foreground'>Phương thức</div>
            <div className='font-medium'>
              {request.payment_method === 'bank_transfer'
                ? 'Chuyển khoản ngân hàng'
                : request.payment_method === 'momo'
                ? 'Ví điện tử MoMo'
                : request.payment_method === 'zalopay'
                ? 'Ví điện tử ZaloPay'
                : request.payment_method === 'card'
                ? 'Thẻ tín dụng/ghi nợ'
                : request.payment_method}
            </div>
          </div>

          <div className='bg-muted/50 p-3 rounded-md space-y-2'>
            <div className='text-sm text-muted-foreground'>Chi tiết thanh toán</div>
            <div className='text-sm'>{formatPaymentDetails(request.payment_details)}</div>
          </div>
        </div>
      </div>
    </>
  )
}
