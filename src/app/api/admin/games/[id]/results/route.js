export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const gameResultSchema = z.object({
  result: z.string().min(1, 'Kết quả là bắt buộc'),
  notes: z.string().optional()
})

export async function POST(request, { params }) {
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

    const gameId = params.id

    // Validate game exists and can be completed
    const { data: game, error: gameError } = await supabase
      .from('game_rounds')
      .select('id, status')
      .eq('id', gameId)
      .single()

    if (gameError || !game) {
      console.error('Error fetching game:', gameError)
      return NextResponse.json({ error: gameError?.message || 'Game not found' }, { status: 404 })
    }

    if (game.status !== 'active') {
      return NextResponse.json({ error: 'Only active games can be completed with results' }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const validatedData = gameResultSchema.parse(body)

    // Update game round status with result
    const { data, error } = await supabase.rpc('update_game_round_status', {
      game_round_id: gameId,
      new_status: 'completed',
      game_result: validatedData.result
    })

    if (error) {
      console.error('Error setting game result:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create admin log entry
    await supabase.from('admin_logs').insert({
      admin_id: sessionData.session.user.id,
      action: 'COMPLETE_GAME',
      entity_type: 'game_rounds',
      entity_id: gameId,
      details: {
        result: validatedData.result,
        notes: validatedData.notes
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Game result set successfully',
      game: data[0]
    })
  } catch (error) {
    console.error('Set game result error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
