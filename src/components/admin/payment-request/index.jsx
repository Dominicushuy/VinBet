// src/components/admin/payment-request/index.jsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { format } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAdminPaymentRequestsQuery } from '@/hooks/queries/useAdminQueries'
import { PaymentRequestDetail } from './PaymentRequestDetail'
import { PaymentFilterTabs } from './list/PaymentFilterTabs'
import { PaymentFilterPopover } from './list/PaymentFilterPopover'
import { PaymentSearchBar } from './list/PaymentSearchBar'
import { PaymentRequestsTable } from './list/PaymentRequestsTable'
import { PaymentRequestHeader } from './list/PaymentRequestHeader'
import { PaymentRequestEmptyState } from './list/PaymentRequestEmptyState'
import { PaymentRequestsTableSkeleton } from './list/PaymentRequestsTableSkeleton'

export function AdminPaymentRequestsManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedType, setSelectedType] = useState('deposit')

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam) {
      setSelectedType(typeParam)
    }
  }, [searchParams])

  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState([{ id: 'created_at', desc: true }])
  const [columnFilters, setColumnFilters] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState({})

  const { data, isLoading, refetch } = useAdminPaymentRequestsQuery({
    type: selectedType,
    status: selectedStatus,
    page,
    pageSize,
    startDate: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  })

  const paymentRequests = data?.paymentRequests || []
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  }

  const handleViewDetail = useCallback(request => {
    setSelectedRequest(request)
    setDetailDialogOpen(true)
  }, [])

  const handleSearch = useCallback(term => {
    setColumnFilters(prev => {
      // Remove existing profiles filter if it exists
      const filtered = prev.filter(filter => filter.id !== 'profiles')

      // Add new filter if term is not empty
      if (term) {
        return [...filtered, { id: 'profiles', value: term }]
      }

      return filtered
    })
    setPage(1) // Reset to first page when searching
  }, [])

  const handleFilterChange = useCallback((type, status) => {
    // Remove the conditional checks to allow setting to undefined
    if (type !== undefined || type === undefined) setSelectedType(type)
    if (status !== undefined || status === undefined) setSelectedStatus(status)
    setPage(1) // Reset to first page when changing filters
  }, [])

  const handlePageChange = useCallback(newPage => {
    setPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback(newPageSize => {
    setPageSize(Number(newPageSize))
    setPage(1) // Reset to first page when changing page size
  }, [])

  const handleResetFilters = useCallback(() => {
    setColumnFilters([])
    setDateRange({})
    setPage(1)
  }, [])

  return (
    <div className='space-y-6'>
      <PaymentRequestHeader onRefresh={refetch} />

      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <CardTitle>Yêu cầu thanh toán</CardTitle>
              <CardDescription>Danh sách các yêu cầu nạp/rút tiền của người dùng</CardDescription>
            </div>

            <PaymentFilterPopover dateRange={dateRange} setDateRange={setDateRange} onReset={handleResetFilters} />
          </div>
        </CardHeader>
        <CardContent>
          <PaymentFilterTabs
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            onFilterChange={handleFilterChange}
          />

          <PaymentSearchBar onSearch={handleSearch} pageSize={pageSize} onPageSizeChange={handlePageSizeChange} />

          {isLoading ? (
            <PaymentRequestsTableSkeleton />
          ) : paymentRequests.length > 0 ? (
            <PaymentRequestsTable
              requests={paymentRequests}
              sorting={sorting}
              onSortingChange={setSorting}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              onViewDetail={handleViewDetail}
              pagination={pagination}
              onPageChange={handlePageChange}
              router={router}
            />
          ) : (
            <PaymentRequestEmptyState />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedRequest && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Chi tiết yêu cầu thanh toán</DialogTitle>
              <DialogDescription>Xem và quản lý thông tin chi tiết yêu cầu</DialogDescription>
            </DialogHeader>
            <PaymentRequestDetail
              request={selectedRequest}
              onClose={() => setDetailDialogOpen(false)}
              onSuccess={() => {
                setDetailDialogOpen(false)
                refetch()
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
