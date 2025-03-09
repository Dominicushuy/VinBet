"use client";

import { PaymentRequestList } from "./PaymentRequestList";

interface WithdrawalHistoryProps {
  initialData?: any;
}

export function WithdrawalHistory({ initialData }: WithdrawalHistoryProps) {
  return <PaymentRequestList type="withdrawal" initialData={initialData} />;
}
