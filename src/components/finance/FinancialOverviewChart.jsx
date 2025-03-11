// src/components/finance/FinancialOverviewChart.jsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'

export function FinancialOverviewChart({ userId, period, filter }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Thiết lập màu dựa trên theme
  const [colors, setColors] = useState({
    deposit: '#10b981',
    withdrawal: '#ef4444',
    bet: '#6366f1',
    win: '#f59e0b',
    grid: '#e5e7eb',
    text: '#6b7280'
  })

  // Cập nhật màu khi theme thay đổi
  useEffect(() => {
    setMounted(true)
    if (resolvedTheme === 'dark') {
      setColors({
        deposit: '#34d399',
        withdrawal: '#f87171',
        bet: '#818cf8',
        win: '#fbbf24',
        grid: '#374151',
        text: '#9ca3af'
      })
    } else {
      setColors({
        deposit: '#10b981',
        withdrawal: '#ef4444',
        bet: '#6366f1',
        win: '#f59e0b',
        grid: '#e5e7eb',
        text: '#6b7280'
      })
    }
  }, [resolvedTheme])

  // Hàm trả về ngày bắt đầu dựa trên period
  const getStartDate = period => {
    const now = new Date()
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7)
        break
      case 'month':
        now.setDate(now.getDate() - 30)
        break
      case 'year':
        now.setFullYear(now.getFullYear() - 1)
        break
      default:
        now.setDate(now.getDate() - 30)
    }
    return now.toISOString()
  }

  // Fetch dữ liệu giao dịch từ API
  const { data, isLoading, error } = useQuery({
    queryKey: ['financialOverview', userId, period, filter],
    queryFn: async () => {
      const startDate = getStartDate(period)
      const endDate = new Date().toISOString()
      const typeParam = filter !== 'all' ? `&type=${filter}` : ''
      const response = await fetch(`/api/transactions/chart?startDate=${startDate}&endDate=${endDate}${typeParam}`)
      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }
      return response.json()
    }
  })

  // Mô phỏng dữ liệu nếu không có API hoặc đang loading
  const mockData = generateMockData(period, filter)

  // Hiển thị skeleton khi chưa mounted hoặc đang loading
  if (!mounted || isLoading) {
    return <Skeleton className='w-full h-[300px] rounded-lg' />
  }

  // Sử dụng dữ liệu thật nếu có, không thì dùng mock data
  const chartData = data?.chartData || mockData

  return (
    <div className='w-full h-[300px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id='colorDeposit' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={colors.deposit} stopOpacity={0.8} />
              <stop offset='95%' stopColor={colors.deposit} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorWithdrawal' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={colors.withdrawal} stopOpacity={0.8} />
              <stop offset='95%' stopColor={colors.withdrawal} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorBet' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={colors.bet} stopOpacity={0.8} />
              <stop offset='95%' stopColor={colors.bet} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorWin' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={colors.win} stopOpacity={0.8} />
              <stop offset='95%' stopColor={colors.win} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke={colors.grid} />
          <XAxis dataKey='date' tick={{ fill: colors.text }} />
          <YAxis tick={{ fill: colors.text }} />
          <Tooltip
            contentStyle={{
              backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: colors.grid,
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={value =>
              new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(value)
            }
          />
          <Legend />
          {(filter === 'all' || filter === 'deposit') && (
            <Area
              type='monotone'
              dataKey='deposit'
              name='Nạp tiền'
              stroke={colors.deposit}
              fillOpacity={1}
              fill='url(#colorDeposit)'
            />
          )}
          {(filter === 'all' || filter === 'withdrawal') && (
            <Area
              type='monotone'
              dataKey='withdrawal'
              name='Rút tiền'
              stroke={colors.withdrawal}
              fillOpacity={1}
              fill='url(#colorWithdrawal)'
            />
          )}
          {(filter === 'all' || filter === 'bet') && (
            <Area
              type='monotone'
              dataKey='bet'
              name='Đặt cược'
              stroke={colors.bet}
              fillOpacity={1}
              fill='url(#colorBet)'
            />
          )}
          {(filter === 'all' || filter === 'win') && (
            <Area
              type='monotone'
              dataKey='win'
              name='Thắng cược'
              stroke={colors.win}
              fillOpacity={1}
              fill='url(#colorWin)'
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Helper để tạo dữ liệu mẫu
function generateMockData(period, filter) {
  const data = []
  let days = 30

  switch (period) {
    case 'week':
      days = 7
      break
    case 'month':
      days = 30
      break
    case 'year':
      days = 12 // Sử dụng tháng thay vì ngày cho view năm
      break
  }

  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date()

    if (period === 'year') {
      // Nếu là view năm, lùi theo tháng
      date.setMonth(now.getMonth() - (days - i - 1))

      const entry = {
        date: date.toLocaleDateString('vi-VN', {
          month: 'short',
          year: '2-digit'
        })
      }

      if (filter === 'all' || filter === 'deposit') entry.deposit = Math.floor(Math.random() * 5000000) + 1000000
      if (filter === 'all' || filter === 'withdrawal') entry.withdrawal = Math.floor(Math.random() * 3000000) + 500000
      if (filter === 'all' || filter === 'bet') entry.bet = Math.floor(Math.random() * 4000000) + 2000000
      if (filter === 'all' || filter === 'win') entry.win = Math.floor(Math.random() * 7000000) + 1000000

      data.push(entry)
    } else {
      // Nếu là view tuần hoặc tháng, lùi theo ngày
      date.setDate(now.getDate() - (days - i - 1))

      const entry = {
        date: date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit'
        })
      }

      if (filter === 'all' || filter === 'deposit') entry.deposit = Math.floor(Math.random() * 2000000) + 500000
      if (filter === 'all' || filter === 'withdrawal') entry.withdrawal = Math.floor(Math.random() * 1000000) + 200000
      if (filter === 'all' || filter === 'bet') entry.bet = Math.floor(Math.random() * 1500000) + 500000
      if (filter === 'all' || filter === 'win') entry.win = Math.floor(Math.random() * 3000000) + 300000

      data.push(entry)
    }
  }

  return data
}
