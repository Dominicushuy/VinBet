'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useUserDetailQuery,
  useUpdateUserMutation,
} from '@/hooks/queries/useAdminQueries'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  ArrowLeft,
  BadgeDollarSign,
  Clock,
  Coins,
  Loader,
  LockIcon,
  UnlockIcon,
  UserCog,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Giả sử `Transaction` và `Bet` là kiểu dữ liệu đã định nghĩa trong dự án
import { Transaction, Bet } from '@/types/database'

// Định nghĩa schema cập nhật người dùng
const userUpdateSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .optional(),
  username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới')
    .optional(),
  is_admin: z.boolean().optional(),
  is_blocked: z.boolean().optional(),
})

type UserUpdateSchema = z.infer<typeof userUpdateSchema>

interface UserDetailProps {
  userId: string
}

// Hàm helper để format ngày an toàn
const safeFormatDate = (dateStr: string | null, dateFormat: string) => {
  if (!dateStr) return 'N/A'
  return format(new Date(dateStr), dateFormat, { locale: vi })
}

export function UserDetail({ userId }: UserDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)

  const { data, isLoading, error, refetch } = useUserDetailQuery(userId)
  const updateUserMutation = useUpdateUserMutation()

  const user = data?.user
  const stats = data?.stats || {}
  const recentBets = data?.recentBets || []
  const recentTransactions = data?.recentTransactions || []

  const form = useForm<UserUpdateSchema>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      display_name: user?.display_name || '',
      username: user?.username || '',
      is_admin: user?.is_admin || false,
      is_blocked: user?.is_blocked || false,
    },
    values: {
      display_name: user?.display_name || '',
      username: user?.username || '',
      is_admin: user?.is_admin || false,
      is_blocked: user?.is_blocked || false,
    },
  })

  const onSubmit = (values: UserUpdateSchema) => {
    if (values.is_blocked !== user?.is_blocked) {
      // Nếu trạng thái khóa tài khoản thay đổi, hiện hộp thoại xác nhận
      setBlockDialogOpen(true)
    } else {
      // Ngược lại, submit form
      submitUpdate(values)
    }
  }

  const submitUpdate = (values: UserUpdateSchema) => {
    updateUserMutation.mutate({ id: userId, data: values })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

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
          <AlertDescription>
            {error ? (error as Error).message : 'Không tìm thấy người dùng'}
          </AlertDescription>
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
          <h2 className='text-2xl font-bold'>
            {user.display_name || user.username}
          </h2>
        </div>
        <Button onClick={() => refetch()} variant='outline' size='sm'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Làm mới
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <UserCog className='h-5 w-5' />
              <span>Thông tin người dùng</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='mb-6 flex items-center space-x-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>
                  {user.display_name?.[0] || user.username?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='text-xl font-semibold'>
                  {user.display_name || user.username}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {user.email}
                </div>
                <div className='mt-1 flex space-x-2'>
                  {user.is_admin && (
                    <Badge variant='default' className='bg-blue-500'>
                      Admin
                    </Badge>
                  )}
                  {user.is_blocked && (
                    <Badge variant='destructive'>Đã khóa</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>ID:</span>
                <span className='font-mono'>{user.id}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Ngày đăng ký:</span>
                <span>
                  {safeFormatDate(user.created_at, 'HH:mm - dd/MM/yyyy')}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Đăng nhập cuối:</span>
                <span>
                  {stats.last_login
                    ? safeFormatDate(stats.last_login, 'HH:mm - dd/MM/yyyy')
                    : 'Không có dữ liệu'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Số dư:</span>
                <span className='font-semibold text-primary'>
                  {formatCurrency(user.balance || 0)}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Mã giới thiệu:</span>
                <span>{user.referral_code || 'Chưa có mã'}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Telegram:</span>
                <span>{user.telegram_id ? 'Đã kết nối' : 'Chưa kết nối'}</span>
              </div>
            </div>

            <Separator className='my-6' />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'>
                <FormField
                  control={form.control}
                  name='display_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên hiển thị</FormLabel>
                      <FormControl>
                        <Input placeholder='Tên hiển thị' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='Username' {...field} />
                      </FormControl>
                      <FormDescription>
                        Chỉ sử dụng chữ cái, số và dấu gạch dưới.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='is_admin'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Quyền admin</FormLabel>
                        <FormDescription>
                          Cấp quyền quản trị hệ thống cho người dùng này
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='is_blocked'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Khóa tài khoản</FormLabel>
                        <FormDescription>
                          Khóa tài khoản này và ngăn người dùng đăng nhập
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className='flex justify-end space-x-2'>
                  {user.is_blocked ? (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        form.setValue('is_blocked', false)
                        submitUpdate({ ...form.getValues(), is_blocked: false })
                      }}>
                      <UnlockIcon className='mr-2 h-4 w-4' />
                      Mở khóa tài khoản
                    </Button>
                  ) : (
                    <Button
                      type='button'
                      variant='outline'
                      className='text-destructive'
                      onClick={() => {
                        form.setValue('is_blocked', true)
                        setBlockDialogOpen(true)
                      }}>
                      <LockIcon className='mr-2 h-4 w-4' />
                      Khóa tài khoản
                    </Button>
                  )}
                  <Button
                    type='submit'
                    disabled={
                      updateUserMutation.isLoading || !form.formState.isDirty
                    }>
                    {updateUserMutation.isLoading ? (
                      <>
                        <Loader className='mr-2 h-4 w-4 animate-spin' />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
                <TabsTrigger value='bets'>Lịch sử đặt cược</TabsTrigger>
                <TabsTrigger value='transactions'>Giao dịch</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-4 pt-4'>
                <div className='grid gap-4 grid-cols-2'>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center'>
                        <BadgeDollarSign className='h-4 w-4 mr-2' />
                        Nạp/Rút
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {formatCurrency(
                          (stats.total_deposits || 0) -
                            (stats.total_withdrawals || 0)
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Nạp: {formatCurrency(stats.total_deposits || 0)}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Rút: {formatCurrency(stats.total_withdrawals || 0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center'>
                        <Coins className='h-4 w-4 mr-2' />
                        Cược/Thắng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>
                        {formatCurrency(stats.net_gambling || 0)}
                      </div>
                      <p className='text-xs text-muted-foreground'>
                        Đặt cược: {formatCurrency(stats.total_bet_amount || 0)}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Thắng: {formatCurrency(stats.total_winnings || 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Thống kê cược
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-3 gap-4'>
                    <div>
                      <p className='text-sm font-medium'>Tổng cược</p>
                      <p className='text-2xl font-bold'>
                        {stats.total_bets || 0}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Thắng</p>
                      <p className='text-2xl font-bold'>
                        {stats.won_bets || 0}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Tỷ lệ thắng</p>
                      <p className='text-2xl font-bold'>
                        {stats.win_rate ? stats.win_rate.toFixed(1) : '0'}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium flex items-center'>
                      <Clock className='h-4 w-4 mr-2' />
                      Hoạt động gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {recentTransactions.length === 0 &&
                      recentBets.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                          Chưa có hoạt động nào
                        </p>
                      ) : (
                        <>
                          {recentTransactions
                            .slice(0, 3)
                            .map((tx: Transaction) => (
                              <div
                                key={tx.id}
                                className='flex items-center justify-between'>
                                <div>
                                  <p className='text-sm font-medium'>
                                    {tx.type === 'deposit'
                                      ? 'Nạp tiền'
                                      : tx.type === 'withdrawal'
                                      ? 'Rút tiền'
                                      : tx.type === 'bet'
                                      ? 'Đặt cược'
                                      : tx.type === 'win'
                                      ? 'Thắng cược'
                                      : tx.type}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {safeFormatDate(
                                      tx.created_at,
                                      'HH:mm - dd/MM/yyyy'
                                    )}
                                  </p>
                                </div>
                                <p
                                  className={`text-sm font-medium ${
                                    tx.amount > 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                  {tx.amount > 0 ? '+' : ''}
                                  {formatCurrency(tx.amount)}
                                </p>
                              </div>
                            ))}

                          {recentBets.slice(0, 3).map((bet: Bet) => (
                            <div
                              key={bet.id}
                              className='flex items-center justify-between'>
                              <div>
                                <p className='text-sm font-medium'>
                                  Đặt cược #{bet.game_round_id.substring(0, 8)}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {safeFormatDate(
                                    bet.created_at,
                                    'HH:mm - dd/MM/yyyy'
                                  )}
                                </p>
                              </div>
                              <p
                                className={`text-sm font-medium ${
                                  bet.status === 'won'
                                    ? 'text-green-600'
                                    : bet.status === 'lost'
                                    ? 'text-red-600'
                                    : 'text-gray-600'
                                }`}>
                                {bet.status === 'won'
                                  ? `+${formatCurrency(bet.potential_win)}`
                                  : `${formatCurrency(-bet.amount)}`}
                              </p>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='bets' className='pt-4'>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Lượt chơi</TableHead>
                        <TableHead>Số đã chọn</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Tiền thắng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBets.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className='text-center h-24 text-muted-foreground'>
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentBets.map((bet: Bet) => (
                          <TableRow key={bet.id}>
                            <TableCell className='font-mono text-xs'>
                              {bet.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className='font-mono text-xs'>
                              {bet.game_round_id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>{bet.chosen_number}</TableCell>
                            <TableCell>{formatCurrency(bet.amount)}</TableCell>
                            <TableCell>
                              {bet.status === 'won'
                                ? formatCurrency(bet.potential_win)
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  bet.status === 'won'
                                    ? 'default'
                                    : bet.status === 'lost'
                                    ? 'destructive'
                                    : 'outline'
                                }>
                                {bet.status === 'won'
                                  ? 'Thắng'
                                  : bet.status === 'lost'
                                  ? 'Thua'
                                  : bet.status === 'pending'
                                  ? 'Đang chờ'
                                  : bet.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {safeFormatDate(bet.created_at, 'HH:mm - dd/MM')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className='mt-2 text-right'>
                  <Button
                    variant='link'
                    onClick={() => router.push(`/admin/users/${userId}/bets`)}>
                    Xem tất cả
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value='transactions' className='pt-4'>
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className='text-center h-24 text-muted-foreground'>
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentTransactions.map((tx: Transaction) => (
                          <TableRow key={tx.id}>
                            <TableCell className='font-mono text-xs'>
                              {tx.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {tx.type === 'deposit'
                                ? 'Nạp tiền'
                                : tx.type === 'withdrawal'
                                ? 'Rút tiền'
                                : tx.type === 'bet'
                                ? 'Đặt cược'
                                : tx.type === 'win'
                                ? 'Thắng cược'
                                : tx.type}
                            </TableCell>
                            <TableCell
                              className={
                                tx.amount > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }>
                              {tx.amount > 0 ? '+' : ''}
                              {formatCurrency(tx.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  tx.status === 'completed'
                                    ? 'default'
                                    : tx.status === 'failed'
                                    ? 'destructive'
                                    : 'outline'
                                }>
                                {tx.status === 'completed'
                                  ? 'Hoàn thành'
                                  : tx.status === 'pending'
                                  ? 'Đang chờ'
                                  : tx.status === 'failed'
                                  ? 'Thất bại'
                                  : tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className='max-w-[200px] truncate'>
                              {tx.description || '-'}
                            </TableCell>
                            <TableCell>
                              {safeFormatDate(tx.created_at, 'HH:mm - dd/MM')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className='mt-2 text-right'>
                  <Button
                    variant='link'
                    onClick={() =>
                      router.push(`/admin/users/${userId}/transactions`)
                    }>
                    Xem tất cả
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {form.getValues().is_blocked
                ? 'Xác nhận khóa tài khoản'
                : 'Xác nhận mở khóa tài khoản'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {form.getValues().is_blocked ? (
                <>
                  Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không
                  thể đăng nhập và thực hiện các giao dịch.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ có
                  thể đăng nhập và sử dụng hệ thống trở lại.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitUpdate(form.getValues())}>
              {form.getValues().is_blocked
                ? 'Khóa tài khoản'
                : 'Mở khóa tài khoản'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
