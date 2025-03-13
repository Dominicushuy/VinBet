// src/components/profile/LoginHistory.jsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/useToast'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { LaptopIcon as Computer, Smartphone, Laptop, ExternalLink, History, AlertTriangle } from 'lucide-react'
import { fetchData, deleteData } from '@/utils/fetchUtils'

export function LoginHistory() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [loginHistory, setLoginHistory] = useState([])

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        setIsLoading(true)
        const data = await fetchData('/api/profile/activity')
        setLoginHistory(data.sessions || [])
      } catch (error) {
        console.error('Error fetching login history:', error)
        toast({
          title: 'Không thể tải lịch sử đăng nhập',
          description: 'Vui lòng thử lại sau',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoginHistory()
  }, [toast])

  const getDeviceIcon = device => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className='h-4 w-4' />
    }

    if (device.toLowerCase().includes('macbook') || device.toLowerCase().includes('laptop')) {
      return <Laptop className='h-4 w-4' />
    }

    return <Computer className='h-4 w-4' />
  }

  const handleSignOutDevice = async deviceId => {
    try {
      await deleteData(`/api/profile/activity/${deviceId}`)
      setLoginHistory(loginHistory.filter(item => item.id !== deviceId))

      toast({
        title: 'Đã đăng xuất thiết bị',
        description: 'Phiên đăng nhập đã được kết thúc trên thiết bị này',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error signing out device:', error)
      toast({
        title: 'Không thể đăng xuất thiết bị',
        description: 'Vui lòng thử lại sau',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <History className='mr-2 h-5 w-5 text-primary' />
          Lịch sử đăng nhập
        </CardTitle>
        <CardDescription>Xem và quản lý các phiên đăng nhập trên các thiết bị</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-8 w-full' />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-16 w-full' />
            ))}
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className='text-right'>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginHistory.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <div className='h-8 w-8 bg-muted rounded-full flex items-center justify-center'>
                          {getDeviceIcon(session.device)}
                        </div>
                        <div>
                          <div className='font-medium flex items-center gap-2'>
                            {session.device}
                            {session.current && (
                              <Badge
                                variant='outline'
                                className='text-xs bg-green-500/10 text-green-600 border-green-200'
                              >
                                Hiện tại
                              </Badge>
                            )}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {session.browser} • {session.ip}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{session.location}</TableCell>

                    <TableCell>
                      {formatDistanceToNow(new Date(session.time), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </TableCell>

                    <TableCell className='text-right'>
                      {session.current ? (
                        <Button variant='ghost' size='sm' disabled>
                          Phiên hiện tại
                        </Button>
                      ) : (
                        <Button variant='ghost' size='sm' onClick={() => handleSignOutDevice(session.id)}>
                          Đăng xuất
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className='mt-4 flex items-center space-x-2 rounded-md border p-3 bg-blue-500/10'>
              <AlertTriangle className='h-5 w-5 text-blue-500' />
              <div className='flex-1 text-sm'>
                <span className='font-medium'>Không nhận ra một thiết bị?</span>{' '}
                <Button variant='link' className='h-auto p-0' asChild>
                  <a href='/profile/security' className='inline-flex items-center'>
                    Đổi mật khẩu và đăng xuất tất cả
                    <ExternalLink className='ml-1 h-3 w-3' />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
