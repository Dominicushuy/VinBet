export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { supabaseAdmin } from '@/lib/supabase/admin'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional()
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const supabase = createRouteHandlerClient({ cookies })

    // Gọi function register_new_user để validate trước
    const { data: validationResult, error: validationError } = await supabase.rpc('register_new_user', {
      email: validatedData.email,
      password: validatedData.password,
      referral_code: validatedData.referralCode
    })

    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }

    // Lấy referrer ID nếu có mã giới thiệu
    const referredBy = validatedData.referralCode ? await getReferrerId(supabase, validatedData.referralCode) : null

    // Nếu validation passed, tiến hành đăng ký qua Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
        data: {
          referred_by: referredBy
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Tạo profile ngay sau khi đăng ký thành công
    if (data?.user) {
      // Tạo mã giới thiệu ngẫu nhiên
      const referralCode = nanoid(8)

      // Tạo profile mới
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: data.user.id,
        email: validatedData.email,
        username: generateUsername(validatedData.email),
        referral_code: referralCode,
        referred_by: referredBy,
        balance: 0,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (profileError) {
        console.error('Error creating profile:', profileError.message)
        // Không trả về lỗi vì người dùng đã được tạo, và profile có thể được tạo sau
      }
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
async function getReferrerId(supabase, referralCode) {
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

// Helper function để tạo username từ email
function generateUsername(email) {
  // Lấy phần trước @ của email và thêm 4 số ngẫu nhiên
  const prefix = email.split('@')[0]
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${randomSuffix}`
}
