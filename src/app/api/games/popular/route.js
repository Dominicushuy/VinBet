import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Parse query params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')

    // Lấy danh sách game rounds phổ biến dựa vào số lượng bets
    const { data, error } = await supabase
      .from('game_rounds')
      .select(
        `
        id, 
        start_time, 
        end_time, 
        status, 
        result,
        bets:bets(count)
      `
      )
      .eq('status', 'active')
      .order('bets(count)', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular games:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format data để trả về
    const gameRounds = data.map(game => ({
      id: game.id,
      start_time: game.start_time,
      end_time: game.end_time,
      status: game.status,
      result: game.result,
      participants: game.bets?.count || 0
    }))

    return NextResponse.json({
      gameRounds: gameRounds || []
    })
  } catch (error) {
    console.error('Popular games request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
