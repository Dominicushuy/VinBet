export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const getTransactionsSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional()
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
    const validatedParams = getTransactionsSchema.parse(queryParams)

    // Set up parameters for the RPC call
    const page = Number(validatedParams.page) || 1
    const pageSize = Number(validatedParams.pageSize) || 10
    const type = validatedParams.type || null
    const status = validatedParams.status || null
    const startDate = validatedParams.startDate ? new Date(validatedParams.startDate).toISOString() : null
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate).toISOString() : null

    // Call the RPC function to get admin transaction history
    const { data: transactions, error } = await supabase.rpc('get_admin_transaction_history', {
      p_type: type,
      p_status: status,
      p_start_date: startDate,
      p_end_date: endDate,
      p_page_number: page,
      p_page_size: pageSize
    })

    if (error) {
      console.error('Error fetching admin transactions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract total count from results for pagination
    const totalCount = transactions.length > 0 ? transactions[0].total_count : 0

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(Number(totalCount) / pageSize)
      }
    })
  } catch (error) {
    console.error('Admin transaction request error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
