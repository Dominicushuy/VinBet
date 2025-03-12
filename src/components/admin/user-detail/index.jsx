// src/components/admin/user-detail/index.jsx - Phiên bản cải tiến
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useUserDetailQuery, useUpdateUserMutation, useResetPasswordMutation } from '@/hooks/queries/useAdminQueries'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { UserProfileCard } from './UserProfileCard'
import { UserOverviewTab } from './UserOverviewTab'
import { UserFinancialTab } from './UserFinancialTab'
import { UserBetsTab } from './UserBetsTab'
import { UserActionsTab } from './UserActionsTab'
import { useEditMode } from '@/hooks/useEditMode'

// Schema để cập nhật user
const userUpdateSchema = z.object({
  display_name: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự').optional(),
  username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới')
    .optional(),
  is_admin: z.boolean().optional(),
  is_blocked: z.boolean().optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  phone_number: z.string().optional().nullable()
})

export function AdminUserDetail({ userId }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  const { isEditMode, enterEditMode, cancelEditMode } = useEditMode(false)

  const { data, isLoading, error, refetch } = useUserDetailQuery(userId)
  const updateUserMutation = useUpdateUserMutation()
  const resetPasswordMutation = useResetPasswordMutation()

  const user = data?.user
  const stats = data?.stats || {}
  const recentBets = data?.recentBets || []
  const recentTransactions = data?.recentTransactions || []

  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: useMemo(
      () => ({
        display_name: user?.display_name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        is_admin: user?.is_admin || false,
        is_blocked: user?.is_blocked || false
      }),
      [user]
    )
  })

  const onSubmit = useCallback(
    values => {
      if (values.is_blocked !== user?.is_blocked) {
        setBlockDialogOpen(true)
      } else {
        submitUpdate(values)
      }
    },
    [user]
  )

  const submitUpdate = useCallback(
    values => {
      updateUserMutation.mutate({ id: userId, data: values })
      cancelEditMode()
    },
    [updateUserMutation, userId, cancelEditMode]
  )

  const handleResetPassword = useCallback(() => {
    resetPasswordMutation.mutate(userId, {
      onSuccess: () => {
        setResetPasswordDialogOpen(false)
      }
    })
  }, [userId, resetPasswordMutation])

  const handleExportUserData = useCallback(
    async type => {
      try {
        const endpoint = `/api/admin/users/${userId}/export?type=${type}`
        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error('Không thể xuất dữ liệu')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `user-${userId}-${type}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Xuất dữ liệu thành công')
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Không thể xuất dữ liệu: ' + error.message)
      }
    },
    [userId]
  )

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <Skeleton className='h-8 w-[300px]' />
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-[400px]' />
          <Skeleton className='h-[400px]' />
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
        </div>

        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error ? error.message : 'Không tìm thấy người dùng'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <h2 className='text-2xl font-bold'>{user.display_name || user.username}</h2>
        </div>

        <div className='flex items-center space-x-2'>
          <Button onClick={() => refetch()} variant='outline' size='icon'>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* User profile column */}
        <UserProfileCard
          user={user}
          stats={stats}
          form={form}
          onSubmit={onSubmit}
          isEditMode={isEditMode}
          setEditMode={enterEditMode}
          updateUserMutation={updateUserMutation}
        />

        {/* User stats and activities columns */}
        <Card className='md:col-span-2'>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid grid-cols-4 px-6 py-4'>
              <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
              <TabsTrigger value='financial'>Tài chính</TabsTrigger>
              <TabsTrigger value='bets'>Cược</TabsTrigger>
              <TabsTrigger value='actions'>Hành động</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='mt-0'>
              <UserOverviewTab
                user={user}
                stats={stats}
                recentBets={recentBets}
                recentTransactions={recentTransactions}
                router={router}
              />
            </TabsContent>

            <TabsContent value='financial' className='mt-0'>
              <UserFinancialTab user={user} stats={stats} recentTransactions={recentTransactions} router={router} />
            </TabsContent>

            <TabsContent value='bets' className='mt-0'>
              <UserBetsTab user={user} stats={stats} recentBets={recentBets} router={router} />
            </TabsContent>

            <TabsContent value='actions' className='mt-0'>
              <UserActionsTab
                user={user}
                onResetPassword={() => setResetPasswordDialogOpen(true)}
                onBlockUser={() => {
                  form.setValue('is_blocked', true)
                  setBlockDialogOpen(true)
                }}
                onUnblockUser={() => {
                  form.setValue('is_blocked', false)
                  setBlockDialogOpen(true)
                }}
                onExportData={handleExportUserData}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {form.getValues().is_blocked ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {form.getValues().is_blocked ? (
                <>
                  Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập và thực hiện các giao
                  dịch.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ có thể đăng nhập và sử dụng hệ thống trở
                  lại.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitUpdate(form.getValues())}>
              {form.getValues().is_blocked ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận reset mật khẩu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn reset mật khẩu của người dùng này? Một email đặt lại mật khẩu sẽ được gửi tới địa
              chỉ <strong>{user.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              {resetPasswordMutation.isLoading ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Đang xử lý...
                </>
              ) : (
                'Gửi email reset mật khẩu'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
