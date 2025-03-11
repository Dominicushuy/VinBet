import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = forgotPasswordSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/reset-password`
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Lỗi khi gửi email đặt lại mật khẩu' }, { status: 500 })
  }
}
