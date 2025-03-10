// src/app/api/admin/dashboard-summary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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
    const { data: summary, error } = await supabase.rpc(
      'get_admin_dashboard_summary'
    )

    if (error) {
      console.error('Error fetching dashboard summary:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get transaction summary (last 30 days)
    const { data: transactionSummary, error: transactionError } =
      await supabase.rpc('get_admin_transaction_summary', {
        p_start_date: new Date(
          new Date().setDate(new Date().getDate() - 30)
        ).toISOString(),
        p_end_date: new Date().toISOString(),
      })

    if (transactionError) {
      console.error('Error fetching transaction summary:', transactionError)
      return NextResponse.json(
        { error: transactionError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...summary,
      transactionSummary: transactionSummary[0] || {},
    })
  } catch (error) {
    console.error('Dashboard summary request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
