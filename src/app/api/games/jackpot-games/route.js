import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Parse query params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')

    // Lấy thời gian hiện tại
    const now = new Date()

    // Jackpot games là những lượt chơi có thời gian dài (24+ giờ)
    // hoặc có tổng tiền đặt cược cao
    const { data, error } = await supabase.rpc('get_jackpot_games', {
      p_limit: limit
    })

    if (error) {
      console.error('Error fetching jackpot games:', error)

      // Fallback nếu RPC function chưa được tạo
      // Lấy các game có khoảng thời gian dài
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('game_rounds')
        .select(
          `
          id,
          start_time,
          end_time,
          status,
          result
        `
        )
        .eq('status', 'active')
        .gt('end_time', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('end_time', { ascending: false })
        .limit(limit)

      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }

      return NextResponse.json({
        gameRounds:
          fallbackData.map(game => ({
            ...game,
            isJackpot: true
          })) || []
      })
    }

    return NextResponse.json({
      gameRounds:
        data.map(game => ({
          ...game,
          isJackpot: true
        })) || []
    })
  } catch (error) {
    console.error('Jackpot games request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
