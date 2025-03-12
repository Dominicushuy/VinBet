// src/components/admin/payment-request/list/PaymentRequestsTable.jsx
import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { formatCurrency } from '@/utils/formatUtils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { PaymentRowActions } from './PaymentRowActions'

export function PaymentRequestsTable({
  requests,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  onViewDetail,
  pagination,
  onPageChange,
  router
}) {
  // Define columns with their rendering logic
  const columns = useMemo(
    () => [
      {
        accessorKey: 'profiles',
        header: 'Người dùng',
        cell: ({ row }) => {
          const profiles = row.getValue('profiles')
          return (
            <div className='flex items-center gap-2'>
              <UserAvatar user={profiles} />
              <div>
                <p className='font-medium'>{profiles?.display_name || profiles?.username}</p>
                <p className='text-xs text-muted-foreground'>{profiles?.email}</p>
              </div>
            </div>
          )
        },
        filterFn: (row, id, value) => {
          const profiles = row.getValue(id)
          return (
            profiles?.display_name?.toLowerCase().includes(value.toLowerCase()) ||
            profiles?.username?.toLowerCase().includes(value.toLowerCase()) ||
            profiles?.email?.toLowerCase().includes(value.toLowerCase())
          )
        }
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Thời gian
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        cell: ({ row }) => {
          return format(new Date(row.getValue('created_at')), 'HH:mm, dd/MM/yyyy', { locale: vi })
        }
      },
      {
        accessorKey: 'payment_method',
        header: 'Phương thức',
        cell: ({ row }) => formatPaymentMethod(row.getValue('payment_method'))
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Số tiền
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          )
        },
        cell: ({ row }) => formatCurrency(row.getValue('amount'))
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <PaymentStatusBadge status={row.getValue('status')} />
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <PaymentRowActions
            payment={row.original}
            onViewDetail={onViewDetail}
            onViewUser={() => router.push(`/admin/users/${row.original.profile_id}`)}
          />
        )
      }
    ],
    [onViewDetail, router]
  )

  const table = useReactTable({
    data: requests,
    columns,
    onSortingChange,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  })

  return (
    <div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {requests.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  )
}

// Export helper functions for reuse
export function formatPaymentMethod(method) {
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
