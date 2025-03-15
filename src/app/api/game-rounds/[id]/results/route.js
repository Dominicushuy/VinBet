export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'
import { sendWinTelegramNotification } from '@/utils/sendTelegramServer'

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
      return handleApiError(error, 'Lỗi khi lấy thông tin lượt chơi')
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
      return handleApiError(betStatsError, 'Lỗi khi lấy thống kê cược')
    }

    // Thêm mới: Xử lý thông báo cho người thắng cuộc nếu game đã kết thúc
    if (gameRound.status === 'completed') {
      // Tìm và thông báo tới người thắng cuộc
      const { data: winners } = await supabase
        .from('bets')
        .select('*,profiles:profile_id(id,telegram_id)')
        .eq('game_round_id', gameRoundId)
        .eq('status', 'won')

      // Gửi thông báo Telegram
      for (const winner of winners || []) {
        if (winner.profiles?.telegram_id) {
          await sendWinTelegramNotification(winner.profile_id, winner.potential_win, gameRoundId, {
            chosenNumber: winner.chosen_number,
            result: gameRound.result
          })
        }
      }
    }

    return NextResponse.json({
      gameRound,
      betStats: betStats[0] || {
        total_bets: 0,
        winning_bets: 0,
        total_bet_amount: 0,
        total_win_amount: 0
      }
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy kết quả lượt chơi')
  }
}

// Helper function to check if user is admin
async function isUserAdmin(supabase, userId) {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

  return data?.is_admin === true
}
