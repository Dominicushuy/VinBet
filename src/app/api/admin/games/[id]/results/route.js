// src/app/api/admin/games/[id]/results/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả là bắt buộc'),
  notes: z.string().optional()
})

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request, { params }) {
  try {
    // Validate gameId format
    const gameId = params.id
    if (!gameId || !uuidRegex.test(gameId)) {
      return NextResponse.json({ error: 'Invalid game ID format' }, { status: 400 })
    }

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

    // Validate game exists and can be completed
    const { data: game, error: gameError } = await supabase
      .from('game_rounds')
      .select('id, status, end_time')
      .eq('id', gameId)
      .single()

    if (gameError || !game) {
      return handleApiError(gameError, 'Game not found')
    }

    if (game.status !== 'active') {
      return NextResponse.json({ error: 'Only active games can be completed with results' }, { status: 400 })
    }

    // Check if game has ended
    const now = new Date()
    const endTime = new Date(game.end_time)
    if (now < endTime) {
      return NextResponse.json(
        {
          error: 'Game has not ended yet. Results can only be set after the end time.'
        },
        { status: 400 }
      )
    }

    // Parse and validate request body
    let validatedData
    try {
      const body = await request.json()
      validatedData = gameResultSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid input data',
            details: error.errors
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Update game round status with result
    const { data, error } = await supabase.rpc('update_game_round_status', {
      game_round_id: gameId,
      new_status: 'completed',
      game_result: validatedData.result
    })

    if (error) {
      return handleApiError(error, 'Lỗi khi cập nhật kết quả trò chơi')
    }

    // Create admin log entry
    await supabase.from('admin_logs').insert({
      admin_id: sessionData.session.user.id,
      action: 'COMPLETE_GAME',
      entity_type: 'game_rounds',
      entity_id: gameId,
      details: {
        result: validatedData.result,
        notes: validatedData.notes,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Game result set successfully',
      game: data[0]
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi thiết lập kết quả trò chơi')
  }
}
