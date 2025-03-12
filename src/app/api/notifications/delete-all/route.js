export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
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
      return handleApiError(error, 'Error deleting all notifications')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Delete all notifications error')
  }
}
