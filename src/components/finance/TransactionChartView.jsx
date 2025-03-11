'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { format, subDays } from 'date-fns'

export function TransactionChartView({ filters }) {
  const [mounted, setMounted] = useState(false)
  const [chartType, setChartType] = useState('bar')
  const [timeRange, setTimeRange] = useState('30days')
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Colors for the chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  // Format money
  const formatMoney = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Set mounted after client-side execution
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch chart data based on filters and time range
  useEffect(() => {
    if (!mounted) return

    setIsLoading(true)

    // Prepare date range based on time range
    let startDate
    const endDate = format(new Date(), 'yyyy-MM-dd')

    switch (timeRange) {
      case '7days':
        startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
        break
      case '30days':
        startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
        break
      case '90days':
        startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
        break
      case 'all':
        // Don't set a start date, which means all data
        break
      default:
        break
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('startDate', startDate)
    queryParams.append('endDate', endDate)
    if (filters.type) queryParams.append('type', filters.type)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString())
    if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString())
    queryParams.append('chartType', chartType)
    queryParams.append('timeRange', timeRange)

    // Fetch chart data
    fetch(`/api/transactions/chart?${queryParams}`)
      .then(res => res.json())
      .then(data => {
        setChartData(data.chartData || [])
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching chart data:', error)
        // Generate mock data if API fails
        setChartData(generateMockData(chartType, timeRange))
        setIsLoading(false)
      })
  }, [filters, timeRange, chartType, mounted])

  // Generate mock data based on chart type and time range
  const generateMockData = (chartType, timeRange) => {
    // This would be replaced with real API data in production
    if (chartType === 'pie') {
      return [
        { name: 'Nạp tiền', value: 5000000 },
        { name: 'Rút tiền', value: 3000000 },
        { name: 'Đặt cược', value: 8000000 },
        { name: 'Thắng cược', value: 9500000 },
        { name: 'Thưởng giới thiệu', value: 500000 }
      ]
    } else {
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90
      return Array.from({ length: days }).map((_, i) => {
        const date = format(subDays(new Date(), days - i - 1), 'dd/MM')
        return {
          date,
          'Nạp tiền': Math.floor(Math.random() * 2000000) + 100000,
          'Rút tiền': Math.floor(Math.random() * 1500000) + 50000,
          'Đặt cược': Math.floor(Math.random() * 3000000) + 200000,
          'Thắng cược': Math.floor(Math.random() * 3500000) + 150000
        }
      })
    }
  }

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-background border p-2 rounded shadow-md'>
          {chartType !== 'pie' && <p className='text-sm font-medium'>{`Ngày: ${label}`}</p>}
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className='text-sm' style={{ color: entry.color }}>
              {`${entry.name}: ${formatMoney(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // If not mounted, show skeleton
  if (!mounted) {
    return (
      <div className='p-6'>
        <Skeleton className='h-[400px] w-full' />
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Loại biểu đồ</label>
            <Select value={chartType} onValueChange={value => setChartType(value)}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Chọn loại biểu đồ' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bar'>Cột (Bar)</SelectItem>
                <SelectItem value='line'>Đường (Line)</SelectItem>
                <SelectItem value='pie'>Tròn (Pie)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium'>Khoảng thời gian</label>
            <Select value={timeRange} onValueChange={value => setTimeRange(value)}>
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Chọn khoảng thời gian' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7days'>7 ngày gần đây</SelectItem>
                <SelectItem value='30days'>30 ngày gần đây</SelectItem>
                <SelectItem value='90days'>90 ngày gần đây</SelectItem>
                <SelectItem value='all'>Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className='h-[400px] w-full' />
      ) : (
        <div className='w-full h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis
                  tickFormatter={value =>
                    new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey='Nạp tiền' fill='#10b981' />
                <Bar dataKey='Rút tiền' fill='#ef4444' />
                <Bar dataKey='Đặt cược' fill='#6366f1' />
                <Bar dataKey='Thắng cược' fill='#f59e0b' />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis
                  tickFormatter={value =>
                    new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type='monotone' dataKey='Nạp tiền' stroke='#10b981' activeDot={{ r: 8 }} />
                <Line type='monotone' dataKey='Rút tiền' stroke='#ef4444' activeDot={{ r: 8 }} />
                <Line type='monotone' dataKey='Đặt cược' stroke='#6366f1' activeDot={{ r: 8 }} />
                <Line type='monotone' dataKey='Thắng cược' stroke='#f59e0b' activeDot={{ r: 8 }} />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
