export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_verification_token`)
  }

  const supabase = createRouteHandlerClient({ cookies })

  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email'
  })

  if (error) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=invalid_verification_token`)
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?verified=true`)
}
