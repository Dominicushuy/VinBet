export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const offset = (page - 1) * pageSize

    // Build query
    let query = supabase
      .from('referrals')
      .select(
        `
        id,
        status,
        reward_amount,
        created_at,
        updated_at,
        referred:referred_id(
          id,
          username,
          display_name,
          avatar_url,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Execute query
    const { data: referrals, error, count } = await query

    if (error) {
      console.error('Error fetching referrals list:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      referrals: referrals || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Referrals list request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
