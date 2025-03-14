// src/components/admin/telegram/StatsChart.jsx
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export function StatsChart({ data = [] }) {
  const [timeRange, setTimeRange] = useState('7days')
  const [chartView, setChartView] = useState('notifications')

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []

    let days
    switch (timeRange) {
      case '7days':
        days = 7
        break
      case '30days':
        days = 30
        break
      case '90days':
        days = 90
        break
      default:
        days = 7
    }

    const cutoffDate = subDays(new Date(), days)
    return data
      .filter(item => new Date(item.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        ...item,
        date: format(new Date(item.date), 'dd/MM', { locale: vi })
      }))
  }, [data, timeRange])

  const chartData = useMemo(() => {
    if (chartView === 'notifications') {
      return filteredData.map(item => ({
        date: item.date,
        'Thông báo gửi': item.notifications_sent || 0
      }))
    } else if (chartView === 'connections') {
      return filteredData.map(item => ({
        date: item.date,
        'Kết nối mới': item.new_connections || 0,
        'Ngắt kết nối': item.disconnections || 0
      }))
    } else if (chartView === 'all') {
      return filteredData.map(item => ({
        date: item.date,
        'Tổng hoạt động':
          (item.notifications_sent || 0) +
          (item.new_connections || 0) +
          (item.disconnections || 0) +
          (item.bot_interactions || 0)
      }))
    }
    return []
  }, [filteredData, chartView])

  const renderChart = () => {
    if (chartView === 'connections') {
      return (
        <ResponsiveContainer width='100%' height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='Kết nối mới' fill='#4ade80' />
            <Bar dataKey='Ngắt kết nối' fill='#f87171' />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width='100%' height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          {chartView === 'notifications' && (
            <Line type='monotone' dataKey='Thông báo gửi' stroke='#2563eb' strokeWidth={2} />
          )}
          {chartView === 'all' && <Line type='monotone' dataKey='Tổng hoạt động' stroke='#8b5cf6' strokeWidth={2} />}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Biểu đồ hoạt động Telegram</CardTitle>
            <CardDescription>Thống kê hoạt động Telegram theo thời gian</CardDescription>
          </div>
          <div className='flex items-center space-x-2'>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='7 ngày' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7days'>7 ngày</SelectItem>
                <SelectItem value='30days'>30 ngày</SelectItem>
                <SelectItem value='90days'>90 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={chartView} onValueChange={setChartView} className='mb-4'>
          <TabsList>
            <TabsTrigger value='notifications'>Thông báo</TabsTrigger>
            <TabsTrigger value='connections'>Kết nối</TabsTrigger>
            <TabsTrigger value='all'>Tổng hợp</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredData.length === 0 ? (
          <div className='flex items-center justify-center h-[350px] border rounded-md'>
            <p className='text-muted-foreground'>Không có dữ liệu cho khoảng thời gian này</p>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
      <CardFooter className='text-sm text-muted-foreground border-t px-6 py-4'>
        {timeRange === '7days' ? '7 ngày gần đây' : timeRange === '30days' ? '30 ngày gần đây' : '90 ngày gần đây'}
      </CardFooter>
    </Card>
  )
}
