'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserDetailQuery, useUpdateUserMutation } from '@/hooks/queries/useAdminQueries'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  ArrowLeft,
  RefreshCw,
  UserCog,
  LockIcon,
  UnlockIcon,
  AlertCircle,
  Clock,
  BadgeDollarSign,
  Landmark,
  CreditCard,
  Activity,
  Award,
  PieChart,
  LineChart,
  Send,
  Mail,
  Download,
  MessageSquare,
  CircleDollarSign,
  Gift,
  History,
  Edit,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/utils/formatUtils'

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
  const [editMode, setEditMode] = useState(false)

  const { data, isLoading, error, refetch } = useUserDetailQuery(userId)
  const updateUserMutation = useUpdateUserMutation()

  const user = data?.user
  const stats = data?.stats || {}
  const recentBets = data?.recentBets || []
  const recentTransactions = data?.recentTransactions || []

  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      display_name: user?.display_name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      is_admin: user?.is_admin || false,
      is_blocked: user?.is_blocked || false
    },
    values: {
      display_name: user?.display_name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      is_admin: user?.is_admin || false,
      is_blocked: user?.is_blocked || false
    }
  })

  const onSubmit = values => {
    if (values.is_blocked !== user?.is_blocked) {
      // Nếu trạng thái khóa tài khoản thay đổi, hiện hộp thoại xác nhận
      setBlockDialogOpen(true)
    } else {
      // Ngược lại, submit form
      submitUpdate(values)
    }
  }

  const submitUpdate = values => {
    updateUserMutation.mutate({ id: userId, data: values })
    setEditMode(false)
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

          <div className='flex space-x-2'>
            {user.is_admin && (
              <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>Admin</Badge>
            )}
            {user.is_blocked && <Badge variant='destructive'>Đã khóa</Badge>}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => refetch()} variant='outline' size='icon'>
                  <RefreshCw className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Làm mới dữ liệu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>Thao tác</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Hành động nhanh</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setEditMode(true)}>
                <Edit className='mr-2 h-4 w-4' />
                Chỉnh sửa thông tin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/transactions`)}>
                <History className='mr-2 h-4 w-4' />
                Lịch sử giao dịch
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/users/${userId}/bets`)}>
                <Activity className='mr-2 h-4 w-4' />
                Lịch sử đặt cược
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setResetPasswordDialogOpen(true)}>
                <LockIcon className='mr-2 h-4 w-4' />
                Reset mật khẩu
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className='mr-2 h-4 w-4' />
                Gửi email
              </DropdownMenuItem>
              {user.is_blocked ? (
                <DropdownMenuItem
                  onClick={() => {
                    form.setValue('is_blocked', false)
                    setBlockDialogOpen(true)
                  }}
                >
                  <UnlockIcon className='mr-2 h-4 w-4 text-green-500' />
                  <span className='text-green-500'>Mở khóa tài khoản</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    form.setValue('is_blocked', true)
                    setBlockDialogOpen(true)
                  }}
                >
                  <LockIcon className='mr-2 h-4 w-4 text-red-500' />
                  <span className='text-red-500'>Khóa tài khoản</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {/* User profile column */}
        <Card className='md:col-span-1'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xl'>Hồ sơ người dùng</CardTitle>
            {!editMode && (
              <Button variant='ghost' size='sm' onClick={() => setEditMode(true)}>
                <Edit className='h-4 w-4 mr-1' />
                Sửa
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className='flex flex-col items-center mb-4'>
              <Avatar className='h-20 w-20 mb-2'>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className='text-lg'>
                  {(user.display_name || user.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className='text-lg font-semibold'>{user.display_name || user.username}</h3>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <div className='flex mt-1 space-x-1'>
                {user.is_admin && (
                  <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>Admin</Badge>
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
            </div>

            <Separator className='my-4' />

            {editMode ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                        <FormDescription>Chỉ sử dụng chữ cái, số và dấu gạch dưới.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='Email' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone_number'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder='Số điện thoại' {...field} />
                        </FormControl>
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>Quyền admin</FormLabel>
                          <FormDescription>Cấp quyền quản trị hệ thống cho người dùng này</FormDescription>
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>Khóa tài khoản</FormLabel>
                          <FormDescription>Khóa tài khoản này và ngăn người dùng đăng nhập</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className='flex justify-end space-x-2'>
                    <Button type='button' variant='outline' onClick={() => setEditMode(false)}>
                      Hủy
                    </Button>
                    <Button type='submit' disabled={updateUserMutation.isLoading || !form.formState.isDirty}>
                      {updateUserMutation.isLoading ? (
                        <>
                          <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                          Đang lưu...
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-1'>
                  <div className='text-sm text-muted-foreground'>User ID</div>
                  <div className='text-sm font-medium overflow-hidden text-ellipsis'>
                    <HoverCard>
                      <HoverCardTrigger className='cursor-help'>{user.id.substring(0, 8)}...</HoverCardTrigger>
                      <HoverCardContent side='right'>
                        <p className='text-xs font-mono'>{user.id}</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>

                  <div className='text-sm text-muted-foreground'>Ngày đăng ký</div>
                  <div className='text-sm'>{format(new Date(user.created_at), 'dd/MM/yyyy HH:mm')}</div>

                  <div className='text-sm text-muted-foreground'>Hoạt động cuối</div>
                  <div className='text-sm'>
                    {stats.last_login ? (
                      <span title={format(new Date(stats.last_login), 'dd/MM/yyyy HH:mm')}>
                        {formatDistanceToNow(new Date(stats.last_login), { addSuffix: true, locale: vi })}
                      </span>
                    ) : (
                      'Không có dữ liệu'
                    )}
                  </div>

                  <div className='text-sm text-muted-foreground'>Số dư</div>
                  <div className='text-sm font-semibold text-primary'>{formatCurrency(user.balance || 0)}</div>

                  <div className='text-sm text-muted-foreground'>Mã giới thiệu</div>
                  <div className='text-sm'>{user.referral_code || 'Chưa có mã'}</div>

                  <div className='text-sm text-muted-foreground'>Telegram</div>
                  <div className='text-sm'>
                    {user.telegram_id ? (
                      <Badge variant='outline' className='bg-blue-50 text-blue-600'>
                        Đã kết nối
                      </Badge>
                    ) : (
                      'Chưa kết nối'
                    )}
                  </div>

                  <div className='text-sm text-muted-foreground'>Nguồn</div>
                  <div className='text-sm'>
                    {user.referred_by ? (
                      <div className='flex items-center'>
                        <span>Được giới thiệu</span>
                        <Button
                          variant='link'
                          size='sm'
                          className='h-4 p-0 ml-1'
                          onClick={() => router.push(`/admin/users/${user.referred_by}`)}
                        >
                          <ExternalLink className='h-3 w-3' />
                        </Button>
                      </div>
                    ) : (
                      'Đăng ký trực tiếp'
                    )}
                  </div>
                </div>

                <Separator className='my-3' />

                <div className='flex flex-col space-y-2'>
                  <h4 className='text-sm font-medium'>Ghi chú quản trị</h4>
                  <textarea
                    className='min-h-24 w-full rounded-md border border-input p-2 text-sm'
                    placeholder='Thêm ghi chú về người dùng này (chỉ admin xem được)'
                    defaultValue={user.admin_notes || ''}
                  />
                  <Button variant='outline' size='sm' className='self-end'>
                    Lưu ghi chú
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User stats and activities columns */}
        <Card className='md:col-span-2'>
          <CardHeader className='px-6 py-4'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='grid grid-cols-4'>
                <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
                <TabsTrigger value='financial'>Tài chính</TabsTrigger>
                <TabsTrigger value='bets'>Cược</TabsTrigger>
                <TabsTrigger value='actions'>Hành động</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value='overview' className='mt-0'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium flex items-center'>
                      <BadgeDollarSign className='h-4 w-4 mr-2 text-blue-500' />
                      Tài chính
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pb-4'>
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-1'>
                        <div className='text-sm text-muted-foreground'>Tổng nạp</div>
                        <div className='text-sm font-medium text-right'>
                          {formatCurrency(stats.total_deposits || 0)}
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-1'>
                        <div className='text-sm text-muted-foreground'>Tổng rút</div>
                        <div className='text-sm font-medium text-right'>
                          {formatCurrency(stats.total_withdrawals || 0)}
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-1'>
                        <div className='text-sm text-muted-foreground'>Chênh lệch</div>
                        <div className='text-sm font-medium text-right'>
                          {formatCurrency((stats.total_deposits || 0) - (stats.total_withdrawals || 0))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium flex items-center'>
                      <Activity className='h-4 w-4 mr-2 text-green-500' />
                      Thống kê cược
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pb-4'>
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='text-center'>
                        <div className='text-2xl font-bold'>{stats.total_bets || 0}</div>
                        <div className='text-xs text-muted-foreground'>Tổng cược</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold'>{stats.won_bets || 0}</div>
                        <div className='text-xs text-muted-foreground'>Thắng</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold'>{stats.win_rate ? stats.win_rate.toFixed(1) : '0'}%</div>
                        <div className='text-xs text-muted-foreground'>Tỷ lệ thắng</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium flex items-center'>
                    <Clock className='h-4 w-4 mr-2 text-orange-500' />
                    Hoạt động gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className='pb-4'>
                  <div className='space-y-4'>
                    {recentTransactions.length === 0 && recentBets.length === 0 ? (
                      <p className='text-sm text-muted-foreground text-center py-4'>
                        Người dùng này chưa có hoạt động nào
                      </p>
                    ) : (
                      <>
                        {recentTransactions.slice(0, 3).map(tx => (
                          <div key={tx.id} className='flex items-center justify-between'>
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
                              <div className='flex items-center'>
                                <p className='text-xs text-muted-foreground'>
                                  {format(new Date(tx.created_at), 'HH:mm - dd/MM/yyyy')}
                                </p>
                                {tx.payment_request_id && (
                                  <Button
                                    variant='link'
                                    size='sm'
                                    className='h-4 p-0 ml-1'
                                    onClick={() => router.push(`/admin/payments/${tx.payment_request_id}`)}
                                  >
                                    <ExternalLink className='h-3 w-3' />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.amount > 0 ? '+' : ''}
                              {formatCurrency(tx.amount)}
                            </p>
                          </div>
                        ))}

                        {recentBets.slice(0, 3).map(bet => (
                          <div key={bet.id} className='flex items-center justify-between'>
                            <div>
                              <div className='flex items-center'>
                                <p className='text-sm font-medium'>Đặt cược #{bet.game_round_id.substring(0, 8)}</p>
                                <Button
                                  variant='link'
                                  size='sm'
                                  className='h-4 p-0 ml-1'
                                  onClick={() => router.push(`/admin/games/${bet.game_round_id}`)}
                                >
                                  <ExternalLink className='h-3 w-3' />
                                </Button>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {format(new Date(bet.created_at), 'HH:mm - dd/MM/yyyy')}
                              </p>
                            </div>
                            <p
                              className={`text-sm font-medium ${
                                bet.status === 'won'
                                  ? 'text-green-600'
                                  : bet.status === 'lost'
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
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
                <CardFooter className='pt-0 flex justify-between'>
                  <Button variant='link' size='sm' onClick={() => router.push(`/admin/users/${userId}/transactions`)}>
                    Xem tất cả giao dịch
                  </Button>
                  <Button variant='link' size='sm' onClick={() => router.push(`/admin/users/${userId}/bets`)}>
                    Xem tất cả cược
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value='financial' className='mt-0'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Card className='bg-gradient-to-br from-blue-50 to-blue-100'>
                    <CardContent className='pt-6'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-sm font-medium text-blue-800'>Số dư hiện tại</h3>
                          <p className='text-2xl font-bold text-blue-900'>{formatCurrency(user.balance || 0)}</p>
                        </div>
                        <Landmark className='h-10 w-10 text-blue-500 opacity-80' />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex flex-col'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-sm font-medium text-muted-foreground'>Lợi nhuận từ cược</h3>
                          <Activity className='h-5 w-5 text-green-500' />
                        </div>
                        <p
                          className={`text-xl font-bold ${stats.net_gambling > 0 ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {stats.net_gambling > 0 ? '+' : ''}
                          {formatCurrency(stats.net_gambling || 0)}
                        </p>
                        <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                          <span>Tổng cược: {formatCurrency(stats.total_bet_amount || 0)}</span>
                          <span>Tổng thắng: {formatCurrency(stats.total_winnings || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex flex-col'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-sm font-medium text-muted-foreground'>Nạp/Rút</h3>
                          <CreditCard className='h-5 w-5 text-indigo-500' />
                        </div>
                        <p className='text-xl font-bold'>
                          {formatCurrency((stats.total_deposits || 0) - (stats.total_withdrawals || 0))}
                        </p>
                        <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                          <span>Nạp: {formatCurrency(stats.total_deposits || 0)}</span>
                          <span>Rút: {formatCurrency(stats.total_withdrawals || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base flex items-center'>
                      <History className='h-4 w-4 mr-2' />
                      Lịch sử giao dịch gần đây
                    </CardTitle>
                    <CardDescription>5 giao dịch gần nhất của người dùng</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentTransactions.length === 0 ? (
                      <p className='text-sm text-muted-foreground text-center py-4'>Người dùng chưa có giao dịch nào</p>
                    ) : (
                      <div className='rounded-md border'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b bg-muted/50'>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Loại</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Số tiền</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Trạng thái</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Thời gian</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Mô tả</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentTransactions.map(tx => (
                              <tr key={tx.id} className='border-b'>
                                <td className='py-2 px-3 text-sm'>
                                  {tx.type === 'deposit'
                                    ? 'Nạp tiền'
                                    : tx.type === 'withdrawal'
                                    ? 'Rút tiền'
                                    : tx.type === 'bet'
                                    ? 'Đặt cược'
                                    : tx.type === 'win'
                                    ? 'Thắng cược'
                                    : tx.type === 'referral_reward'
                                    ? 'Thưởng giới thiệu'
                                    : tx.type}
                                </td>
                                <td
                                  className={`py-2 px-3 text-sm font-medium ${
                                    tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_reward'
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'referral_reward'
                                    ? '+'
                                    : '-'}
                                  {formatCurrency(Math.abs(tx.amount))}
                                </td>
                                <td className='py-2 px-3 text-sm'>
                                  <Badge
                                    variant={
                                      tx.status === 'completed'
                                        ? 'outline'
                                        : tx.status === 'failed'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                    className={
                                      tx.status === 'completed'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                        : undefined
                                    }
                                  >
                                    {tx.status === 'completed'
                                      ? 'Hoàn thành'
                                      : tx.status === 'pending'
                                      ? 'Đang xử lý'
                                      : tx.status === 'failed'
                                      ? 'Thất bại'
                                      : tx.status}
                                  </Badge>
                                </td>
                                <td className='py-2 px-3 text-sm'>
                                  {format(new Date(tx.created_at), 'dd/MM/yyyy HH:mm')}
                                </td>
                                <td className='py-2 px-3 text-sm max-w-[200px] truncate'>{tx.description || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => router.push(`/admin/users/${userId}/transactions`)}
                    >
                      Xem tất cả giao dịch
                    </Button>
                  </CardFooter>
                </Card>

                <div className='grid grid-cols-2 gap-4'>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center'>
                        <CircleDollarSign className='h-4 w-4 mr-2 text-green-500' />
                        Điều chỉnh số dư
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-2'>
                          <Input type='number' placeholder='Nhập số tiền' min='0' step='10000' />
                          <Select defaultValue='add'>
                            <SelectTrigger>
                              <SelectValue placeholder='Hành động' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='add'>Cộng tiền</SelectItem>
                              <SelectItem value='subtract'>Trừ tiền</SelectItem>
                              <SelectItem value='set'>Đặt số dư</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input placeholder='Lý do (hiển thị cho admin)' />
                        <Input placeholder='Ghi chú (hiển thị cho người dùng)' />
                        <Button className='w-full'>Xác nhận</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center'>
                        <Gift className='h-4 w-4 mr-2 text-purple-500' />
                        Tặng thưởng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-2'>
                          <Input type='number' placeholder='Số tiền' min='0' step='10000' />
                          <Select defaultValue='bonus'>
                            <SelectTrigger>
                              <SelectValue placeholder='Loại' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='bonus'>Thưởng</SelectItem>
                              <SelectItem value='jackpot'>Jackpot</SelectItem>
                              <SelectItem value='event'>Sự kiện</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input placeholder='Lý do tặng thưởng' />
                        <Button className='w-full'>Tặng thưởng</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='bets' className='mt-0'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex flex-col'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-sm font-medium text-muted-foreground'>Tổng số cược</h3>
                          <Activity className='h-5 w-5 text-blue-500' />
                        </div>
                        <p className='text-2xl font-bold'>{stats.total_bets || 0}</p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Giá trị: {formatCurrency(stats.total_bet_amount || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex flex-col'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-sm font-medium text-muted-foreground'>Thắng cược</h3>
                          <Award className='h-5 w-5 text-green-500' />
                        </div>
                        <p className='text-2xl font-bold'>{stats.won_bets || 0}</p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Giá trị: {formatCurrency(stats.total_winnings || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex flex-col'>
                        <div className='flex items-center justify-between mb-2'>
                          <h3 className='text-sm font-medium text-muted-foreground'>Tỷ lệ thắng</h3>
                          <PieChart className='h-5 w-5 text-orange-500' />
                        </div>
                        <p className='text-2xl font-bold'>{stats.win_rate ? stats.win_rate.toFixed(1) : '0'}%</p>
                        <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                          <span>Thắng: {stats.won_bets || 0}</span>
                          <span>Thua: {(stats.total_bets || 0) - (stats.won_bets || 0)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base flex items-center'>
                      <LineChart className='h-4 w-4 mr-2' />
                      Lịch sử đặt cược gần đây
                    </CardTitle>
                    <CardDescription>5 lượt cược gần nhất của người dùng</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentBets.length === 0 ? (
                      <p className='text-sm text-muted-foreground text-center py-4'>Người dùng chưa đặt cược lần nào</p>
                    ) : (
                      <div className='rounded-md border'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b bg-muted/50'>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Lượt chơi</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Số đã chọn</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Số tiền</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Kết quả</th>
                              <th className='py-2 px-3 text-left text-sm font-medium'>Thời gian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentBets.map(bet => (
                              <tr key={bet.id} className='border-b'>
                                <td className='py-2 px-3 text-sm'>
                                  <div className='flex items-center'>
                                    <span>#{bet.game_round_id.substring(0, 8)}</span>
                                    <Button
                                      variant='link'
                                      size='sm'
                                      className='h-4 p-0 ml-1'
                                      onClick={() => router.push(`/admin/games/${bet.game_round_id}`)}
                                    >
                                      <ExternalLink className='h-3 w-3' />
                                    </Button>
                                  </div>
                                </td>
                                <td className='py-2 px-3 text-sm font-medium'>{bet.chosen_number}</td>
                                <td className='py-2 px-3 text-sm'>{formatCurrency(bet.amount)}</td>
                                <td className='py-2 px-3 text-sm'>
                                  {bet.status === 'won' ? (
                                    <span className='text-green-600 font-medium'>
                                      Thắng {formatCurrency(bet.potential_win)}
                                    </span>
                                  ) : bet.status === 'lost' ? (
                                    <span className='text-red-600'>Thua</span>
                                  ) : (
                                    <Badge variant='outline'>
                                      {bet.status === 'pending' ? 'Đang chờ' : bet.status}
                                    </Badge>
                                  )}
                                </td>
                                <td className='py-2 px-3 text-sm'>
                                  {format(new Date(bet.created_at), 'dd/MM/yyyy HH:mm')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => router.push(`/admin/users/${userId}/bets`)}
                    >
                      Xem tất cả lượt cược
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='actions' className='mt-0'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center'>
                        <MessageSquare className='h-4 w-4 mr-2 text-blue-500' />
                        Gửi thông báo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <Input placeholder='Tiêu đề thông báo' />
                        <textarea
                          className='min-h-24 w-full rounded-md border border-input p-2 text-sm'
                          placeholder='Nội dung thông báo'
                        />
                        <Select defaultValue='system'>
                          <SelectTrigger>
                            <SelectValue placeholder='Loại thông báo' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='system'>Hệ thống</SelectItem>
                            <SelectItem value='game'>Trò chơi</SelectItem>
                            <SelectItem value='transaction'>Giao dịch</SelectItem>
                            <SelectItem value='admin'>Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className='w-full'>
                          <Send className='h-4 w-4 mr-2' />
                          Gửi thông báo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-sm font-medium flex items-center'>
                        <Mail className='h-4 w-4 mr-2 text-indigo-500' />
                        Gửi email
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <Input placeholder='Tiêu đề email' />
                        <textarea
                          className='min-h-24 w-full rounded-md border border-input p-2 text-sm'
                          placeholder='Nội dung email'
                        />
                        <Select defaultValue='notification'>
                          <SelectTrigger>
                            <SelectValue placeholder='Loại email' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='notification'>Thông báo</SelectItem>
                            <SelectItem value='promotion'>Khuyến mãi</SelectItem>
                            <SelectItem value='support'>Hỗ trợ</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className='w-full'>
                          <Send className='h-4 w-4 mr-2' />
                          Gửi email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium flex items-center'>
                      <Download className='h-4 w-4 mr-2 text-green-500' />
                      Xuất dữ liệu người dùng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-3'>
                        <Button variant='outline' className='justify-start'>
                          <Download className='h-4 w-4 mr-2' />
                          Xuất lịch sử giao dịch
                        </Button>
                        <Button variant='outline' className='justify-start'>
                          <Download className='h-4 w-4 mr-2' />
                          Xuất lịch sử cược
                        </Button>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <Button variant='outline' className='justify-start'>
                          <Download className='h-4 w-4 mr-2' />
                          Xuất thông tin chi tiết
                        </Button>
                        <Button variant='outline' className='justify-start'>
                          <Download className='h-4 w-4 mr-2' />
                          Xuất lịch sử đăng nhập
                        </Button>
                      </div>

                      <Button className='w-full'>
                        <Download className='h-4 w-4 mr-2' />
                        Xuất tất cả dữ liệu
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className='border-red-100'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium flex items-center text-red-500'>
                      <AlertCircle className='h-4 w-4 mr-2' />
                      Hành động nguy hiểm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='grid grid-cols-2 gap-3'>
                        <Button
                          variant='outline'
                          className='justify-start text-red-500 border-red-300 hover:bg-red-50'
                          onClick={() => setResetPasswordDialogOpen(true)}
                        >
                          <LockIcon className='h-4 w-4 mr-2' />
                          Reset mật khẩu
                        </Button>

                        {user.is_blocked ? (
                          <Button
                            variant='outline'
                            className='justify-start text-green-500 border-green-300 hover:bg-green-50'
                            onClick={() => {
                              form.setValue('is_blocked', false)
                              setBlockDialogOpen(true)
                            }}
                          >
                            <UnlockIcon className='h-4 w-4 mr-2' />
                            Mở khóa tài khoản
                          </Button>
                        ) : (
                          <Button
                            variant='outline'
                            className='justify-start text-red-500 border-red-300 hover:bg-red-50'
                            onClick={() => {
                              form.setValue('is_blocked', true)
                              setBlockDialogOpen(true)
                            }}
                          >
                            <LockIcon className='h-4 w-4 mr-2' />
                            Khóa tài khoản
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </CardContent>
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
            <AlertDialogAction>Gửi email reset mật khẩu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
