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

    // Lấy tổng số người được giới thiệu
    const { count: totalReferrals, error: countError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)

    if (countError) {
      return handleApiError(countError, 'Lỗi khi đếm người giới thiệu')
    }

    // Lấy số người đã hoàn thành (status = 'completed')
    const { count: completedReferrals, error: completedError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'completed')

    if (completedError) {
      return handleApiError(completedError, 'Lỗi khi đếm người giới thiệu hoàn thành')
    }

    // Lấy tổng tiền thưởng
    const { data: rewardTransactions, error: rewardError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('profile_id', userId)
      .eq('type', 'referral_reward')
      .eq('status', 'completed')

    if (rewardError) {
      return handleApiError(rewardError, 'Lỗi khi tính tổng tiền thưởng')
    }

    const totalRewards = rewardTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0

    // Lấy thống kê gần đây
    const { data: recentRewards, error: recentError } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('profile_id', userId)
      .eq('type', 'referral_reward')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      return handleApiError(recentError, 'Lỗi khi lấy thưởng gần đây')
    }

    return NextResponse.json({
      stats: {
        totalReferrals: totalReferrals || 0,
        completedReferrals: completedReferrals || 0,
        pendingReferrals: (totalReferrals || 0) - (completedReferrals || 0),
        totalRewards,
        averageReward: totalRewards / (completedReferrals || 1),
        recentRewards: recentRewards || []
      }
    })
  } catch (error) {
    return handleApiError(error, 'Lỗi khi lấy thống kê giới thiệu')
  }
}
