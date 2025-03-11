export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { handleApiError } from '@/lib/auth/api/error-handler'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (error) {
      return handleApiError(error, 'Đăng nhập thất bại')
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
