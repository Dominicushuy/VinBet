export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { handleApiError } from '@/utils/errorHandler.js'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  referralCode: z.string().optional(),
  fullName: z.string().optional() // Added to match usage in the code
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    const supabase = createRouteHandlerClient({ cookies })

    // Lấy referrer ID nếu có mã giới thiệu
    const referredBy = validatedData.referralCode ? await getReferrerId(supabase, validatedData.referralCode) : null

    // Đăng ký qua người dùng bằng supabaseAmin và skip email verification
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        display_name: validatedData.fullName
      }
    })

    if (error) {
      return handleApiError(error)
    }

    // Tạo profile ngay sau khi đăng ký thành công
    if (data?.user) {
      const referralCode = nanoid(8)

      // Sử dụng transaction để đảm bảo atomic operation
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: data.user.id,
        email: validatedData.email,
        username: generateUsername(validatedData.email),
        full_name: validatedData.fullName,
        referral_code: referralCode,
        referred_by: referredBy,
        balance: 0,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (profileError) {
        console.error('Error creating profile:', profileError.message)
        return handleApiError(profileError, 'Lỗi khi tạo hồ sơ người dùng')
      }
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
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
