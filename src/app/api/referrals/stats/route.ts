// src/app/api/referrals/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Lấy tổng số người được giới thiệu
    const { count: totalReferrals, error: countError } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId);

    if (countError) {
      console.error("Error counting referrals:", countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Lấy số người đã hoàn thành (status = 'completed')
    const { count: completedReferrals, error: completedError } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId)
      .eq("status", "completed");

    if (completedError) {
      console.error("Error counting completed referrals:", completedError);
      return NextResponse.json(
        { error: completedError.message },
        { status: 500 }
      );
    }

    // Lấy tổng tiền thưởng
    const { data: rewardTransactions, error: rewardError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("profile_id", userId)
      .eq("type", "referral_reward")
      .eq("status", "completed");

    if (rewardError) {
      console.error("Error calculating total rewards:", rewardError);
      return NextResponse.json({ error: rewardError.message }, { status: 500 });
    }

    const totalRewards =
      rewardTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    // Lấy thống kê gần đây
    const { data: recentRewards, error: recentError } = await supabase
      .from("transactions")
      .select("amount, created_at")
      .eq("profile_id", userId)
      .eq("type", "referral_reward")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) {
      console.error("Error fetching recent rewards:", recentError);
      return NextResponse.json({ error: recentError.message }, { status: 500 });
    }

    return NextResponse.json({
      stats: {
        totalReferrals: totalReferrals || 0,
        completedReferrals: completedReferrals || 0,
        pendingReferrals: (totalReferrals || 0) - (completedReferrals || 0),
        totalRewards,
        recentRewards: recentRewards || [],
      },
    });
  } catch (error) {
    console.error("Referral stats request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
