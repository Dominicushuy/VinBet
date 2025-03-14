'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsChart } from '@/components/admin/telegram/StatsChart'
import { fetchData } from '@/utils/fetchUtils'
import { Users, Bell, MessageSquare, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Tách thành component riêng để tái sử dụng theo DRY principle
const StatCard = ({ title, value, icon, subtitle, isLoading, textColor }) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className='h-6 w-20' />
      ) : (
        <div className={`text-2xl font-bold ${textColor || ''}`}>{value}</div>
      )}
      <p className='text-xs text-muted-foreground'>{subtitle}</p>
    </CardContent>
  </Card>
)

export default function TelegramStatsPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch Telegram Stats
  const {
    data: telegramStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin', 'telegram-stats', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: () =>
      fetchData(
        `/api/admin/telegram/stats?startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(
          dateRange.to,
          'yyyy-MM-dd'
        )}`
      ),
    placeholderData: oldData => oldData, // Replaced deprecated keepPreviousData
    staleTime: 55000, // Tối ưu để tránh re-fetch không cần thiết
    retry: 2
  })

  // Fetch User Stats
  const {
    data: userStats,
    isLoading: loadingUserStats,
    error: userStatsError,
    refetch: refetchUserStats
  } = useQuery({
    queryKey: ['admin', 'telegram-user-stats'],
    queryFn: () => fetchData('/api/admin/telegram/user-stats'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })

  // Xử lý lỗi API - được cải thiện
  const hasErrors = statsError || userStatsError

  // Memoize số liệu để tránh tính toán lại khi re-render
  const summary = useMemo(() => {
    if (!telegramStats || !telegramStats.stats) return null

    const stats = telegramStats.stats
    const summaryData = telegramStats.summary || {}

    return {
      totalNotificationsSent: summaryData.total_notifications_sent || 0,
      totalNewConnections: summaryData.total_new_connections || 0,
      totalDisconnections: summaryData.total_disconnections || 0,
      totalBotInteractions: summaryData.total_bot_interactions || 0,
      totalActivity: stats.reduce((acc, day) => acc + day.total_activity || 0, 0),
      avgDailyNotifications: Math.round(summaryData.total_notifications_sent / stats.length) || 0,
      mostActiveDay:
        stats.length > 0
          ? stats.reduce((max, day) => (day.total_activity > max.total_activity ? day : max), stats[0])
          : null
    }
  }, [telegramStats])

  // Hàm để refresh tất cả data
  const refreshAllData = () => {
    refetchStats()
    refetchUserStats()
  }

  return (
    <div className='space-y-6'>
      {/* Header với refresh button */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Thống kê Telegram</h1>
          <p className='text-muted-foreground'>Phân tích dữ liệu kết nối và hoạt động của Telegram Bot</p>
        </div>
        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          <Button variant='outline' size='icon' onClick={refreshAllData}>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4 mr-2' />
          <AlertDescription>
            {statsError ? 'Không thể tải thống kê Telegram. ' : ''}
            {userStatsError ? 'Không thể tải thông kê người dùng Telegram. ' : ''}
            Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}

      {/* Cải thiện responsive */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Người dùng kết nối'
          value={`${telegramStats?.summary?.connection_rate?.toFixed(1) || '0'}%`}
          icon={<Users className='h-4 w-4 text-muted-foreground' />}
          subtitle='Tỷ lệ người dùng đã kết nối'
          isLoading={statsLoading}
        />

        <StatCard
          title='Kết nối mới'
          value={telegramStats?.summary?.total_new_connections?.toLocaleString() || '0'}
          icon={<Users className='h-4 w-4 text-muted-foreground' />}
          subtitle='Tổng số kết nối mới'
          isLoading={statsLoading}
        />

        <StatCard
          title='Thông báo đã gửi'
          value={telegramStats?.summary?.total_notifications_sent?.toLocaleString() || '0'}
          icon={<Bell className='h-4 w-4 text-muted-foreground' />}
          subtitle={`Trung bình ${summary?.avgDailyNotifications || 0} thông báo/ngày`}
          isLoading={statsLoading}
        />

        <StatCard
          title='Tương tác Bot'
          value={telegramStats?.summary?.total_bot_interactions?.toLocaleString() || '0'}
          icon={<MessageSquare className='h-4 w-4 text-muted-foreground' />}
          subtitle='Tổng lượng tương tác'
          isLoading={statsLoading}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='w-full sm:w-auto'>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='daily'>Hoạt động hàng ngày</TabsTrigger>
          <TabsTrigger value='users'>Thống kê người dùng</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4 mt-6'>
          <Card>
            <CardContent className='pt-6'>
              {statsLoading ? (
                <div className='h-80 w-full flex items-center justify-center'>
                  <Skeleton className='h-full w-full' />
                </div>
              ) : statsError ? (
                <Alert variant='destructive' className='mb-4'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  <AlertDescription>Không thể tải dữ liệu biểu đồ</AlertDescription>
                </Alert>
              ) : (
                <StatsChart data={telegramStats?.stats || []} />
              )}
            </CardContent>
          </Card>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt kết nối</CardTitle>
                <CardDescription>Tỷ lệ và thống kê kết nối Telegram</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUserStats ? (
                  <div className='space-y-3'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-5/6' />
                  </div>
                ) : userStatsError ? (
                  <Alert variant='destructive' className='mb-4'>
                    <AlertCircle className='h-4 w-4 mr-2' />
                    <AlertDescription>Không thể tải thống kê kết nối</AlertDescription>
                  </Alert>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Tỷ lệ kết nối Telegram</p>
                        <p className='text-2xl font-bold'>{userStats?.connectionRate?.toFixed(1) || '0'}%</p>
                      </div>
                      <div className='h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Users className='h-8 w-8 text-primary' />
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Tổng người dùng</p>
                        <p className='text-xl font-bold'>{userStats?.totalUsers || 0}</p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Đã kết nối Telegram</p>
                        <p className='text-xl font-bold'>{userStats?.connectedUsers || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê thông báo</CardTitle>
                <CardDescription>Phân tích thông báo đã gửi</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUserStats ? (
                  <div className='space-y-3'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-5/6' />
                  </div>
                ) : userStatsError ? (
                  <Alert variant='destructive' className='mb-4'>
                    <AlertCircle className='h-4 w-4 mr-2' />
                    <AlertDescription>Không thể tải thống kê thông báo</AlertDescription>
                  </Alert>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium'>Tổng thông báo đã gửi</p>
                        <p className='text-2xl font-bold'>{userStats?.totalNotifications || 0}</p>
                      </div>
                      <div className='h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center'>
                        <Bell className='h-8 w-8 text-primary' />
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <p className='text-sm font-medium'>Phân loại thông báo</p>
                      <div className='space-y-2'>
                        {loadingUserStats ? (
                          <>
                            <Skeleton className='h-3 w-full' />
                            <Skeleton className='h-3 w-4/5' />
                            <Skeleton className='h-3 w-3/4' />
                          </>
                        ) : (
                          <>
                            <div className='flex items-center justify-between text-sm'>
                              <span>Giao dịch</span>
                              <span className='font-medium'>{userStats?.notificationsByType?.transaction || 0}</span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span>Trò chơi</span>
                              <span className='font-medium'>{userStats?.notificationsByType?.game || 0}</span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span>Hệ thống</span>
                              <span className='font-medium'>{userStats?.notificationsByType?.system || 0}</span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span>Admin</span>
                              <span className='font-medium'>{userStats?.notificationsByType?.admin || 0}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='daily' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động hàng ngày</CardTitle>
              <CardDescription>Thống kê chi tiết theo từng ngày trong khoảng thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className='space-y-3'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ) : statsError ? (
                <Alert variant='destructive' className='mb-4'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  <AlertDescription>Không thể tải dữ liệu hàng ngày</AlertDescription>
                </Alert>
              ) : !telegramStats?.stats || telegramStats.stats.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>Không có dữ liệu cho khoảng thời gian này</div>
              ) : (
                <div className='rounded-md border overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Thông báo gửi</TableHead>
                        <TableHead>Kết nối mới</TableHead>
                        <TableHead>Ngắt kết nối</TableHead>
                        <TableHead>Tương tác với bot</TableHead>
                        <TableHead>Tổng hoạt động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {telegramStats.stats.map(day => (
                        <TableRow key={day.date}>
                          <TableCell>{format(new Date(day.date), 'dd/MM/yyyy', { locale: vi })}</TableCell>
                          <TableCell>{day.notifications_sent || 0}</TableCell>
                          <TableCell>
                            {day.new_connections ? (
                              <Badge variant='success' className='bg-green-100 text-green-800'>
                                +{day.new_connections}
                              </Badge>
                            ) : (
                              0
                            )}
                          </TableCell>
                          <TableCell>
                            {day.disconnections ? (
                              <Badge variant='destructive' className='bg-red-100 text-red-800'>
                                -{day.disconnections}
                              </Badge>
                            ) : (
                              0
                            )}
                          </TableCell>
                          <TableCell>{day.bot_interactions || 0}</TableCell>
                          <TableCell className='font-medium'>{day.total_activity || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className='text-xs text-muted-foreground border-t pt-4'>
              Khoảng thời gian: {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} -{' '}
              {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='users' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Thống kê người dùng Telegram</CardTitle>
              <CardDescription>Phân tích chi tiết về người dùng đã kết nối Telegram</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUserStats ? (
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-80 w-full' />
                </div>
              ) : userStatsError ? (
                <Alert variant='destructive' className='mb-4'>
                  <AlertCircle className='h-4 w-4 mr-2' />
                  <AlertDescription>Không thể tải thống kê người dùng</AlertDescription>
                </Alert>
              ) : (
                <div className='space-y-6'>
                  <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
                    <div className='border rounded-md p-4'>
                      <div className='text-sm font-medium text-muted-foreground mb-1'>Tổng người dùng</div>
                      <div className='text-2xl font-bold'>{userStats?.totalUsers || 0}</div>
                    </div>

                    <div className='border rounded-md p-4'>
                      <div className='text-sm font-medium text-muted-foreground mb-1'>Đã kết nối Telegram</div>
                      <div className='text-2xl font-bold'>{userStats?.connectedUsers || 0}</div>
                    </div>

                    <div className='border rounded-md p-4'>
                      <div className='text-sm font-medium text-muted-foreground mb-1'>Tỷ lệ kết nối</div>
                      <div className='text-2xl font-bold'>{userStats?.connectionRate?.toFixed(1) || 0}%</div>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-3'>Thống kê kết nối theo thời gian</h3>
                    <div className='border rounded-md overflow-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Người dùng mới</TableHead>
                            <TableHead>Kết nối Telegram mới</TableHead>
                            <TableHead>Tỷ lệ chuyển đổi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Hôm nay</TableCell>
                            <TableCell>{userStats?.today?.newUsers || 0}</TableCell>
                            <TableCell>{userStats?.today?.newConnections || 0}</TableCell>
                            <TableCell>
                              {userStats?.today?.newUsers
                                ? Math.round((userStats.today.newConnections / userStats.today.newUsers) * 100)
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>7 ngày qua</TableCell>
                            <TableCell>{userStats?.week?.newUsers || 0}</TableCell>
                            <TableCell>{userStats?.week?.newConnections || 0}</TableCell>
                            <TableCell>
                              {userStats?.week?.newUsers
                                ? Math.round((userStats.week.newConnections / userStats.week.newUsers) * 100)
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>30 ngày qua</TableCell>
                            <TableCell>{userStats?.month?.newUsers || 0}</TableCell>
                            <TableCell>{userStats?.month?.newConnections || 0}</TableCell>
                            <TableCell>
                              {userStats?.month?.newUsers
                                ? Math.round((userStats.month.newConnections / userStats.month.newUsers) * 100)
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Tổng cộng</TableCell>
                            <TableCell>{userStats?.totalUsers || 0}</TableCell>
                            <TableCell>{userStats?.connectedUsers || 0}</TableCell>
                            <TableCell>{userStats?.connectionRate?.toFixed(1) || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div>
                    <h3 className='text-sm font-medium mb-3'>Thống kê cài đặt thông báo Telegram</h3>
                    <div className='border rounded-md overflow-auto'>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Loại thông báo</TableHead>
                            <TableHead>Bật</TableHead>
                            <TableHead>Tắt</TableHead>
                            <TableHead>Tỷ lệ bật</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Thông báo thắng cược</TableCell>
                            <TableCell>{userStats?.notificationSettings?.win_enabled || 0}</TableCell>
                            <TableCell>{userStats?.notificationSettings?.win_disabled || 0}</TableCell>
                            <TableCell>
                              {userStats?.connectedUsers
                                ? Math.round(
                                    (userStats.notificationSettings?.win_enabled / userStats.connectedUsers) * 100
                                  )
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Thông báo nạp/rút tiền</TableCell>
                            <TableCell>{userStats?.notificationSettings?.transaction_enabled || 0}</TableCell>
                            <TableCell>{userStats?.notificationSettings?.transaction_disabled || 0}</TableCell>
                            <TableCell>
                              {userStats?.connectedUsers
                                ? Math.round(
                                    (userStats.notificationSettings?.transaction_enabled / userStats.connectedUsers) *
                                      100
                                  )
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Cảnh báo đăng nhập</TableCell>
                            <TableCell>{userStats?.notificationSettings?.login_enabled || 0}</TableCell>
                            <TableCell>{userStats?.notificationSettings?.login_disabled || 0}</TableCell>
                            <TableCell>
                              {userStats?.connectedUsers
                                ? Math.round(
                                    (userStats.notificationSettings?.login_enabled / userStats.connectedUsers) * 100
                                  )
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Thông báo hệ thống</TableCell>
                            <TableCell>{userStats?.notificationSettings?.system_enabled || 0}</TableCell>
                            <TableCell>{userStats?.notificationSettings?.system_disabled || 0}</TableCell>
                            <TableCell>
                              {userStats?.connectedUsers
                                ? Math.round(
                                    (userStats.notificationSettings?.system_enabled / userStats.connectedUsers) * 100
                                  )
                                : 0}
                              %
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
