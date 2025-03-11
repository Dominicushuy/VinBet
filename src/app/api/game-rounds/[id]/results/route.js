import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gameRoundId = params.id

    // Lấy thông tin game round và kết quả
    const { data: gameRound, error } = await supabase
      .from('game_rounds')
      .select('id, start_time, end_time, result, status')
      .eq('id', gameRoundId)
      .single()

    if (error) {
      console.error('Error fetching game round:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!gameRound) {
      return NextResponse.json({ error: 'Game round not found' }, { status: 404 })
    }

    // Nếu game round chưa kết thúc và người dùng không phải admin
    if (gameRound.status !== 'completed' && !(await isUserAdmin(supabase, sessionData.session.user.id))) {
      return NextResponse.json({ error: 'Game round results not available yet' }, { status: 403 })
    }

    // Lấy thống kê cược
    const { data: betStats, error: betStatsError } = await supabase.rpc('get_bet_statistics_for_game', {
      p_game_round_id: gameRoundId
    })

    if (betStatsError) {
      console.error('Error fetching bet statistics:', betStatsError)
      return NextResponse.json({ error: betStatsError.message }, { status: 500 })
    }

    return NextResponse.json({
      gameRound,
      betStats: betStats || {
        total_bets: 0,
        winning_bets: 0,
        total_bet_amount: 0,
        total_win_amount: 0
      }
    })
  } catch (error) {
    console.error('Game round results request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to check if user is admin
async function isUserAdmin(supabase, userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

  return data?.is_admin === true
}
