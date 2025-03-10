'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAdminUsersQuery } from '@/hooks/queries/useAdminQueries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { format } from 'date-fns'
import { Profile } from '@/types/database'

export function UserManagement() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('query') || ''
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 10)
  const sortBy = searchParams.get('sortBy') || 'created_at'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const [searchInput, setSearchInput] = useState(query)

  const { data, isLoading, error, refetch } = useAdminUsersQuery({
    query,
    page,
    pageSize,
    sortBy,
    sortOrder,
  })

  const users = data?.users || []
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ query: searchInput, page: 1 })
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      updateFilters({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      updateFilters({ sortBy: column, sortOrder: 'asc' })
    }
  }

  const updateFilters = (filters: Record<string, any>) => {
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

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage })
  }

  const viewUserDetails = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Quản lý người dùng
        </h2>
        <Button onClick={() => refetch()} variant='outline'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className='mb-6 flex gap-2'>
            <Input
              placeholder='Tìm kiếm theo tên, email...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-6 gap-4'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className='h-4' />
                ))}
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='grid grid-cols-6 gap-4'>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className='h-10' />
                  ))}
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-muted-foreground'>
                Không tìm thấy người dùng nào.
              </p>
            </div>
          ) : (
            <div>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className='flex items-center space-x-1'>
                          <span>Thông tin</span>
                          <ArrowUpDown
                            className='h-3 w-3 cursor-pointer'
                            onClick={() => handleSort('username')}
                          />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center space-x-1'>
                          <span>Số dư</span>
                          <ArrowUpDown
                            className='h-3 w-3 cursor-pointer'
                            onClick={() => handleSort('balance')}
                          />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center space-x-1'>
                          <span>Trạng thái</span>
                          <ArrowUpDown
                            className='h-3 w-3 cursor-pointer'
                            onClick={() => handleSort('is_admin')}
                          />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className='flex items-center space-x-1'>
                          <span>Ngày đăng ký</span>
                          <ArrowUpDown
                            className='h-3 w-3 cursor-pointer'
                            onClick={() => handleSort('created_at')}
                          />
                        </div>
                      </TableHead>
                      <TableHead className='text-right'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: Profile) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <Avatar className='h-9 w-9'>
                              <AvatarImage src={user.avatar_url || ''} />
                              <AvatarFallback>
                                {user.display_name?.[0] ||
                                  user.username?.[0] ||
                                  'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>
                                {user.display_name || user.username}
                              </div>
                              <div className='text-xs text-muted-foreground'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(user.balance || 0)}
                        </TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            {user.is_admin && (
                              <Badge variant='outline' className='bg-blue-100'>
                                Admin
                              </Badge>
                            )}
                            {user.is_blocked && (
                              <Badge variant='destructive'>Đã khóa</Badge>
                            )}
                            {!user.is_blocked && !user.is_admin && (
                              <Badge variant='outline' className='bg-green-100'>
                                Hoạt động
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.created_at
                            ? format(new Date(user.created_at), 'dd/MM/yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => viewUserDetails(user.id)}>
                            <UserCog className='mr-2 h-4 w-4' />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.totalPages > 1 && (
                <div className='mt-4'>
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
