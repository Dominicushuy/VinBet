export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
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

    // Lấy profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single()

    if (profileError) {
      return handleApiError(profileError, 'Lỗi khi lấy thông tin profile')
    }

    // Lấy tổng số tiền đặt cược
    const { data: betData, error: betError } = await supabase
      .from('bets')
      .select('amount, status')
      .eq('profile_id', userId)

    if (betError) {
      return handleApiError(betError, 'Lỗi khi lấy dữ liệu cược')
    }

    // Lấy các giao dịch thắng
    const { data: winData, error: winError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('profile_id', userId)
      .eq('type', 'win')
      .eq('status', 'completed')

    // Lấy các giao dịch tham chiếu
    const { data: referralData, error: referralError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('profile_id', userId)
      .eq('type', 'referral_reward')
      .eq('status', 'completed')

    // Kiểm tra lỗi
    if (winError) {
      return handleApiError(winError, 'Lỗi khi lấy dữ liệu thắng')
    }

    if (referralError) {
      return handleApiError(referralError, 'Lỗi khi lấy dữ liệu giới thiệu')
    }

    // Tính toán thống kê
    const totalBets = betData?.length || 0
    const wins = betData?.filter(bet => bet.status === 'won').length || 0
    const losses = betData?.filter(bet => bet.status === 'lost').length || 0
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0

    const totalBetAmount = betData?.reduce((sum, bet) => sum + bet.amount, 0) || 0
    const totalWinAmount = winData?.reduce((sum, tx) => sum + tx.amount, 0) || 0
    const totalReferralAmount = referralData?.reduce((sum, tx) => sum + tx.amount, 0) || 0
    const netProfit = totalWinAmount + totalReferralAmount - totalBetAmount

    return NextResponse.json({
      balance: profile?.balance || 0,
      totalBets,
      wins,
      losses,
      winRate: Number(winRate.toFixed(2)),
      totalWinAmount,
      totalBetAmount,
      totalReferralAmount,
      netProfit
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thống kê người dùng')
  }
}
