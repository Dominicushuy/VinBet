import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data } = await supabase.auth.getSession()
  return NextResponse.json(
    {
      user: data.session?.user || null
    },
    { status: 200 }
  )
}
