export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request, { params }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id
    const requestId = params.id

    // Lấy thông tin chi tiết yêu cầu rút tiền
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Kiểm tra quyền truy cập
    if (withdrawalRequest.profile_id !== userId) {
      // Kiểm tra nếu là admin
      const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

      if (!profileData?.is_admin) {
        return NextResponse.json({ error: 'Bạn không có quyền xem yêu cầu này' }, { status: 403 })
      }
    }

    return NextResponse.json({ withdrawalRequest }, { status: 200 })
  } catch (error) {
    console.error('Withdrawal request detail error:', error)
    return NextResponse.json({ error: 'Không thể lấy thông tin yêu cầu rút tiền' }, { status: 500 })
  }
}
