// src/components/finance/PaymentRequestList.jsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePaymentRequestsQuery } from '@/hooks/queries/useFinanceQueries'
import { PaymentStatus } from './PaymentStatus'
import { Loader2, RefreshCw } from 'lucide-react'
import { Pagination } from '../ui/pagination'
import { formatCurrency } from '@/utils/formatUtils'

export function PaymentRequestList({ type = 'deposit', initialData }) {
  const [status, setStatus] = useState(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, refetch } = usePaymentRequestsQuery({
    type,
    status,
    page,
    pageSize
  })

  const paymentRequests = data?.paymentRequests ?? initialData?.paymentRequests ?? []
  const pagination = data?.pagination ??
    initialData?.pagination ?? {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    }

  const handlePageChange = newPage => {
    setPage(newPage)
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle>{type === 'deposit' ? 'Lịch sử nạp tiền' : 'Lịch sử rút tiền'}</CardTitle>
          <CardDescription>Các yêu cầu {type === 'deposit' ? 'nạp' : 'rút'} tiền của bạn</CardDescription>
        </div>
        <Button
          variant='outline'
          size='sm'
          className='ml-auto h-8 gap-1'
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Làm mới</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue='all'
          className='w-full'
          onValueChange={value => setStatus(value === 'all' ? undefined : value)}
        >
          <TabsList className='mb-4 grid w-full grid-cols-4'>
            <TabsTrigger value='all'>Tất cả</TabsTrigger>
            <TabsTrigger value='pending'>Đang xử lý</TabsTrigger>
            <TabsTrigger value='approved'>Đã duyệt</TabsTrigger>
            <TabsTrigger value='rejected'>Đã từ chối</TabsTrigger>
          </TabsList>

          <TabsContent value='all'>
            <PaymentRequestTable paymentRequests={paymentRequests} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value='pending'>
            <PaymentRequestTable paymentRequests={paymentRequests} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value='approved'>
            <PaymentRequestTable paymentRequests={paymentRequests} isLoading={isLoading} />
          </TabsContent>
          <TabsContent value='rejected'>
            <PaymentRequestTable paymentRequests={paymentRequests} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {pagination.totalPages > 1 && (
          <div className='mt-4'>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PaymentRequestTable({ paymentRequests, isLoading }) {
  if (isLoading) {
    return (
      <div className='flex justify-center py-6'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (paymentRequests.length === 0) {
    return (
      <div className='text-center py-6'>
        <p className='text-muted-foreground'>Không có yêu cầu nào.</p>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentRequests.map(request => (
            <TableRow key={request.id}>
              <TableCell className='font-medium'>
                {request.created_at
                  ? format(new Date(request.created_at), 'HH:mm, dd/MM/yyyy', {
                      locale: vi
                    })
                  : 'N/A'}
              </TableCell>
              <TableCell>{formatPaymentMethod(request.payment_method)}</TableCell>
              <TableCell>{formatCurrency(request.amount)}</TableCell>
              <TableCell>
                <PaymentStatus status={request.status} />
              </TableCell>
              <TableCell>
                <span className='text-xs text-muted-foreground'>{request.notes || '-'}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Helper function to format payment method
function formatPaymentMethod(method) {
  switch (method) {
    case 'bank_transfer':
      return 'Chuyển khoản'
    case 'momo':
      return 'MoMo'
    case 'zalopay':
      return 'ZaloPay'
    case 'card':
      return 'Thẻ tín dụng'
    default:
      return method
  }
}
