// src/components/admin/PaymentRequestsManagement.tsx
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaymentRequestDetail } from './PaymentRequestDetail'
import { useAdminPaymentRequestsQuery } from '@/hooks/queries/useAdminQueries'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  RefreshCw,
  ChevronDown,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Calendar
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function PaymentRequestsManagement() {
  const router = useRouter()
  const [selectedType, setSelectedType] = (useState < 'deposit') | 'withdrawal' | (undefined > 'deposit')
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState([{ id: 'created_at', desc: true }])
  const [columnFilters, setColumnFilters] = useState([])
  const [selectedRequest, setSelectedRequest] = (useState < PaymentRequest) | (null > null)
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

  // Format tiền Việt Nam
  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const columns = [
    {
      accessorKey: 'profiles',
      header: 'Người dùng',
      cell: ({ row }) => {
        const profiles = row.getValue('profiles')
        return (
          <div className='flex items-center gap-2'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={profiles?.avatar_url || ''} />
              <AvatarFallback>{(profiles?.display_name || profiles?.username || 'U')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
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
      cell: ({ row }) => formatMoney(row.getValue('amount'))
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <PaymentStatusBadge status={row.getValue('status')} />
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const payment = row.original
        return (
          <div className='flex space-x-2'>
            <Button variant='outline' size='sm' onClick={() => handleViewDetail(payment)}>
              <Eye className='h-4 w-4' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => handleViewDetail(payment)}>
                  <Eye className='mr-2 h-4 w-4' />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/users/${payment.profile_id}`)}>
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Xem người dùng
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {payment.status === 'pending' && (
                  <>
                    <DropdownMenuItem onClick={() => handleViewDetail(payment, 'approve')}>
                      <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                      <span className='text-green-500'>Phê duyệt</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetail(payment, 'reject')}>
                      <XCircle className='mr-2 h-4 w-4 text-red-500' />
                      <span className='text-red-500'>Từ chối</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
    data: paymentRequests,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex: page - 1,
        pageSize
      }
    }
  })

  const handleViewDetail = (request, action) => {
    setSelectedRequest(request)
    setDetailDialogOpen(true)
  }

  const handleSearch = term => {
    setColumnFilters(prev => {
      // Remove existing profiles filter if it exists
      const filtered = prev.filter(filter => filter.id !== 'profiles')

      // Add new filter if term is not empty
      if (term) {
        return [...filtered, { id: 'profiles', value: term }]
      }

      return filtered
    })
  }

  const handlePageChange = newPage => {
    setPage(newPage)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý thanh toán</h2>
          <p className='text-muted-foreground'>Xem và xử lý các yêu cầu nạp/rút tiền từ người dùng</p>
        </div>
        <Button onClick={() => refetch()} variant='outline'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Yêu cầu thanh toán</CardTitle>
              <CardDescription>Danh sách các yêu cầu nạp/rút tiền của người dùng</CardDescription>
            </div>

            <div className='flex items-center space-x-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' size='sm'>
                    <Filter className='mr-2 h-4 w-4' />
                    Bộ lọc
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='grid gap-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium leading-none'>Khoảng thời gian</h4>
                      <div className='flex flex-col gap-2'>
                        <div className='grid grid-cols-3 items-center gap-2'>
                          <span className='text-sm'>Từ ngày:</span>
                          <Input
                            type='date'
                            className='col-span-2'
                            onChange={e =>
                              setDateRange(prev => ({
                                ...prev,
                                from: e.target.value ? new Date(e.target.value) : undefined
                              }))
                            }
                          />
                        </div>
                        <div className='grid grid-cols-3 items-center gap-2'>
                          <span className='text-sm'>Đến ngày:</span>
                          <Input
                            type='date'
                            className='col-span-2'
                            onChange={e =>
                              setDateRange(prev => ({
                                ...prev,
                                to: e.target.value ? new Date(e.target.value) : undefined
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <Button
                        variant='outline'
                        className='justify-start'
                        onClick={() => {
                          const today = new Date()
                          setDateRange({ from: today, to: today })
                        }}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        Hôm nay
                      </Button>
                      <Button
                        variant='outline'
                        className='justify-start'
                        onClick={() => {
                          const today = new Date()
                          const yesterday = new Date(today)
                          yesterday.setDate(yesterday.getDate() - 1)
                          setDateRange({ from: yesterday, to: yesterday })
                        }}
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        Hôm qua
                      </Button>
                    </div>
                    <Button variant='outline' onClick={() => setDateRange({})}>
                      Reset thời gian
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center justify-between'>
            <Tabs
              defaultValue='deposit'
              className='w-full'
              onValueChange={value => {
                if (value === 'all') {
                  setSelectedType(undefined)
                } else {
                  setSelectedType(value)
                }
                setPage(1)
              }}
            >
              <div className='flex justify-between'>
                <TabsList>
                  <TabsTrigger value='deposit'>Nạp tiền</TabsTrigger>
                  <TabsTrigger value='withdrawal'>Rút tiền</TabsTrigger>
                  <TabsTrigger value='all'>Tất cả</TabsTrigger>
                </TabsList>

                <TabsList>
                  <TabsTrigger
                    value='pending'
                    onClick={() => {
                      setSelectedStatus('pending')
                      setPage(1)
                    }}
                  >
                    Đang xử lý
                  </TabsTrigger>
                  <TabsTrigger
                    value='approved'
                    onClick={() => {
                      setSelectedStatus('approved')
                      setPage(1)
                    }}
                  >
                    Đã duyệt
                  </TabsTrigger>
                  <TabsTrigger
                    value='rejected'
                    onClick={() => {
                      setSelectedStatus('rejected')
                      setPage(1)
                    }}
                  >
                    Từ chối
                  </TabsTrigger>
                  <TabsTrigger
                    value='all_status'
                    onClick={() => {
                      setSelectedStatus(undefined)
                      setPage(1)
                    }}
                  >
                    Tất cả
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          <div className='flex items-center py-4'>
            <div className='relative w-full max-w-sm'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Tìm theo tên, email...'
                className='pl-8'
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
            <div className='ml-auto flex items-center space-x-2'>
              <Select value={pageSize.toString()} onValueChange={value => setPageSize(Number(value))}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue placeholder='Số dòng' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='5'>5 dòng</SelectItem>
                  <SelectItem value='10'>10 dòng</SelectItem>
                  <SelectItem value='20'>20 dòng</SelectItem>
                  <SelectItem value='50'>50 dòng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className='h-8 w-full' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
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

          {table.getRowModel().rows?.length > 0 && (
            <div className='flex items-center justify-between py-4'>
              <div className='text-sm text-muted-foreground'>
                Hiển thị {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, pagination.total)}
                trong số {pagination.total} yêu cầu
              </div>
              <div className='flex items-center space-x-2'>
                <Button variant='outline' size='sm' onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  Trước
                </Button>
                <div className='flex items-center space-x-1'>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    if (pagination.totalPages <= 5 || pageNum <= 3 || pageNum > pagination.totalPages - 2) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => handlePageChange(pageNum)}
                          className='w-8 h-8 p-0'
                        >
                          {pageNum}
                        </Button>
                      )
                    } else if (pageNum === 3 && pagination.totalPages > 5) {
                      return (
                        <span key='ellipsis' className='px-2'>
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
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

function PaymentStatusBadge({ status }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant='outline' className='bg-yellow-100 text-yellow-800'>
          Đang xử lý
        </Badge>
      )
    case 'approved':
      return <Badge className='bg-green-100 text-green-800'>Đã duyệt</Badge>
    case 'rejected':
      return <Badge variant='destructive'>Từ chối</Badge>
    case 'cancelled':
      return (
        <Badge variant='outline' className='bg-gray-100 text-gray-800'>
          Đã hủy
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

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
