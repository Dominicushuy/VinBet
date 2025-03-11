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

    // Lấy thông tin game round
    const { data: gameRound, error: gameError } = await supabase
      .from('game_rounds')
      .select('status, result')
      .eq('id', gameRoundId)
      .single()

    if (gameError) {
      console.error('Error fetching game round:', gameError)
      return NextResponse.json({ error: gameError.message }, { status: 500 })
    }

    if (!gameRound) {
      return NextResponse.json({ error: 'Game round not found' }, { status: 404 })
    }

    // Nếu game chưa hoàn thành và người dùng không phải admin
    if (gameRound.status !== 'completed' && !(await isUserAdmin(supabase, sessionData.session.user.id))) {
      return NextResponse.json({ error: 'Game round has not been completed yet' }, { status: 403 })
    }

    // Lấy danh sách người thắng cuộc
    const { data: winners, error: winnersError } = await supabase
      .from('bets')
      .select(
        `
        id,
        amount,
        chosen_number,
        potential_win,
        created_at,
        profiles:profile_id (
          id, 
          username, 
          display_name, 
          avatar_url
        )
      `
      )
      .eq('game_round_id', gameRoundId)
      .eq('status', 'won')
      .order('potential_win', { ascending: false })

    if (winnersError) {
      console.error('Error fetching winners:', winnersError)
      return NextResponse.json({ error: winnersError.message }, { status: 500 })
    }

    return NextResponse.json({
      gameRound,
      winners: winners || []
    })
  } catch (error) {
    console.error('Game round winners request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to check if user is admin
async function isUserAdmin(supabase, userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

  return data?.is_admin === true
}
