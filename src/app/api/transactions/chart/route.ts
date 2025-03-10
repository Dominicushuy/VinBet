// src/app/api/transactions/chart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Parse query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const chartType = url.searchParams.get("chartType") || "bar";
    const timeRange = url.searchParams.get("timeRange") || "30days";

    // Calculate days based on time range
    let days = 30;
    switch (timeRange) {
      case "7days":
        days = 7;
        break;
      case "30days":
        days = 30;
        break;
      case "90days":
        days = 90;
        break;
      default:
        days = 30;
    }

    // For pie chart, we get aggregate data
    if (chartType === "pie") {
      // Build query for each transaction type
      let depositQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("profile_id", userId)
        .eq("type", "deposit")
        .eq("status", "completed");

      let withdrawalQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("profile_id", userId)
        .eq("type", "withdrawal")
        .eq("status", "completed");

      let betQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("profile_id", userId)
        .eq("type", "bet")
        .eq("status", "completed");

      let winQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("profile_id", userId)
        .eq("type", "win")
        .eq("status", "completed");

      let referralQuery = supabase
        .from("transactions")
        .select("amount")
        .eq("profile_id", userId)
        .eq("type", "referral_reward")
        .eq("status", "completed");

      // Apply date filters if provided
      if (startDate) {
        depositQuery = depositQuery.gte("created_at", startDate);
        withdrawalQuery = withdrawalQuery.gte("created_at", startDate);
        betQuery = betQuery.gte("created_at", startDate);
        winQuery = winQuery.gte("created_at", startDate);
        referralQuery = referralQuery.gte("created_at", startDate);
      }

      if (endDate) {
        depositQuery = depositQuery.lte("created_at", endDate);
        withdrawalQuery = withdrawalQuery.lte("created_at", endDate);
        betQuery = betQuery.lte("created_at", endDate);
        winQuery = winQuery.lte("created_at", endDate);
        referralQuery = referralQuery.lte("created_at", endDate);
      }

      // Execute queries
      const [
        depositResult,
        withdrawalResult,
        betResult,
        winResult,
        referralResult,
      ] = await Promise.all([
        depositQuery,
        withdrawalQuery,
        betQuery,
        winQuery,
        referralQuery,
      ]);

      // Calculate totals
      const depositTotal = (depositResult.data || []).reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const withdrawalTotal = (withdrawalResult.data || []).reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const betTotal = (betResult.data || []).reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const winTotal = (winResult.data || []).reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const referralTotal = (referralResult.data || []).reduce(
        (sum, item) => sum + item.amount,
        0
      );

      // Create pie chart data
      const chartData = [
        { name: "Nạp tiền", value: depositTotal },
        { name: "Rút tiền", value: withdrawalTotal },
        { name: "Đặt cược", value: betTotal },
        { name: "Thắng cược", value: winTotal },
        { name: "Thưởng giới thiệu", value: referralTotal },
      ].filter((item) => item.value > 0);

      return NextResponse.json({ chartData });
    } else {
      // For bar/line chart, we get data grouped by day
      const chartData: any[] = [];

      // Create date series
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "dd/MM", { locale: vi });

        // Create entry for this date
        chartData.push({
          date: dateStr,
          "Nạp tiền": 0,
          "Rút tiền": 0,
          "Đặt cược": 0,
          "Thắng cược": 0,
        });
      }

      // Get transaction data grouped by day and type
      let query = supabase.rpc("get_daily_transaction_stats", {
        p_profile_id: userId,
        p_days: days,
      });

      // Apply status filter if provided
      if (status) {
        query = query.eq("status", status);
      }

      const { data: dailyStats, error } = await query;

      if (error) {
        console.error("Error fetching daily transaction stats:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Populate chart data with transaction stats
      if (dailyStats && dailyStats.length > 0) {
        dailyStats.forEach((stat: any) => {
          const dateStr = format(new Date(stat.date), "dd/MM", { locale: vi });
          const dayIndex = chartData.findIndex((day) => day.date === dateStr);

          if (dayIndex !== -1) {
            switch (stat.type) {
              case "deposit":
                chartData[dayIndex]["Nạp tiền"] = stat.total_amount;
                break;
              case "withdrawal":
                chartData[dayIndex]["Rút tiền"] = stat.total_amount;
                break;
              case "bet":
                chartData[dayIndex]["Đặt cược"] = stat.total_amount;
                break;
              case "win":
                chartData[dayIndex]["Thắng cược"] = stat.total_amount;
                break;
            }
          }
        });
      }

      return NextResponse.json({ chartData });
    }
  } catch (error) {
    console.error("Chart data request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
