export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Call the function to get unread notification count
    const { data: count, error } = await supabase.rpc('get_unread_notification_count', {
      p_profile_id: userId
    })

    if (error) {
      return handleApiError(error, 'Error fetching notification count')
    }

    return NextResponse.json({ count })
  } catch (error) {
    return handleApiError(error, 'Notification count request error')
  }
}
