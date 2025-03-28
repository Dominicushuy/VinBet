export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Call the function to mark all notifications as read
    const { data: success, error } = await supabase.rpc('mark_all_notifications_read', {
      p_profile_id: userId
    })

    if (error) {
      return handleApiError(error, 'Error marking all notifications as read')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Mark all notifications read error')
  }
}
