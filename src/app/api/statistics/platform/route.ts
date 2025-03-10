// src/app/api/statistics/platform/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Lấy thống kê từ database
    const { data, error } = await supabase.rpc('get_platform_statistics')

    if (error) {
      console.error('Error fetching platform statistics:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      data || {
        user_count: 0,
        total_reward_paid: 0,
        total_game_rounds: 0,
        win_rate: 0,
      }
    )
  } catch (error) {
    console.error('Platform statistics request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
