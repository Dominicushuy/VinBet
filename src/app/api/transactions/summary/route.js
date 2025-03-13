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

    const userId = sessionData.session.user.id

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)

    try {
      const validatedParams = getSummarySchema.parse(queryParams)

      // Set up parameters for the RPC call
      const startDate = validatedParams.startDate ? new Date(validatedParams.startDate).toISOString() : null
      const endDate = validatedParams.endDate ? new Date(validatedParams.endDate).toISOString() : null

      // Call the RPC function to get transaction summary
      const { data: summary, error } = await supabase.rpc('get_transaction_summary', {
        p_profile_id: userId,
        p_start_date: startDate,
        p_end_date: endDate
      })

      if (error) {
        return handleApiError(error, 'Lỗi khi lấy thống kê giao dịch')
      }

      const response = NextResponse.json({
        summary: summary[0] || {
          total_deposit: 0,
          total_withdrawal: 0,
          total_bet: 0,
          total_win: 0,
          total_referral_reward: 0,
          net_balance: 0
        }
      })

      // Add cache headers (2 minutes)
      response.headers.set('Cache-Control', 'max-age=120, s-maxage=120, private')

      return response
    } catch (validationError) {
      return NextResponse.json(
        {
          error: 'Lỗi validation dữ liệu',
          details: validationError.errors
        },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.errors,
          message: 'Lỗi validate dữ liệu'
        },
        { status: 400 }
      )
    }
    return handleApiError(error, 'Lỗi khi lấy thống kê giao dịch')
  }
}
