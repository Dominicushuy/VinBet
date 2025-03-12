export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

// GET: Lấy thông tin chi tiết của một game round
export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id

    // Lấy thông tin game round
    const { data: gameRound, error } = await supabase
      .from('game_rounds')
      .select(
        `
        *,
        creator:profiles!game_rounds_created_by_fkey(id, username, display_name, avatar_url),
        bets_count:bets(count)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thông tin game round')
    }

    if (!gameRound) {
      return NextResponse.json({ error: 'Game round not found' }, { status: 404 })
    }

    return NextResponse.json({ gameRound }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thông tin game round')
  }
}

// PATCH: Cập nhật trạng thái của một game round
export async function PATCH(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kiểm tra quyền admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const id = params.id

    // Parse request body
    const body = await request.json()

    // Validate body
    const updateGameRoundSchema = z.object({
      status: z.enum(['scheduled', 'active', 'completed', 'cancelled']),
      result: z.string().optional()
    })

    const validatedData = updateGameRoundSchema.parse(body)

    // Gọi function để cập nhật game round
    const { data, error } = await supabase.rpc('update_game_round_status', {
      game_round_id: id,
      new_status: validatedData.status,
      game_result: validatedData.result
    })

    if (error) {
      return handleApiError(error, 'Lỗi khi cập nhật game round')
    }

    return NextResponse.json(
      {
        success: true,
        gameRound: data[0]
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error, 'Lỗi khi cập nhật game round')
  }
}
