// src/app/api/game-rounds/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// GET: Lấy thông tin chi tiết của một game round
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

    const id = params.id;

    // Lấy thông tin game round
    const { data: gameRound, error } = await supabase
      .from("game_rounds")
      .select(
        `
        *,
        creator:profiles!game_rounds_created_by_fkey(id, username, display_name, avatar_url),
        bets_count:bets(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching game round:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!gameRound) {
      return NextResponse.json(
        { error: "Game round not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ gameRound }, { status: 200 });
  } catch (error) {
    console.error("Game round request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Cập nhật trạng thái của một game round
export async function PATCH(
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

    // Kiểm tra quyền admin
    const { data: profileData } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", sessionData.session.user.id)
      .single();

    if (!profileData?.is_admin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const id = params.id;

    // Parse request body
    const body = await request.json();

    // Validate body
    const updateGameRoundSchema = z.object({
      status: z.enum(["scheduled", "active", "completed", "cancelled"]),
      result: z.string().optional(),
    });

    const validatedData = updateGameRoundSchema.parse(body);

    // Gọi function để cập nhật game round
    const { data, error } = await supabase.rpc("update_game_round_status", {
      game_round_id: id,
      new_status: validatedData.status,
      game_result: validatedData.result,
    });

    if (error) {
      console.error("Error updating game round:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        gameRound: data[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update game round error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
