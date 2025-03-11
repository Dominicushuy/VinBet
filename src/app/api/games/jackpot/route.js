export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()

    // Lấy jackpot hiện tại từ database
    const { data, error } = await supabase.rpc('calculate_current_jackpot')

    if (error) {
      console.error('Error calculating jackpot:', error)
      return NextResponse.json(
        { error: error.message, jackpotAmount: 100000000 },
        { status: 200 } // Vẫn trả về 200 nhưng với giá trị mặc định
      )
    }

    return NextResponse.json({
      jackpotAmount: data?.jackpot_amount || 100000000
    })
  } catch (error) {
    console.error('Jackpot calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', jackpotAmount: 100000000 },
      { status: 200 } // Vẫn trả về 200 nhưng với giá trị mặc định
    )
  }
}
