export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lấy thời gian hiện tại
    const now = new Date().toISOString()

    // Lấy các game rounds đang active
    const { data: activeRounds, error: activeError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('status', 'active')
      .order('end_time', { ascending: true })
      .limit(5)

    if (activeError) {
      return handleApiError(activeError, 'Lỗi khi lấy lượt chơi đang diễn ra')
    }

    // Lấy các game rounds sắp diễn ra
    const { data: upcomingRounds, error: upcomingError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('status', 'scheduled')
      .gt('start_time', now)
      .order('start_time', { ascending: true })
      .limit(5)

    if (upcomingError) {
      return handleApiError(upcomingError, 'Lỗi khi lấy lượt chơi sắp diễn ra')
    }

    return NextResponse.json(
      {
        active: activeRounds || [],
        upcoming: upcomingRounds || []
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy danh sách lượt chơi')
  }
}
