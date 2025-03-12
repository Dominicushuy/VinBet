export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const chartDataSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  chartType: z.enum(['bar', 'line', 'pie']).optional().default('bar'),
  timeRange: z.enum(['7days', '30days', '90days']).optional().default('30days')
})

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = chartDataSchema.parse(queryParams)

    // Tính toán ngày
    let days = 30
    switch (validatedParams.timeRange) {
      case '7days':
        days = 7
        break
      case '30days':
        days = 30
        break
      case '90days':
        days = 90
        break
    }

    // Nếu là biểu đồ tròn (pie chart), trả về dữ liệu tổng hợp
    if (validatedParams.chartType === 'pie') {
      // Xây dựng truy vấn cho từng loại giao dịch
      const requests = [
        { type: 'deposit', status: 'completed' },
        { type: 'withdrawal', status: 'completed' },
        { type: 'bet', status: 'completed' },
        { type: 'win', status: 'completed' },
        { type: 'referral_reward', status: 'completed' }
      ].map(async config => {
        let query = supabase
          .from('transactions')
          .select('amount')
          .eq('profile_id', userId)
          .eq('type', config.type)
          .eq('status', config.status)

        // Áp dụng bộ lọc ngày nếu được cung cấp
        if (validatedParams.startDate) {
          query = query.gte('created_at', new Date(validatedParams.startDate).toISOString())
        }
        if (validatedParams.endDate) {
          query = query.lte('created_at', new Date(validatedParams.endDate).toISOString())
        }

        return query
      })

      // Thực thi các truy vấn
      const results = await Promise.all(requests)

      // Tính toán tổng cho mỗi loại
      const chartData = [
        {
          name: 'Nạp tiền',
          value: results[0].data?.reduce((sum, item) => sum + item.amount, 0) || 0
        },
        {
          name: 'Rút tiền',
          value: results[1].data?.reduce((sum, item) => sum + item.amount, 0) || 0
        },
        {
          name: 'Đặt cược',
          value: results[2].data?.reduce((sum, item) => sum + item.amount, 0) || 0
        },
        {
          name: 'Thắng cược',
          value: results[3].data?.reduce((sum, item) => sum + item.amount, 0) || 0
        },
        {
          name: 'Thưởng giới thiệu',
          value: results[4].data?.reduce((sum, item) => sum + item.amount, 0) || 0
        }
      ].filter(item => item.value > 0)

      return NextResponse.json({ chartData })
    }

    // Cho biểu đồ thanh/đường
    // Tạo danh sách ngày
    const chartData = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'dd/MM', { locale: vi })

      chartData.push({
        date: dateStr,
        'Nạp tiền': 0,
        'Rút tiền': 0,
        'Đặt cược': 0,
        'Thắng cược': 0
      })
    }

    // Lấy dữ liệu giao dịch theo ngày
    const { data: dailyStats, error } = await supabase.rpc('get_daily_transaction_stats', {
      p_profile_id: userId,
      p_days: days
    })

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thống kê giao dịch theo ngày')
    }

    // Điền dữ liệu vào biểu đồ
    if (dailyStats && dailyStats.length > 0) {
      dailyStats.forEach(stat => {
        const dateStr = format(new Date(stat.date), 'dd/MM', { locale: vi })
        const dayIndex = chartData.findIndex(day => day.date === dateStr)

        if (dayIndex !== -1) {
          switch (stat.type) {
            case 'deposit':
              chartData[dayIndex]['Nạp tiền'] = stat.total_amount
              break
            case 'withdrawal':
              chartData[dayIndex]['Rút tiền'] = stat.total_amount
              break
            case 'bet':
              chartData[dayIndex]['Đặt cược'] = stat.total_amount
              break
            case 'win':
              chartData[dayIndex]['Thắng cược'] = stat.total_amount
              break
          }
        }
      })
    }

    return NextResponse.json({ chartData })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors,
          message: 'Lỗi validate dữ liệu'
        },
        { status: 400 }
      )
    }
    return handleApiError(error, 'Lỗi khi lấy dữ liệu biểu đồ')
  }
}
