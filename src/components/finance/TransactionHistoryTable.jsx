'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { TransactionDetailModal } from '@/components/finance/TransactionDetailModal'
import { Skeleton } from '@/components/ui/skeleton'
import { useTransactionsQuery } from '@/hooks/queries/useTransactionQueries'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Award,
  DollarSign,
  EyeIcon,
  Filter,
  Loader2,
  SortAsc,
  SortDesc
} from 'lucide-react'

export function TransactionHistoryTable({ initialData, filters, currentPage, onPageChange }) {
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState({
    key: filters.sortBy || 'created_at',
    direction: filters.sortOrder || 'desc'
  })

  // Fetch transactions using React Query
  const { data, isLoading, error } = useTransactionsQuery({
    ...filters,
    page: currentPage,
    pageSize: 15,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction
  })

  const transactions = (data && data.transactions) || initialData
  const pagination = data?.pagination || {
    total: initialData.length,
    page: 1,
    pageSize: 15,
    totalPages: 1
  }

  // Handle sorting change
  const handleSortChange = key => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Format money
  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // View transaction details
  const handleViewDetails = transaction => {
    setSelectedTransaction(transaction)
    setIsDetailModalOpen(true)
  }

  // Render transaction type badge and icon
  const renderTransactionType = type => {
    switch (type) {
      case 'deposit':
        return (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center'>
              <ArrowUpRight className='h-4 w-4 text-green-600' />
            </div>
            <Badge variant='outline' className='bg-green-100 text-green-800 border-green-200'>
              Nạp tiền
            </Badge>
          </div>
        )
      case 'withdrawal':
        return (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-red-100 flex items-center justify-center'>
              <ArrowDownRight className='h-4 w-4 text-red-600' />
            </div>
            <Badge variant='outline' className='bg-red-100 text-red-800 border-red-200'>
              Rút tiền
            </Badge>
          </div>
        )
      case 'bet':
        return (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center'>
              <DollarSign className='h-4 w-4 text-blue-600' />
            </div>
            <Badge variant='outline' className='bg-blue-100 text-blue-800 border-blue-200'>
              Đặt cược
            </Badge>
          </div>
        )
      case 'win':
        return (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center'>
              <Award className='h-4 w-4 text-amber-600' />
            </div>
            <Badge variant='outline' className='bg-amber-100 text-amber-800 border-amber-200'>
              Thắng cược
            </Badge>
          </div>
        )
      case 'referral_reward':
        return (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center'>
              <Award className='h-4 w-4 text-purple-600' />
            </div>
            <Badge variant='outline' className='bg-purple-100 text-purple-800 border-purple-200'>
              Thưởng giới thiệu
            </Badge>
          </div>
        )
      default:
        return (
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center'>
              <DollarSign className='h-4 w-4 text-gray-600' />
            </div>
            <Badge variant='outline'>{type}</Badge>
          </div>
        )
    }
  }

  // Render transaction status badge
  const renderTransactionStatus = status => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant='outline' className='bg-green-100 text-green-800 border-green-200'>
            Hoàn thành
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            Đang xử lý
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant='outline' className='bg-red-100 text-red-800 border-red-200'>
            Thất bại
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant='outline' className='bg-gray-100 text-gray-800 border-gray-200'>
            Đã hủy
          </Badge>
        )
      default:
        return <Badge variant='outline'>{status}</Badge>
    }
  }

  // Render amount with color based on transaction type
  const renderAmount = (amount, type) => {
    const isPositive = type === 'deposit' || type === 'win' || type === 'referral_reward'
    const textColor = isPositive ? 'text-green-600' : 'text-red-600'
    const prefix = isPositive ? '+' : '-'

    return (
      <span className={`font-medium ${textColor}`}>
        {prefix} {formatMoney(Math.abs(amount))}
      </span>
    )
  }

  // Generate a sort button with indicator
  const SortButton = ({ column }) => {
    const isSorted = sortConfig.key === column
    const direction = sortConfig.direction

    return (
      <Button variant='ghost' size='sm' className='h-8 gap-1 -ml-3' onClick={() => handleSortChange(column)}>
        {isSorted ? (
          direction === 'asc' ? (
            <SortAsc className='h-3.5 w-3.5' />
          ) : (
            <SortDesc className='h-3.5 w-3.5' />
          )
        ) : (
          <Filter className='h-3.5 w-3.5' />
        )}
      </Button>
    )
  }

  // Empty state
  if (!isLoading && transactions.length === 0) {
    return (
      <div className='p-8 text-center'>
        <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
          <DollarSign className='h-10 w-10 text-muted-foreground' />
        </div>
        <h3 className='mt-4 text-lg font-semibold'>Không có giao dịch nào</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          Hiện tại bạn chưa có giao dịch nào hoặc không có giao dịch nào phù hợp với bộ lọc.
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading && !data) {
    return (
      <div className='px-6 py-4'>
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='flex items-center justify-between space-x-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-32' />
              </div>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-8 w-8 rounded-full' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='p-8 text-center'>
        <p className='text-red-500'>Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</p>
        <Button variant='outline' className='mt-4' onClick={() => window.location.reload()}>
          Tải lại trang
        </Button>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[180px]'>
                <div className='flex items-center'>
                  Thời gian <SortButton column='created_at' />
                </div>
              </TableHead>
              <TableHead>Loại giao dịch</TableHead>
              <TableHead>
                <div className='flex items-center'>
                  Số tiền <SortButton column='amount' />
                </div>
              </TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className='text-right'>Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction.id} className='group hover:bg-muted/50'>
                <TableCell className='font-medium'>
                  <div className='flex flex-col'>
                    <span>
                      {format(new Date(transaction.created_at), 'HH:mm', {
                        locale: vi
                      })}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(transaction.created_at), 'dd/MM/yyyy', {
                        locale: vi
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{renderTransactionType(transaction.type)}</TableCell>
                <TableCell>{renderAmount(transaction.amount, transaction.type)}</TableCell>
                <TableCell>{renderTransactionStatus(transaction.status)}</TableCell>
                <TableCell className='max-w-[200px]'>
                  <p className='truncate text-sm'>{transaction.description || '-'}</p>
                </TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='sm' onClick={() => handleViewDetails(transaction)}>
                    <EyeIcon className='h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between px-2 py-4'>
          <div className='text-sm text-muted-foreground'>
            Hiển thị {(pagination.page - 1) * pagination.pageSize + 1} đến{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} trong {pagination.total} giao dịch
          </div>
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  )
}
