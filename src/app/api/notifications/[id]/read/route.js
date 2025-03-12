export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function POST(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const notificationId = params.id

    // Call the function to mark notification as read
    const { data: success, error } = await supabase.rpc('mark_notification_read', {
      p_notification_id: notificationId,
      p_profile_id: userId
    })

    if (error) {
      return handleApiError(error, 'Error marking notification as read')
    }

    if (!success) {
      return NextResponse.json({ error: 'Notification not found or not yours' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Mark notification read error')
  }
}
