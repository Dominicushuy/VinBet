'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowLeft, CalendarIcon, ClockIcon, TagIcon } from 'lucide-react'
import {
  useNotificationDetailQuery,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation
} from '@/hooks/queries/useNotificationQueries'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-hot-toast'
import { getNotificationIcon, getNotificationTypeBadge, getNotificationTypeLabel } from '@/utils/notificationUtils'

export function NotificationDetail({ id }) {
  const router = useRouter()
  const { data, isLoading, error } = useNotificationDetailQuery(id)
  const markReadMutation = useMarkNotificationReadMutation()
  const deleteNotificationMutation = useDeleteNotificationMutation()
  const [hasMarkedRead, setHasMarkedRead] = useState(false)
  const isMarkingRef = useRef(false) // Add this ref to track marking state

  useEffect(() => {
    // Only run this effect once when data first loads
    const markAsRead = async () => {
      // Skip if already marking or has marked, or if notification is already read
      if (isMarkingRef.current || hasMarkedRead || !data?.notification || data.notification.is_read) {
        return
      }

      try {
        isMarkingRef.current = true // Set marking state
        await markReadMutation.mutateAsync(id)
        setHasMarkedRead(true)
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      } finally {
        isMarkingRef.current = false
      }
    }

    markAsRead()

    // No need to clean up since we're using the ref to track state
  }, [id]) // Only depend on the id, not data or the mutation

  const handleBack = () => {
    router.push('/notifications')
  }

  const handleDelete = async () => {
    try {
      await deleteNotificationMutation.mutateAsync(id)
      toast.success('Đã xóa thông báo')
      // handleBack()
    } catch (error) {
      toast.error('Không thể xóa thông báo')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center gap-3 pb-2'>
          <Button variant='ghost' size='icon' onClick={handleBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <Skeleton className='h-7 w-[250px]' />
        </CardHeader>
        <Separator />
        <CardContent className='py-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-5 w-40' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-4/5' />
            <div className='pt-4 space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-4 w-36' />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data?.notification) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center gap-3 pb-2'>
          <Button variant='ghost' size='icon' onClick={handleBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h2 className='text-xl font-semibold'>Không tìm thấy thông báo</h2>
        </CardHeader>
        <Separator />
        <CardContent className='py-12 text-center'>
          <p className='text-muted-foreground mb-4'>Thông báo này không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={handleBack}>Quay lại danh sách thông báo</Button>
        </CardContent>
      </Card>
    )
  }

  const notification = data.notification
  const createdDate = new Date(notification.created_at)

  return (
    <Card>
      <CardHeader className='flex flex-row items-center gap-3 pb-2'>
        <Button variant='ghost' size='icon' onClick={handleBack}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <h2 className='text-xl font-semibold'>{notification.title}</h2>
      </CardHeader>
      <Separator />
      <CardContent className='py-6'>
        <div className='space-y-6'>
          <div className='flex items-start gap-4'>
            <div className={`p-3 rounded-full ${getNotificationTypeBadge(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className='space-y-1'>
              <h3 className='text-lg font-medium'>{notification.title}</h3>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className={getNotificationTypeBadge(notification.type)}>
                  {getNotificationTypeLabel(notification.type)}
                </Badge>
                <span className='text-sm text-muted-foreground flex items-center gap-1'>
                  <ClockIcon className='h-3.5 w-3.5' />
                  {format(createdDate, 'HH:mm', { locale: vi })}
                </span>
                <span className='text-sm text-muted-foreground flex items-center gap-1'>
                  <CalendarIcon className='h-3.5 w-3.5' />
                  {format(createdDate, 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
            </div>
          </div>

          <div className='py-4 px-5 rounded-lg bg-muted/30 border text-foreground'>
            <p className='whitespace-pre-line'>{notification.content}</p>
          </div>

          {notification.reference_data && (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium flex items-center gap-1'>
                <TagIcon className='h-4 w-4' />
                Thông tin liên quan
              </h4>
              <div className='rounded-lg border overflow-hidden'>
                <table className='min-w-full divide-y'>
                  <tbody className='divide-y'>
                    {Object.entries(notification.reference_data).map(([key, value]) => (
                      <tr key={key}>
                        <td className='px-4 py-2 text-sm font-medium'>{key}</td>
                        <td className='px-4 py-2 text-sm text-muted-foreground'>
                          {typeof value === 'object' ? JSON.stringify(value) : value?.toString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className='py-4 flex justify-between'>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại danh sách
        </Button>
        <Button variant='ghost' onClick={handleDelete}>
          Xóa thông báo
        </Button>
      </CardFooter>
    </Card>
  )
}
