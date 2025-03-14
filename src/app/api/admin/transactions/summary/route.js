export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/utils/errorHandler'

const getSummarySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export async function GET(request) {
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

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const validatedParams = getSummarySchema.parse(queryParams)

    // Set up parameters for the RPC call
    const startDate = validatedParams.startDate ? new Date(validatedParams.startDate).toISOString() : null
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate).toISOString() : null

    // Call the RPC function to get admin transaction summary
    const { data: summary, error } = await supabase.rpc('get_transaction_summary', {
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy thông tin tổng hợp giao dịch')
    }

    return NextResponse.json({ summary: summary[0] || {} })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thông tin tổng hợp giao dịch')
  }
}
