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

    const userId = sessionData.session.user.id
    const gameRoundId = params.id

    // Lấy các cược của người dùng hiện tại cho lượt chơi này
    const { data, error } = await supabase.rpc('get_user_bets', {
      p_profile_id: userId,
      p_game_round_id: gameRoundId,
      p_page_number: 1,
      p_page_size: 100 // Giả sử không có quá nhiều cược cho một lượt chơi
    })

    if (error) {
      console.error('Error fetching user bets:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bets: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Fetch user bets error:', error)
    return NextResponse.json({ error: 'Không thể lấy danh sách cược của bạn' }, { status: 500 })
  }
}
