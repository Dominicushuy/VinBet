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
import { useTheme } from 'next-themes'

export function MetricsCharts({ data, interval, visibleCharts }) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  // Màu sắc theo theme
  const colors = {
    revenue: isDarkMode ? '#a78bfa' : '#8884d8', // violet/purple
    deposit: isDarkMode ? '#fbbf24' : '#ffc658', // amber/yellow
    withdrawal: isDarkMode ? '#f97316' : '#ff8042', // orange
    users: isDarkMode ? '#4ade80' : '#82ca9d', // green
    bets: isDarkMode ? '#ec4899' : '#f472b6', // pink
    grid: isDarkMode ? '#374151' : '#f0f0f0', // gray for grid
    area: isDarkMode ? 'rgba(167, 139, 250, 0.2)' : 'rgba(136, 132, 216, 0.15)'
  }

  // Format số liệu hiển thị ngắn gọn
  const formatValue = value => {
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return []

    return data.map(item => {
      try {
        // Format định dạng thời gian phù hợp theo interval
        if (item.time_period) {
          const formatPattern = interval === 'day' ? 'dd/MM' : interval === 'week' ? 'dd/MM' : 'MM/yyyy'

          return {
            ...item,
            time_period: format(parseISO(item.time_period), formatPattern, { locale: vi })
          }
        }
        return item
      } catch (error) {
        console.error('Error parsing date:', error)
        return item
      }
    })
  }, [data, interval])

  if (!processedData || processedData.length === 0) {
    return (
      <div className='flex justify-center items-center h-full bg-muted/10 rounded-md'>
        <p className='text-muted-foreground'>Không có dữ liệu thống kê</p>
      </div>
    )
  }

  // Custom tooltip hiển thị thông tin chi tiết khi hover
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null

    return (
      <div className='bg-background border rounded-md shadow-md p-3 text-sm'>
        <p className='font-medium'>{label}</p>
        <div className='mt-2 space-y-1'>
          {payload.map((entry, index) => (
            <div key={index} className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-sm' style={{ backgroundColor: entry.color }}></div>
              <p className='font-medium'>
                {entry.name}: {entry.value.toLocaleString('vi-VN')}
                {entry.name.includes('Doanh thu') ||
                entry.name.includes('Nạp tiền') ||
                entry.name.includes('Rút tiền') ||
                entry.name.includes('Tổng cược')
                  ? ' ₫'
                  : ''}
              </p>
            </div>
          ))}
        </div>
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
        <defs>
          <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor={colors.revenue} stopOpacity={0.3} />
            <stop offset='95%' stopColor={colors.revenue} stopOpacity={0} />
          </linearGradient>
          <linearGradient id='betsGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor={colors.bets} stopOpacity={0.3} />
            <stop offset='95%' stopColor={colors.bets} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray='3 3' stroke={colors.grid} opacity={0.7} />
        <XAxis
          dataKey='time_period'
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: colors.grid, strokeWidth: 1 }}
          tickLine={{ stroke: colors.grid }}
        />

        {/* Revenue Y-axis */}
        {visibleCharts.includes('revenue') && (
          <YAxis
            yAxisId='revenue'
            orientation='left'
            tickFormatter={formatValue}
            stroke={colors.revenue}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: colors.grid, strokeWidth: 1 }}
            tickLine={{ stroke: colors.grid }}
          />
        )}

        {/* Users Y-axis */}
        {visibleCharts.includes('users') && (
          <YAxis
            yAxisId='users'
            orientation='right'
            tickFormatter={formatValue}
            stroke={colors.users}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: colors.grid, strokeWidth: 1 }}
            tickLine={{ stroke: colors.grid }}
          />
        )}

        {/* Bets Y-axis - reuse revenue axis */}
        {visibleCharts.includes('bets') && (
          <YAxis
            yAxisId='revenue'
            orientation='left'
            tickFormatter={formatValue}
            stroke={colors.revenue}
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: colors.grid, strokeWidth: 1 }}
            tickLine={{ stroke: colors.grid }}
          />
        )}

        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconSize={10} iconType='circle' />

        {/* Revenue Data */}
        {visibleCharts.includes('revenue') && (
          <>
            <Bar
              yAxisId='revenue'
              dataKey='revenue'
              name='Doanh thu'
              fill={colors.revenue}
              barSize={20}
              radius={[2, 2, 0, 0]}
              fillOpacity={0.9}
            />
            <Line
              yAxisId='revenue'
              type='monotone'
              dataKey='total_deposits'
              name='Nạp tiền'
              stroke={colors.deposit}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5, strokeWidth: 1 }}
            />
            <Line
              yAxisId='revenue'
              type='monotone'
              dataKey='total_withdrawals'
              name='Rút tiền'
              stroke={colors.withdrawal}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5, strokeWidth: 1 }}
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
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5, strokeWidth: 1 }}
          />
        )}

        {/* Bets Data */}
        {visibleCharts.includes('bets') && (
          <Area
            yAxisId='revenue'
            type='monotone'
            dataKey='total_bet_amount'
            name='Tổng cược'
            fill='url(#betsGradient)'
            stroke={colors.bets}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1, fill: colors.bets }}
            activeDot={{ r: 5, strokeWidth: 1 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
