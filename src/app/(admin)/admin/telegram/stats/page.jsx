'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchData } from '@/utils/fetchUtils'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsChart } from '@/components/admin/telegram/StatsChart'
import { RefreshCw, Users, Bell, MessageSquare, ChevronDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TelegramStatsPage() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch Telegram Stats
  const {
    data: statsData,
    isLoading: loadingStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['telegram', 'stats', dateRange],
    queryFn: () =>
      fetchData(
        `/api/admin/telegram/stats?startDate=${format(dateRange.from, 'yyyy-MM-dd')}&endDate=${format(
          dateRange.to,
          'yyyy-MM-dd'
        )}`
      ),
    keepPreviousData: true
  })

  // Fetch User Stats
  const { data: userStats, isLoading: loadingUserStats } = useQuery({
    queryKey: ['telegram', 'user-stats'],
    queryFn: () => fetchData('/api/admin/telegram/user-stats'),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Calculate summary stats
  const calculateSummary = () => {
    if (!statsData || !statsData.stats) return null

    const stats = statsData.stats
    const summary = statsData.summary || {}

    return {
      totalNotificationsSent: summary.total_notifications_sent || 0,
      totalNewConnections: summary.total_new_connections || 0,
      totalDisconnections: summary.total_disconnections || 0,
      totalBotInteractions: summary.total_bot_interactions || 0,
      totalActivity: stats.reduce((acc, day) => acc + day.total_activity || 0, 0),
      avgDailyNotifications: Math.round(summary.total_notifications_sent / stats.length) || 0,
      mostActiveDay:
        stats.length > 0
          ? stats.reduce((max, day) => (day.total_activity > max.total_activity ? day : max), stats[0])
          : null
    }
  }

  const summary = calculateSummary()

  return (
    <div className='space-y-6'>
      {/* Control Panel */}
      <div className='flex flex-col md:flex-row justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Thống kê Telegram</h1>
          <p className='text-muted-foreground'>Phân tích dữ liệu kết nối và hoạt động của Telegram Bot</p>
        </div>
        <div className='flex items-center gap-2'>
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          <Button variant='outline' size='icon' onClick={() => refetchStats()}>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Thông báo đã gửi</CardTitle>
            <Bell className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loadingStats ? <Skeleton className='h-6 w-20' /> : summary?.totalNotificationsSent.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>
              Trung bình {summary?.avgDailyNotifications || 0} thông báo/ngày
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Kết nối mới</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loadingStats ? <Skeleton className='h-6 w-20' /> : summary?.totalNewConnections.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>{summary?.totalDisconnections || 0} ngắt kết nối</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Lệnh Bot</CardTitle>
            <MessageSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loadingStats ? <Skeleton className='h-6 w-20' /> : summary?.totalBotInteractions.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground'>Tương tác với bot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Ngày hoạt động nhất</CardTitle>
            <ChevronDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {loadingStats ? (
                <Skeleton className='h-6 w-20' />
              ) : summary?.mostActiveDay ? (
                format(new Date(summary.mostActiveDay.date), 'dd/MM/yyyy', { locale: vi })
              ) : (
                'N/A'
              )}
            </div>
            <p className='text-xs text-muted-foreground'>
              {summary?.mostActiveDay ? summary.mostActiveDay.total_activity : 0} hoạt động
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='daily'>Hoạt động hàng ngày</TabsTrigger>
          <TabsTrigger value='users'>Thống kê người dùng</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4 mt-6'>
          <Card>
            {/* <CardHeader>
              <CardTitle>Biểu đồ hoạt động</CardTitle>
              <CardDescription>Thống kê hoạt động Telegram theo thời gian</CardDescription>
            </CardHeader> */}
            <CardContent>
              {loadingStats ? (
                <div className='h-80 w-full flex items-center justify-center'>
                  <Skeleton className='h-full w-full' />
                </div>
              ) : (
                <StatsChart data={statsData?.stats || []} />
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
              {loadingStats ? (
                <div className='space-y-3'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ) : !statsData?.stats || statsData.stats.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>Không có dữ liệu cho khoảng thời gian này</div>
              ) : (
                <div className='rounded-md border'>
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
                      {statsData.stats.map(day => (
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
              ) : (
                <div className='space-y-6'>
                  <div className='grid gap-4 md:grid-cols-3'>
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
                    <div className='border rounded-md'>
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
                    <div className='border rounded-md'>
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
