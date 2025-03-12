'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAdminUsersQuery } from '@/hooks/queries/useAdminQueries'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  MoreVertical,
  CheckCircle,
  Ban,
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/formatUtils'
import { UserFilters } from '@/components/admin/user/UserFilters'
import { UserBulkActions } from '@/components/admin/user/UserBulkActions'
import { UserCard } from '@/components/admin/user/UserCard'

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
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(query)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isSelectAll, setIsSelectAll] = useState(false)

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchInput(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Update query when debounced search changes
  useEffect(() => {
    if (debouncedSearchInput !== query) {
      updateFilters({ query: debouncedSearchInput, page: 1 })
    }
  }, [debouncedSearchInput, query])

  // Reset selected users when page changes
  useEffect(() => {
    setSelectedUsers([])
    setIsSelectAll(false)
  }, [page])

  const handleSearch = e => {
    e.preventDefault()
    updateFilters({ query: searchInput, page: 1 })
  }

  const updateFilters = useCallback(
    filters => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value))
        } else {
          params.delete(key)
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleSort = useCallback(
    column => {
      if (sortBy === column) {
        updateFilters({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })
      } else {
        updateFilters({ sortBy: column, sortOrder: 'asc' })
      }
    },
    [sortBy, sortOrder, updateFilters]
  )

  const handlePageChange = useCallback(
    newPage => {
      updateFilters({ page: newPage })
    },
    [updateFilters]
  )

  const handleSelectUser = useCallback(userId => {
    setSelectedUsers(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]))
  }, [])

  const handleSelectAll = useCallback(() => {
    if (isSelectAll) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
    setIsSelectAll(!isSelectAll)
  }, [isSelectAll, users])

  const handleBulkAction = useCallback(
    async action => {
      if (selectedUsers.length === 0) {
        toast.error('Vui lòng chọn ít nhất một người dùng')
        return
      }

      try {
        // Hiển thị loading toast
        const loadingToast = toast.loading(`Đang xử lý ${selectedUsers.length} người dùng...`)

        // Mapping action text to action data
        const actionData = {
          khóa: { is_blocked: true },
          'kích hoạt': { is_blocked: false },
          'gửi email': { notification: true }
        }

        // Nếu không phải action gửi email
        if (action !== 'gửi email') {
          // Thực hiện các requests song song
          await Promise.all(
            selectedUsers.map(userId =>
              fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actionData[action])
              }).then(res => {
                if (!res.ok) throw new Error(`Lỗi khi xử lý người dùng ${userId}`)
                return res.json()
              })
            )
          )
        } else {
          // Gọi API gửi email
          await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userIds: selectedUsers,
              type: 'both',
              title: 'Thông báo từ VinBet',
              content: 'Đây là thông báo từ ban quản trị VinBet.'
            })
          }).then(res => {
            if (!res.ok) throw new Error('Không thể gửi thông báo')
            return res.json()
          })
        }

        // Dismiss loading toast và hiển thị success
        toast.dismiss(loadingToast)
        toast.success(`Đã ${action} ${selectedUsers.length} người dùng`)

        // Reset state
        setSelectedUsers([])
        setIsSelectAll(false)

        // Refetch data
        refetch()
      } catch (error) {
        console.error(`Error performing bulk action:`, error)
        toast.error(`Không thể ${action} người dùng: ${error.message || 'Lỗi không xác định'}`)
      }
    },
    [selectedUsers, refetch]
  )

  const handleSingleUserAction = useCallback(
    async (userId, action) => {
      try {
        const loadingToast = toast.loading(`Đang xử lý...`)

        const actionData = {
          khóa: { is_blocked: true },
          'kích hoạt': { is_blocked: false }
        }

        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionData[action])
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Lỗi không xác định')
        }

        toast.dismiss(loadingToast)
        toast.success(`Đã ${action} người dùng thành công`)

        refetch()
      } catch (error) {
        console.error(`Error performing action:`, error)
        toast.error(`Không thể ${action} người dùng: ${error.message || 'Lỗi không xác định'}`)
      }
    },
    [refetch]
  )

  const viewUserDetails = useCallback(
    userId => {
      router.push(`/admin/users/${userId}`)
    },
    [router]
  )

  const viewUserTransactions = useCallback(
    userId => {
      router.push(`/admin/users/${userId}/transactions`)
    },
    [router]
  )

  const getSortIndicator = useCallback(
    column => {
      if (sortBy !== column) return null
      return sortOrder === 'asc' ? '↑' : '↓'
    },
    [sortBy, sortOrder]
  )

  const exportUsers = useCallback(async () => {
    try {
      const loadingToast = toast.loading('Đang chuẩn bị dữ liệu xuất...')

      const response = await fetch(`/api/admin/users/export?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Không thể xuất dữ liệu')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `vinbet-users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast.dismiss(loadingToast)
      toast.success('Xuất dữ liệu thành công')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error(`Không thể xuất dữ liệu: ${error.message || 'Lỗi không xác định'}`)
    }
  }, [searchParams])

  // Chuẩn bị filter object cho component UserFilters
  const currentFilters = useMemo(
    () => ({
      role,
      status,
      sortBy,
      sortOrder
    }),
    [role, status, sortBy, sortOrder]
  )

  // Xử lý thay đổi filter từ component UserFilters
  const handleFilterChange = useCallback(
    newFilters => {
      updateFilters({ ...newFilters, page: 1 })
    },
    [updateFilters]
  )

  // Reset filter
  const handleResetFilters = useCallback(() => {
    updateFilters({
      role: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1
    })
  }, [updateFilters])

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex flex-wrap gap-2'>
          <Button onClick={() => refetch()} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Làm mới
          </Button>

          <Button variant='outline' size='sm' onClick={exportUsers}>
            <Download className='mr-2 h-4 w-4' />
            Xuất dữ liệu
          </Button>

          <UserFilters filters={currentFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

          <UserBulkActions selectedCount={selectedUsers.length} onAction={handleBulkAction} />
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
              {/* Desktop view */}
              <div className='hidden md:block'>
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
                                <DropdownMenuItem onClick={() => viewUserTransactions(user.id)}>
                                  <BarChart2 className='mr-2 h-4 w-4' />
                                  Xem giao dịch
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.is_blocked ? (
                                  <DropdownMenuItem onClick={() => handleSingleUserAction(user.id, 'kích hoạt')}>
                                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                                    Kích hoạt tài khoản
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleSingleUserAction(user.id, 'khóa')}
                                    className='text-red-500'
                                  >
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
                  </Table>
                </div>
              </div>

              {/* Mobile view */}
              <div className='block md:hidden'>
                <div className='space-y-4'>
                  {users.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      isSelected={selectedUsers.includes(user.id)}
                      onSelect={handleSelectUser}
                      onViewDetails={viewUserDetails}
                      onViewTransactions={viewUserTransactions}
                      onBlockUser={userId => handleSingleUserAction(userId, 'khóa')}
                      onActivateUser={userId => handleSingleUserAction(userId, 'kích hoạt')}
                    />
                  ))}
                </div>
              </div>

              <div className='flex items-center justify-between mt-4'>
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
