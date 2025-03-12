export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// Đặt cược mới
export async function POST(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const gameRoundId = params.id

    // Parse body
    const body = await request.json()

    // Validate body
    const placeBetSchema = z.object({
      chosenNumber: z.string().min(1, 'Số đặt cược là bắt buộc'),
      amount: z.number().positive('Số tiền phải lớn hơn 0')
    })

    const validatedData = placeBetSchema.parse(body)

    // Gọi function để đặt cược
    const { data, error } = await supabase.rpc('place_bet', {
      p_profile_id: userId,
      p_game_round_id: gameRoundId,
      p_chosen_number: validatedData.chosenNumber,
      p_amount: validatedData.amount
    })

    if (error) {
      return handleApiError(error, 'Lỗi khi đặt cược')
    }

    // Fetch bet details
    const { data: betData, error: betError } = await supabase.from('bets').select('*').eq('id', data).single()

    if (betError) {
      return handleApiError(betError, 'Lỗi khi lấy thông tin cược')
    }

    return NextResponse.json({ bet: betData }, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'Đặt cược thất bại')
  }
}

// Lấy danh sách cược của một lượt chơi
export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gameRoundId = params.id

    // Kiểm tra quyền admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Lấy danh sách tất cả cược của lượt chơi này (chỉ admin)
    const { data: bets, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        profiles:profile_id(id, username, display_name, email, avatar_url)
      `
      )
      .eq('game_round_id', gameRoundId)
      .order('created_at', { ascending: false })

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy danh sách cược')
    }

    return NextResponse.json({ bets }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Không thể lấy danh sách cược')
  }
}
