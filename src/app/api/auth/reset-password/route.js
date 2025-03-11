export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(6)
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.updateUser({
      password: validatedData.password
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
