// src/app/api/profile/stats/route.ts
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

    // Lấy profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Lấy tổng số tiền đặt cược
    const { data: betData, error: betError } = await supabase
      .from("bets")
      .select("amount, status")
      .eq("profile_id", userId);

    if (betError) {
      return NextResponse.json({ error: betError.message }, { status: 500 });
    }

    // Lấy các giao dịch thắng
    const { data: winData, error: winError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("profile_id", userId)
      .eq("type", "win");

    if (winError) {
      return NextResponse.json({ error: winError.message }, { status: 500 });
    }

    // Tính toán thống kê
    const totalBets = betData?.length || 0;
    const wins = betData?.filter((bet) => bet.status === "won").length || 0;
    const losses = betData?.filter((bet) => bet.status === "lost").length || 0;
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

    const totalBetAmount =
      betData?.reduce((sum, bet) => sum + bet.amount, 0) || 0;
    const totalWinAmount =
      winData?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const netProfit = totalWinAmount - totalBetAmount;

    return NextResponse.json({
      balance: profile?.balance || 0,
      totalGames: 0, // Có thể tính từ game_rounds nếu cần
      totalBets,
      wins,
      losses,
      winRate,
      totalWinAmount,
      totalBetAmount,
      netProfit,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
