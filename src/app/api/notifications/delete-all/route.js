import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Build query
    let query = supabase.from('notifications').delete().eq('profile_id', userId)

    // Add type filter if provided
    if (type) {
      query = query.eq('type', type)
    }

    // Execute query
    const { error } = await query

    if (error) {
      console.error('Error deleting all notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete all notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
