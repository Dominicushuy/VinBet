export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Lấy thống kê từ database
    const { data, error } = await supabase.rpc('get_platform_statistics')

    if (error) {
      console.error('Error fetching platform statistics:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trả về dữ liệu hoặc giá trị mặc định nếu không có
    return NextResponse.json(
      data || {
        user_count: 0,
        total_reward_paid: 0,
        total_game_rounds: 0,
        win_rate: 0
      }
    )
  } catch (error) {
    console.error('Platform statistics request error:', error)
    return handleApiError(error, 'Lỗi khi lấy thống kê nền tảng')
  }
}
