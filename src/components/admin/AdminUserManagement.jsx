'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAdminUsersQuery } from '@/hooks/queries/useAdminQueries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  RefreshCw,
  UserCog,
  ArrowUpDown,
  AlertCircle,
  Download,
  Filter,
  MoreVertical,
  CheckCircle,
  Ban,
  Mail,
  BarChart2
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export function AdminUserManagement() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('query') || ''
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 10)
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const role = searchParams.get('role') || ''
  const status = searchParams.get('status') || ''

  const [searchInput, setSearchInput] = useState(query)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false)

  const { data, isLoading, error, refetch } = useAdminUsersQuery({
    query,
    page,
    pageSize,
    sortBy,
    sortOrder,
    role,
    status
  })

  const users = (data && data.users) || []
  const pagination = (data && data.pagination) || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  }

  // Reset selected users when page changes
  useEffect(() => {
    setSelectedUsers([])
    setIsSelectAll(false)
  }, [page])

  const handleSearch = e => {
    e.preventDefault()
    updateFilters({ query: searchInput, page: 1 })
  }

  const handleSort = column => {
    if (sortBy === column) {
      updateFilters({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      updateFilters({ sortBy: column, sortOrder: 'asc' })
    }
  }

  const updateFilters = filters => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = newPage => {
    updateFilters({ page: newPage })
  }

  const handleSelectUser = userId => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
    setIsSelectAll(!isSelectAll)
  }

  const handleBulkAction = action => {
    if (selectedUsers.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người dùng')
      return
    }

    // Giả định gọi API để thực hiện hành động hàng loạt
    toast.success(`Đã ${action} ${selectedUsers.length} người dùng`)
    setSelectedUsers([])
    setIsSelectAll(false)
    setIsBulkActionOpen(false)
    // Refetch để cập nhật dữ liệu
    setTimeout(() => refetch(), 1000)
  }

  const viewUserDetails = userId => {
    router.push(`/admin/users/${userId}`)
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getSortIndicator = column => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const exportUsers = () => {
    // Giả định tính năng xuất dữ liệu
    toast.success('Đang xuất dữ liệu người dùng')
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý người dùng</h2>
          <p className='text-muted-foreground'>Quản lý danh sách người dùng trên hệ thống VinBet</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button onClick={() => refetch()} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Làm mới
          </Button>

          <Button variant='outline' size='sm' onClick={exportUsers}>
            <Download className='mr-2 h-4 w-4' />
            Xuất dữ liệu
          </Button>

          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' size='sm'>
                <Filter className='mr-2 h-4 w-4' />
                Bộ lọc
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bộ lọc người dùng</DialogTitle>
                <DialogDescription>Điều chỉnh các bộ lọc để tìm kiếm người dùng</DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <label htmlFor='role' className='text-right'>
                    Vai trò
                  </label>
                  <Select defaultValue={role} onValueChange={value => updateFilters({ role: value, page: 1 })}>
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='Tất cả vai trò' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>Tất cả vai trò</SelectItem>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='user'>Người dùng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <label htmlFor='status' className='text-right'>
                    Trạng thái
                  </label>
                  <Select defaultValue={status} onValueChange={value => updateFilters({ status: value, page: 1 })}>
                    <SelectTrigger className='col-span-3'>
                      <SelectValue placeholder='Tất cả trạng thái' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>Tất cả trạng thái</SelectItem>
                      <SelectItem value='active'>Hoạt động</SelectItem>
                      <SelectItem value='blocked'>Đã khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <label htmlFor='sort' className='text-right'>
                    Sắp xếp theo
                  </label>
                  <div className='col-span-3 flex gap-2'>
                    <Select defaultValue={sortBy} onValueChange={value => updateFilters({ sortBy: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder='Sắp xếp theo' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='created_at'>Ngày đăng ký</SelectItem>
                        <SelectItem value='username'>Tên người dùng</SelectItem>
                        <SelectItem value='balance'>Số dư</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue={sortOrder} onValueChange={value => updateFilters({ sortOrder: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder='Thứ tự' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='asc'>Tăng dần</SelectItem>
                        <SelectItem value='desc'>Giảm dần</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => {
                    updateFilters({ role: '', status: '' })
                    setIsFilterDialogOpen(false)
                  }}
                >
                  Reset
                </Button>
                <Button onClick={() => setIsFilterDialogOpen(false)}>Áp dụng</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
            <DialogTrigger asChild>
              <Button variant='default' size='sm' disabled={selectedUsers.length === 0}>
                Hành động ({selectedUsers.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thực hiện hành động hàng loạt</DialogTitle>
                <DialogDescription>Áp dụng hành động cho {selectedUsers.length} người dùng đã chọn</DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 py-4'>
                <Button variant='outline' className='justify-start' onClick={() => handleBulkAction('gửi email')}>
                  <Mail className='mr-2 h-4 w-4' />
                  Gửi email thông báo
                </Button>
                <Button variant='outline' className='justify-start' onClick={() => handleBulkAction('kích hoạt')}>
                  <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                  Kích hoạt tài khoản
                </Button>
                <Button
                  variant='outline'
                  className='justify-start text-red-500'
                  onClick={() => handleBulkAction('khóa')}
                >
                  <Ban className='mr-2 h-4 w-4' />
                  Khóa tài khoản
                </Button>
              </div>

              <DialogFooter>
                <Button variant='outline' onClick={() => setIsBulkActionOpen(false)}>
                  Hủy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>
            {pagination.total > 0
              ? `Hiển thị ${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, pagination.total)} của ${
                  pagination.total
                } người dùng`
              : 'Không có người dùng'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className='mb-6 flex gap-2'>
            <Input
              placeholder='Tìm kiếm theo tên, email, số điện thoại...'
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className='flex-1'
            />
            <Button type='submit'>
              <Search className='mr-2 h-4 w-4' />
              Tìm kiếm
            </Button>
          </form>

          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-7 gap-4'>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className='h-4' />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='grid grid-cols-7 gap-4'>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className='h-10' />
                  ))}
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-muted-foreground'>Không tìm thấy người dùng nào.</p>
            </div>
          ) : (
            <div>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>
                        <Checkbox checked={isSelectAll} onCheckedChange={handleSelectAll} aria-label='Select all' />
                      </TableHead>
                      <TableHead>
                        <div
                          className='flex items-center space-x-1 cursor-pointer'
                          onClick={() => handleSort('username')}
                        >
                          <span>Thông tin</span>
                          <ArrowUpDown className='h-3 w-3' />
                          {getSortIndicator('username')}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className='flex items-center space-x-1 cursor-pointer'
                          onClick={() => handleSort('balance')}
                        >
                          <span>Số dư</span>
                          <ArrowUpDown className='h-3 w-3' />
                          {getSortIndicator('balance')}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className='flex items-center space-x-1 cursor-pointer'
                          onClick={() => handleSort('is_admin')}
                        >
                          <span>Trạng thái</span>
                          <ArrowUpDown className='h-3 w-3' />
                          {getSortIndicator('is_admin')}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className='flex items-center space-x-1 cursor-pointer'
                          onClick={() => handleSort('created_at')}
                        >
                          <span>Ngày đăng ký</span>
                          <ArrowUpDown className='h-3 w-3' />
                          {getSortIndicator('created_at')}
                        </div>
                      </TableHead>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Select ${user.username}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-9 w-9'>
                              <AvatarImage src={user.avatar_url || ''} />
                              <AvatarFallback>
                                {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{user.display_name || user.username}</div>
                              <div className='text-xs text-muted-foreground'>{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(user.balance || 0)}</TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            {user.is_admin && (
                              <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
                                Admin
                              </Badge>
                            )}
                            {user.is_blocked && <Badge variant='destructive'>Đã khóa</Badge>}
                            {!user.is_blocked && !user.is_admin && (
                              <Badge
                                variant='outline'
                                className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              >
                                Hoạt động
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center space-x-2'>
                            <span className='flex h-2 w-2 rounded-full bg-green-500' />
                            <span className='text-xs'>
                              {user.last_active ? `${format(new Date(user.last_active), 'HH:mm')}` : 'Offline'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => viewUserDetails(user.id)}>
                                <UserCog className='mr-2 h-4 w-4' />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/transactions`)}>
                                <BarChart2 className='mr-2 h-4 w-4' />
                                Xem giao dịch
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.is_blocked ? (
                                <DropdownMenuItem onClick={() => handleBulkAction('kích hoạt')}>
                                  <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                                  Kích hoạt tài khoản
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleBulkAction('khóa')} className='text-red-500'>
                                  <Ban className='mr-2 h-4 w-4' />
                                  Khóa tài khoản
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className='flex items-center justify-between'>
                          <div className='text-sm text-muted-foreground'>
                            Đã chọn {selectedUsers.length} trong số {pagination.total} người dùng
                          </div>

                          <Select
                            value={pageSize.toString()}
                            onValueChange={value => updateFilters({ pageSize: value, page: 1 })}
                          >
                            <SelectTrigger className='w-[120px]'>
                              <SelectValue placeholder='10 mỗi trang' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='10'>10 mỗi trang</SelectItem>
                              <SelectItem value='20'>20 mỗi trang</SelectItem>
                              <SelectItem value='50'>50 mỗi trang</SelectItem>
                              <SelectItem value='100'>100 mỗi trang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className='mt-4 flex justify-center'>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
