// src/components/admin/Charts.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

interface AdminChartsProps {
  metrics: any[]
  isLoading: boolean
}

export function AdminCharts({ metrics, isLoading }: AdminChartsProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week')

  // Format tiền Việt Nam
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Xử lý dữ liệu cho biểu đồ
  const processChartData = (data: any[]) => {
    return data.map((item) => ({
      ...item,
      time_period: format(
        parseISO(item.time_period),
        dateRange === 'week'
          ? 'dd/MM'
          : dateRange === 'month'
          ? 'dd/MM'
          : 'MM/yyyy',
        { locale: vi }
      ),
    }))
  }

  // Dữ liệu đã xử lý
  const processedData = metrics ? processChartData(metrics) : []

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className='col-span-1'>
            <CardHeader>
              <CardTitle>
                <Skeleton className='h-5 w-[200px]' />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className='h-[300px] w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Revenue Chart */}
      <Card className='col-span-1'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Doanh thu</CardTitle>
          <Tabs
            defaultValue='week'
            onValueChange={(value) => setDateRange(value as any)}>
            <TabsList className='grid w-[200px] grid-cols-3'>
              <TabsTrigger value='week'>Tuần</TabsTrigger>
              <TabsTrigger value='month'>Tháng</TabsTrigger>
              <TabsTrigger value='year'>Năm</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              data={processedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='time_period' />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  'Doanh thu',
                ]}
              />
              <Legend />
              <Bar
                name='Doanh thu'
                dataKey='revenue'
                fill='#8884d8'
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User & Bets Chart */}
      <Card className='col-span-1'>
        <CardHeader>
          <CardTitle>Người dùng & Cược</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart
              data={processedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='time_period' />
              <YAxis yAxisId='left' />
              <YAxis
                yAxisId='right'
                orientation='right'
                tickFormatter={(value) =>
                  new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
              />
              <Tooltip />
              <Legend />
              <Line
                name='Người dùng mới'
                type='monotone'
                dataKey='new_users'
                stroke='#8884d8'
                yAxisId='left'
              />
              <Line
                name='Số cược'
                type='monotone'
                dataKey='total_bets'
                stroke='#82ca9d'
                yAxisId='right'
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Deposits & Withdrawals Chart */}
      <Card className='col-span-1 md:col-span-2'>
        <CardHeader>
          <CardTitle>Nạp/Rút tiền</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              data={processedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='time_period' />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat('vi-VN', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), '']}
              />
              <Legend />
              <Bar
                name='Nạp tiền'
                dataKey='total_deposits'
                fill='#82ca9d'
                barSize={20}
              />
              <Bar
                name='Rút tiền'
                dataKey='total_withdrawals'
                fill='#ff7c43'
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
