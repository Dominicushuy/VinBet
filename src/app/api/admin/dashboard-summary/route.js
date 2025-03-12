// src/app/api/admin/dashboard-summary/route.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminApiHandler } from '@/utils/adminAuthHandler'
import { handleApiError } from '@/utils/errorHandler'

export const GET = createAdminApiHandler(async (request, _, { supabase, user }) => {
  try {
    // Get dashboard summary
    const { data: summary, error } = await supabase.rpc('get_admin_dashboard_summary')

    if (error) {
      console.error('Dashboard summary error:', error)
      return handleApiError(error, 'Lỗi khi lấy thông tin dashboard')
    }

    // Get transaction summary (last 30 days)
    const { data: transactionSummary, error: transactionError } = await supabase.rpc('get_admin_transaction_summary', {
      p_start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      p_end_date: new Date().toISOString()
    })

    if (transactionError) {
      console.error('Transaction summary error:', transactionError)
      return handleApiError(transactionError, 'Lỗi khi lấy thông tin tổng hợp giao dịch')
    }

    // Add some cache headers for better performance
    const response = NextResponse.json({
      ...summary,
      transactionSummary: transactionSummary[0] || {},
      lastUpdated: new Date().toISOString(),
      adminId: user.id // Bổ sung thông tin admin để tracking
    })

    // Add cache headers (5 minutes)
    response.headers.set('Cache-Control', 'private, max-age=300')

    return response
  } catch (error) {
    console.error('Unhandled dashboard summary error:', error)
    return handleApiError(error, 'Lỗi khi lấy thông tin dashboard')
  }
})
