// src/app/(admin)/admin/profile/activity/page.jsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader'
import { useAdminActivityQuery, useExportActivityLogsMutation } from '@/hooks/queries/useAdminProfileQueries'
import { formatDate } from '@/utils/formatUtils'
import { Download, Loader2, Activity, Filter } from 'lucide-react'

export default function AdminActivityPage() {
  // Filters
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [action, setAction] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Prepare query params
  const queryParams = {
    action: action || undefined,
    startDate: dateRange.from?.toISOString(),
    endDate: dateRange.to?.toISOString(),
    page,
    pageSize
  }

  // Fetch data
  const { data, isLoading } = useAdminActivityQuery(queryParams)
  const exportMutation = useExportActivityLogsMutation()

  const logs = data?.logs || []
  const pagination = data?.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 }

  // Handle export
  const handleExport = () => {
    exportMutation.mutate(queryParams)
  }

  // Get action badge style
  const getActionBadge = action => {
    const styles = {
      UPDATE_PROFILE: { variant: 'outline', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      CHANGE_PASSWORD: { variant: 'outline', className: 'bg-orange-100 text-orange-700 border-orange-200' },
      LOGOUT_SESSION: { variant: 'outline', className: 'bg-red-100 text-red-700 border-red-200' },
      LOGIN: { variant: 'outline', className: 'bg-green-100 text-green-700 border-green-200' },
      APPROVE_PAYMENT: { variant: 'outline', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      REJECT_PAYMENT: { variant: 'outline', className: 'bg-amber-100 text-amber-700 border-amber-200' },
      COMPLETE_GAME: { variant: 'outline', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
    }

    return styles[action] || { variant: 'outline', className: 'bg-gray-100 text-gray-700 border-gray-200' }
  }

  // Format action name
  const formatActionName = action => {
    const names = {
      UPDATE_PROFILE: 'Cập nhật hồ sơ',
      CHANGE_PASSWORD: 'Đổi mật khẩu',
      LOGOUT_SESSION: 'Đăng xuất phiên',
      LOGIN: 'Đăng nhập',
      APPROVE_PAYMENT: 'Duyệt thanh toán',
      REJECT_PAYMENT: 'Từ chối thanh toán',
      COMPLETE_GAME: 'Kết thúc game',
      ADJUST_BALANCE: 'Điều chỉnh số dư',
      SEND_NOTIFICATION: 'Gửi thông báo'
    }

    return names[action] || action
  }

  return (
    <>
      <AdminPageHeader
        title='Nhật ký hoạt động'
        description='Theo dõi hành động và thao tác trên hệ thống'
        actions={
          <Button variant='outline' onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Download className='h-4 w-4 mr-2' />
            )}
            Xuất dữ liệu
          </Button>
        }
      />

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Filter className='h-5 w-5 mr-2' /> Lọc nhật ký
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='w-full sm:w-64'>
              <p className='text-sm font-medium mb-2'>Loại hành động</p>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder='Tất cả hành động' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Tất cả hành động</SelectItem>
                  <SelectItem value='UPDATE_PROFILE'>Cập nhật hồ sơ</SelectItem>
                  <SelectItem value='CHANGE_PASSWORD'>Đổi mật khẩu</SelectItem>
                  <SelectItem value='LOGOUT_SESSION'>Đăng xuất phiên</SelectItem>
                  <SelectItem value='LOGIN'>Đăng nhập</SelectItem>
                  <SelectItem value='APPROVE_PAYMENT'>Duyệt thanh toán</SelectItem>
                  <SelectItem value='REJECT_PAYMENT'>Từ chối thanh toán</SelectItem>
                  <SelectItem value='COMPLETE_GAME'>Kết thúc game</SelectItem>
                  <SelectItem value='ADJUST_BALANCE'>Điều chỉnh số dư</SelectItem>
                  <SelectItem value='SEND_NOTIFICATION'>Gửi thông báo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex-1'>
              <p className='text-sm font-medium mb-2'>Khoảng thời gian</p>
              <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Activity className='h-5 w-5 mr-2' /> Danh sách hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
            </div>
          ) : logs.length === 0 ? (
            <div className='py-12 text-center text-muted-foreground'>
              <p>Không có dữ liệu hoạt động</p>
            </div>
          ) : (
            <>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hành động</TableHead>
                      <TableHead>Loại đối tượng</TableHead>
                      <TableHead>ID đối tượng</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Chi tiết</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => {
                      const badgeStyle = getActionBadge(log.action)

                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={badgeStyle.variant} className={badgeStyle.className}>
                              {formatActionName(log.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.entity_type}</TableCell>
                          <TableCell className='font-mono text-xs'>{log.entity_id?.substring(0, 8)}...</TableCell>
                          <TableCell>{formatDate(log.created_at, 'HH:mm, dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <div className='max-w-xs truncate'>
                              {log.details
                                ? typeof log.details === 'string'
                                  ? log.details
                                  : JSON.stringify(log.details)
                                : '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={setPage}
                className='mt-4'
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
