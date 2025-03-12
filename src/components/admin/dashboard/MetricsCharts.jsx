import { useMemo } from 'react'
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
  ComposedChart,
  Area
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { formatCurrency } from '@/utils/formatUtils'

export function MetricsCharts({ data, interval, visibleCharts }) {
  const formatValue = value => {
    return new Intl.NumberFormat('vi-VN', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value)
  }

  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      time_period: format(
        parseISO(item.time_period),
        interval === 'day' ? 'dd/MM' : interval === 'week' ? 'dd/MM' : 'MM/yyyy',
        { locale: vi }
      )
    }))
  }, [data, interval])

  if (processedData.length === 0) {
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
        <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
        <XAxis dataKey='time_period' />

        {/* Revenue Y-axis */}
        {visibleCharts.includes('revenue') && (
          <YAxis yAxisId='revenue' orientation='left' tickFormatter={formatValue} stroke='#8884d8' />
        )}

        {/* Users Y-axis */}
        {visibleCharts.includes('users') && (
          <YAxis yAxisId='users' orientation='right' tickFormatter={formatValue} stroke='#82ca9d' />
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
            <Bar yAxisId='revenue' dataKey='revenue' name='Doanh thu' fill='#8884d8' barSize={20} />
            <Line
              yAxisId='revenue'
              type='monotone'
              dataKey='total_deposits'
              name='Nạp tiền'
              stroke='#ffc658'
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId='revenue'
              type='monotone'
              dataKey='total_withdrawals'
              name='Rút tiền'
              stroke='#ff8042'
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
            stroke='#82ca9d'
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
            fill='#8884d8'
            fillOpacity={0.2}
            stroke='#8884d8'
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
