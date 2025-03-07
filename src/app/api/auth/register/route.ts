// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Gọi function register_new_user để validate trước
    const { data: validationResult, error: validationError } =
      await supabase.rpc('register_new_user', {
        email: validatedData.email,
        password: validatedData.password,
        referral_code: validatedData.referralCode,
      })

    if (validationError) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      )
    }

    // Nếu validation passed, tiến hành đăng ký qua Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: {
          referred_by: validatedData.referralCode
            ? await getReferrerId(supabase, validatedData.referralCode)
            : null,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// Helper function để lấy referrer ID từ referral code
async function getReferrerId(
  supabase: any,
  referralCode: string
): Promise<string | null> {
  const { data: referrer, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single()

  if (error) {
    console.error('Error getting referrer ID:', error.message)
    return null
  }

  return referrer?.id || null
}
