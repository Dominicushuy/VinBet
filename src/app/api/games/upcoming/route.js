export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Parse query params
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '6')

    // Get current time
    const now = new Date().toISOString()

    // Get upcoming game rounds
    const { data, error } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('status', 'scheduled')
      .gt('start_time', now)
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching upcoming games:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      gameRounds: data || []
    })
  } catch (error) {
    console.error('Upcoming games request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
