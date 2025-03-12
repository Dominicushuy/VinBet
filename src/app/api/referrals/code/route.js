export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { handleApiError } from '@/utils/errorHandler'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Lấy referral code hiện tại của user
    const { data: profile, error } = await supabase.from('profiles').select('referral_code').eq('id', userId).single()

    if (error) {
      return handleApiError(error, 'Lỗi khi lấy mã giới thiệu')
    }

    let referralCode = profile.referral_code

    // Nếu chưa có referral code, tạo mới
    if (!referralCode) {
      referralCode = nanoid(8) // Tạo mã 8 ký tự

      // Kiểm tra tính duy nhất của mã
      const { data: existingCode } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      // Nếu mã đã tồn tại, tạo mã mới
      if (existingCode) {
        referralCode = nanoid(8)
      }

      // Cập nhật mã referral cho user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', userId)

      if (updateError) {
        return handleApiError(updateError, 'Lỗi khi cập nhật mã giới thiệu')
      }
    }

    return NextResponse.json({
      referralCode,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/register?ref=${referralCode}`
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi xử lý mã giới thiệu')
  }
}
