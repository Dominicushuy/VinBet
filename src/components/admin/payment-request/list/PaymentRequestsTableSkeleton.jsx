// src/components/admin/payment-request/list/PaymentRequestsTableSkeleton.jsx
import { TableRow, TableCell, Table, TableHeader, TableHead, TableBody } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export function PaymentRequestsTableSkeleton() {
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className='h-8 w-full' />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
