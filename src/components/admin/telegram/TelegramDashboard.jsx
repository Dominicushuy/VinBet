// src/components/admin/telegram/TelegramDashboard.jsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { fetchData } from '@/utils/fetchUtils'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-hot-toast'

export default function TelegramDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])
  const [summary, setSummary] = useState({
    total_notifications_sent: 0,
    total_new_connections: 0,
    total_disconnections: 0,
    total_bot_interactions: 0
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [timeframe, setTimeframe] = useState('7days')

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // Fetch data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        let startDate
        const endDate = new Date().toISOString().split('T')[0]

        if (timeframe === '7days') {
          startDate = subDays(new Date(), 7).toISOString().split('T')[0]
        } else if (timeframe === '30days') {
          startDate = subDays(new Date(), 30).toISOString().split('T')[0]
        } else if (timeframe === '90days') {
          startDate = subDays(new Date(), 90).toISOString().split('T')[0]
        }

        const response = await fetchData(`/api/admin/telegram/stats?startDate=${startDate}&endDate=${endDate}`)

        if (response && response.stats) {
          // Format dates for display
          const formattedStats = response.stats.map(stat => ({
            ...stat,
            formattedDate: format(new Date(stat.date), 'dd/MM/yyyy', { locale: vi })
          }))

          setStats(formattedStats)
          setSummary(response.summary)
        }
      } catch (error) {
        console.error('Error fetching Telegram stats:', error)
        toast.error('Không thể lấy thống kê Telegram')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [timeframe])

  // Prepare pie chart data
  const pieChartData = [
    { name: 'Thông báo gửi đi', value: summary.total_notifications_sent },
    { name: 'Kết nối mới', value: summary.total_new_connections },
    { name: 'Ngắt kết nối', value: summary.total_disconnections },
    { name: 'Tương tác Bot', value: summary.total_bot_interactions }
  ]

  // Prepare line chart data from stats
  const lineChartData = stats
    .map(stat => ({
      date: stat.formattedDate,
      'Thông báo': stat.notifications_sent,
      'Kết nối mới': stat.new_connections,
      'Ngắt kết nối': stat.disconnections,
      'Tương tác': stat.bot_interactions
    }))
    .reverse() // Reverse to show chronological order

  // Tính % tăng trưởng qua các ngày
  const calculateGrowth = (currentValue, previousValue) => {
    if (previousValue === 0) return 100
    return Math.round(((currentValue - previousValue) / previousValue) * 100)
  }

  const currentNotifications = stats[0]?.notifications_sent || 0
  const previousNotifications = stats[1]?.notifications_sent || 0
  const notificationsGrowth = calculateGrowth(currentNotifications, previousNotifications)

  const currentConnections = stats[0]?.new_connections || 0
  const previousConnections = stats[1]?.new_connections || 0
  const connectionsGrowth = calculateGrowth(currentConnections, previousConnections)

  // Health check function
  const checkHealth = async () => {
    try {
      setLoading(true)
      const response = await fetchData('/api/telegram/health')

      if (response && response.success) {
        toast.success(`Bot hoạt động bình thường: @${response.bot.username}`)
      } else {
        toast.error('Có vấn đề với Bot Telegram')
      }
    } catch (error) {
      console.error('Error checking health:', error)
      toast.error('Không thể kiểm tra trạng thái Bot')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold'>Quản lý Telegram</h2>
          <Skeleton className='h-10 w-32' />
        </div>

        <div className='grid gap-6 grid-cols-1 md:grid-cols-4'>
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-24' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16' />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
          </CardHeader>
          <CardContent className='h-80'>
            <Skeleton className='h-full w-full' />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Quản lý Telegram</h2>
        <Button onClick={checkHealth}>Kiểm tra kết nối</Button>
      </div>

      <div className='grid gap-6 grid-cols-1 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Thông báo gửi đi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summary.total_notifications_sent}</div>
            <p className={`text-xs ${notificationsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {notificationsGrowth >= 0 ? '+' : ''}
              {notificationsGrowth}% so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Kết nối mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summary.total_new_connections}</div>
            <p className={`text-xs ${connectionsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {connectionsGrowth >= 0 ? '+' : ''}
              {connectionsGrowth}% so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Tương tác Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summary.total_bot_interactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Ngắt kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summary.total_disconnections}</div>
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center justify-end space-x-2'>
        <Button variant={timeframe === '7days' ? 'default' : 'outline'} onClick={() => setTimeframe('7days')}>
          7 ngày
        </Button>
        <Button variant={timeframe === '30days' ? 'default' : 'outline'} onClick={() => setTimeframe('30days')}>
          30 ngày
        </Button>
        <Button variant={timeframe === '90days' ? 'default' : 'outline'} onClick={() => setTimeframe('90days')}>
          90 ngày
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='charts'>Biểu đồ</TabsTrigger>
          <TabsTrigger value='data'>Dữ liệu chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan hoạt động Telegram</CardTitle>
              <CardDescription>
                Thống kê trong {timeframe === '7days' ? '7 ngày' : timeframe === '30days' ? '30 ngày' : '90 ngày'} qua
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-6 grid-cols-1 md:grid-cols-2'>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx='50%'
                      cy='50%'
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={lineChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='Thông báo' fill='#0088FE' />
                    <Bar dataKey='Tương tác' fill='#FFBB28' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='charts'>
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ xu hướng</CardTitle>
              <CardDescription>Biểu đồ thống kê theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-96'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type='monotone' dataKey='Thông báo' stroke='#0088FE' activeDot={{ r: 8 }} />
                    <Line type='monotone' dataKey='Kết nối mới' stroke='#00C49F' />
                    <Line type='monotone' dataKey='Ngắt kết nối' stroke='#FF8042' />
                    <Line type='monotone' dataKey='Tương tác' stroke='#FFBB28' />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='data'>
          <Card>
            <CardHeader>
              <CardTitle>Dữ liệu thống kê chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Thống kê Telegram theo ngày</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Thông báo</TableHead>
                    <TableHead>Kết nối mới</TableHead>
                    <TableHead>Ngắt kết nối</TableHead>
                    <TableHead>Tương tác Bot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map(stat => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.formattedDate}</TableCell>
                      <TableCell>{stat.notifications_sent}</TableCell>
                      <TableCell>{stat.new_connections}</TableCell>
                      <TableCell>{stat.disconnections}</TableCell>
                      <TableCell>{stat.bot_interactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
