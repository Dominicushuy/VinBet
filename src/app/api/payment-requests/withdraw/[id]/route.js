export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const requestId = params.id

    // Get withdrawal request details
    const { data: withdrawalRequest, error } = await supabase
      .from('payment_requests')
      .select(
        `
        *,
        approved_by:profiles!payment_requests_approved_by_fkey(id, username, display_name, avatar_url)
      `
      )
      .eq('id', requestId)
      .eq('type', 'withdrawal')
      .single()

    if (error) {
      return handleApiError(error, 'Error fetching withdrawal request')
    }

    // Check access rights
    if (withdrawalRequest.profile_id !== userId) {
      // Check if user is admin
      const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

      if (!profileData?.is_admin) {
        return NextResponse.json({ error: 'You do not have permission to view this request' }, { status: 403 })
      }
    }

    return NextResponse.json({ withdrawalRequest }, { status: 200 })
  } catch (error) {
    return handleApiError(error, 'Cannot fetch withdrawal request details')
  }
}
