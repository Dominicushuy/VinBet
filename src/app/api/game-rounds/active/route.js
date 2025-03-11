import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
      console.error('Error fetching active game rounds:', activeError)
      return NextResponse.json({ error: activeError.message }, { status: 500 })
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
      console.error('Error fetching upcoming game rounds:', upcomingError)
      return NextResponse.json({ error: upcomingError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        active: activeRounds || [],
        upcoming: upcomingRounds || []
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Active game rounds request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
