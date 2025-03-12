export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get recent winners
    const { data: winners, error } = await supabase
      .from('bets')
      .select(
        `
        id,
        amount,
        potential_win,
        created_at,
        profiles:profile_id(id, username, display_name, avatar_url),
        game_rounds:game_round_id(id, result)
      `
      )
      .eq('status', 'won')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching recent winners:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      winners: winners || []
    })
  } catch (error) {
    console.error('Recent winners request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
