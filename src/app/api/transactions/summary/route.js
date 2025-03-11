import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

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
      console.error('Error fetching transaction summary:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ summary: summary[0] || {} })
  } catch (error) {
    console.error('Transaction summary request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
