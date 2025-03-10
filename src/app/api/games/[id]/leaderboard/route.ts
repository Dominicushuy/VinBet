// src/app/api/games/[id]/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gameId = params.id

    // Lấy top người đặt cược nhiều nhất
    const { data: topBets, error: topBetsError } = await supabase
      .from('bets')
      .select(
        `
        id,
        amount,
        chosen_number,
        created_at,
        profile:profiles!bets_profile_id_fkey (
          id, 
          username, 
          display_name, 
          avatar_url
        )
      `
      )
      .eq('game_round_id', gameId)
      .order('amount', { ascending: false })
      .limit(10)

    if (topBetsError) {
      console.error('Error fetching top bets:', topBetsError)
      return NextResponse.json({ error: topBetsError.message }, { status: 500 })
    }

    // Lấy top người thắng cuộc
    const { data: topWinners, error: topWinnersError } = await supabase
      .from('bets')
      .select(
        `
        id,
        amount,
        chosen_number,
        potential_win,
        created_at,
        profile:profiles!bets_profile_id_fkey (
          id, 
          username, 
          display_name, 
          avatar_url
        )
      `
      )
      .eq('game_round_id', gameId)
      .eq('status', 'won')
      .order('potential_win', { ascending: false })
      .limit(10)

    if (topWinnersError) {
      console.error('Error fetching top winners:', topWinnersError)
      return NextResponse.json(
        { error: topWinnersError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      topBets: topBets || [],
      topWinners: topWinners || [],
    })
  } catch (error) {
    console.error('Game leaderboard request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
