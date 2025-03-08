// src/app/api/game-rounds/[id]/bets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Đặt cược mới
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;
    const gameRoundId = params.id;

    // Parse body
    const body = await request.json();

    // Validate body
    const placeBetSchema = z.object({
      chosenNumber: z.string().min(1, "Số đặt cược là bắt buộc"),
      amount: z.number().positive("Số tiền phải lớn hơn 0"),
    });

    const validatedData = placeBetSchema.parse(body);

    // Gọi function để đặt cược
    const { data, error } = await supabase.rpc("place_bet", {
      p_profile_id: userId,
      p_game_round_id: gameRoundId,
      p_chosen_number: validatedData.chosenNumber,
      p_amount: validatedData.amount,
    });

    if (error) {
      console.error("Error placing bet:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch bet details
    const { data: betData, error: betError } = await supabase
      .from("bets")
      .select("*")
      .eq("id", data)
      .single();

    if (betError) {
      console.error("Error fetching bet data:", betError);
      return NextResponse.json({ error: betError.message }, { status: 500 });
    }

    return NextResponse.json({ bet: betData }, { status: 201 });
  } catch (error) {
    console.error("Place bet error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: "Đặt cược thất bại" }, { status: 500 });
  }
}

// Lấy danh sách cược của một lượt chơi
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameRoundId = params.id;

    // Kiểm tra quyền admin
    const { data: profileData } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", sessionData.session.user.id)
      .single();

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Lấy danh sách tất cả cược của lượt chơi này (chỉ admin)
    const { data: bets, error } = await supabase
      .from("bets")
      .select(
        `
        *,
        profiles:profile_id(id, username, display_name, avatar_url)
      `
      )
      .eq("game_round_id", gameRoundId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bets }, { status: 200 });
  } catch (error) {
    console.error("Fetch bets error:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách cược" },
      { status: 500 }
    );
  }
}
