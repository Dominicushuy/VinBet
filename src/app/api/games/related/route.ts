// src/app/api/games/related/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Parse query params
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const status = url.searchParams.get('status') || 'active'
    const limit = parseInt(url.searchParams.get('limit') || '5')

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // Get related games with similar time period
    const { data, error } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('status', status)
      .not('id', 'eq', id) // Exclude current game
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching related games:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      gameRounds: data || [],
    })
  } catch (error) {
    console.error('Related games request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
