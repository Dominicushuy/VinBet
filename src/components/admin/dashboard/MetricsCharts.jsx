import { useMemo } from 'react'
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { formatCurrency } from '@/utils/formatUtils'
import { useTheme } from 'next-themes'

export function MetricsCharts({ data, interval, visibleCharts }) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  // Các màu theo theme
  const colors = {
    revenue: isDarkMode ? '#a78bfa' : '#8884d8', // violet/purple
    deposits: isDarkMode ? '#fbbf24' : '#ffc658', // amber/yellow
    withdrawals: isDarkMode ? '#f97316' : '#ff8042', // orange
    users: isDarkMode ? '#4ade80' : '#82ca9d', // green
    grid: isDarkMode ? '#374151' : '#f0f0f0' // gray for grid
  }

  const formatValue = value => {
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []

    return data.map(item => {
      try {
        // Nếu time_period có thể parse được
        if (item.time_period) {
          return {
            ...item,
            time_period: format(
              parseISO(item.time_period),
              interval === 'day' ? 'dd/MM' : interval === 'week' ? 'dd/MM' : 'MM/yyyy',
              { locale: vi }
            )
          }
        }
        // Trường hợp không parse được, trả về nguyên giá trị
        return item
      } catch (error) {
        console.error('Error parsing date:', error)
        return item
      }
    })
  }, [data, interval])

  if (!processedData || processedData.length === 0) {
    return (
      <div className='flex justify-center items-center h-full'>
        <p className='text-muted-foreground'>Không có dữ liệu</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <ComposedChart
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20
        }}
      >
        <CartesianGrid strokeDasharray='3 3' stroke={colors.grid} />
        <XAxis dataKey='time_period' />

        {/* Revenue Y-axis */}
        {visibleCharts.includes('revenue') && (
          <YAxis yAxisId='revenue' orientation='left' tickFormatter={formatValue} stroke={colors.revenue} />
        )}

        {/* Users Y-axis */}
        {visibleCharts.includes('users') && (
          <YAxis yAxisId='users' orientation='right' tickFormatter={formatValue} stroke={colors.users} />
        )}

        <Tooltip
          formatter={(value, name) => {
            if (name === 'Doanh thu' || name === 'Nạp tiền' || name === 'Rút tiền') {
              return [formatCurrency(Number(value)), name]
            }
            return [value, name]
          }}
        />
        <Legend />

        {/* Revenue Data */}
        {visibleCharts.includes('revenue') && (
          <>
            <Bar yAxisId='revenue' dataKey='revenue' name='Doanh thu' fill={colors.revenue} barSize={20} />
            <Line
              yAxisId='revenue'
              type='monotone'
              dataKey='total_deposits'
              name='Nạp tiền'
              stroke={colors.deposits}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId='revenue'
              type='monotone'
              dataKey='total_withdrawals'
              name='Rút tiền'
              stroke={colors.withdrawals}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </>
        )}

        {/* Users Data */}
        {visibleCharts.includes('users') && (
          <Line
            yAxisId='users'
            type='monotone'
            dataKey='new_users'
            name='Người dùng mới'
            stroke={colors.users}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        )}

        {/* Bets Data */}
        {visibleCharts.includes('bets') && (
          <Area
            yAxisId='revenue'
            type='monotone'
            dataKey='total_bet_amount'
            name='Tổng cược'
            fill={colors.revenue}
            fillOpacity={0.2}
            stroke={colors.revenue}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
