// src/components/admin/profile/AdminSessionsList.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { Loader2, Smartphone, Laptop, Monitor, LogOut } from 'lucide-react'
import { useAdminSessionsQuery, useLogoutSessionMutation } from '@/hooks/queries/useAdminProfileQueries'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { formatDate } from '@/utils/formatUtils'

export function AdminSessionsList() {
  const { data, isLoading } = useAdminSessionsQuery()
  const logoutSessionMutation = useLogoutSessionMutation()
  const [sessionToLogout, setSessionToLogout] = useState(null)

  const handleLogout = async () => {
    if (!sessionToLogout) return

    try {
      await logoutSessionMutation.mutateAsync(sessionToLogout.id)
      toast.success('Phiên đăng nhập đã bị đóng')
      setSessionToLogout(null)
    } catch (error) {
      toast.error('Không thể đăng xuất khỏi phiên')
      console.error(error)
    }
  }

  const getDeviceIcon = device => {
    if (device.includes('Mobile') || device.includes('iPhone') || device.includes('Android')) {
      return <Smartphone className='h-4 w-4' />
    } else if (device.includes('Mac') || device.includes('Windows') || device.includes('Linux')) {
      return <Laptop className='h-4 w-4' />
    } else {
      return <Monitor className='h-4 w-4' />
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-6 w-6 animate-spin' />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className='py-4 text-center text-muted-foreground'>Không có dữ liệu phiên đăng nhập</div>
  }

  return (
    <div className='space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thiết bị</TableHead>
            <TableHead>IP & Vị trí</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className='text-right'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(session => (
            <TableRow key={session.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  {getDeviceIcon(session.device)}
                  <div>
                    <p className='font-medium'>{session.device}</p>
                    <p className='text-sm text-muted-foreground'>{session.browser}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p>{session.ip}</p>
                <p className='text-sm text-muted-foreground'>{session.location}</p>
              </TableCell>
              <TableCell>{formatDate(session.time, 'HH:mm, dd/MM/yyyy')}</TableCell>
              <TableCell>
                {session.current ? (
                  <Badge className='bg-green-500'>Hiện tại</Badge>
                ) : (
                  <Badge variant='outline'>Hoạt động</Badge>
                )}
              </TableCell>
              <TableCell className='text-right'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setSessionToLogout(session)}
                      disabled={session.current || logoutSessionMutation.isPending}
                    >
                      <LogOut className='h-4 w-4' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Đăng xuất thiết bị</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn đăng xuất khỏi thiết bị này? Người dùng sẽ cần đăng nhập lại để truy cập
                        vào hệ thống.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setSessionToLogout(null)}>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className='bg-destructive text-destructive-foreground'>
                        {logoutSessionMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Đăng xuất
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
