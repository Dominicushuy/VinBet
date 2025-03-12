export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permission
    const { data: profileData } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessionData.session.user.id)
      .single()

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Get dashboard summary
    const { data: summary, error } = await supabase.rpc('get_admin_dashboard_summary')

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thông tin dashboard')
    }

    // Get transaction summary (last 30 days)
    const { data: transactionSummary, error: transactionError } = await supabase.rpc('get_admin_transaction_summary', {
      p_start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      p_end_date: new Date().toISOString()
    })

    if (transactionError) {
      return handleApiError(transactionError, 'Lỗi khi lấy thông tin tổng hợp giao dịch')
    }

    return NextResponse.json({
      ...summary,
      transactionSummary: transactionSummary[0] || {}
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thông tin dashboard')
  }
}
