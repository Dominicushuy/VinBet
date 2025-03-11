'use client'

import { PaymentRequestList } from './PaymentRequestList'

export function WithdrawalHistory({ initialData }) {
  return <PaymentRequestList type='withdrawal' initialData={initialData} />
}
