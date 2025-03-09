// src/app/api/notifications/telegram/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const telegramConnectSchema = z.object({
  telegram_id: z.string().min(1, "Telegram ID là bắt buộc"),
});

// POST: Kết nối tài khoản với Telegram
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Parse và validate body
    const body = await request.json();
    const validatedData = telegramConnectSchema.parse(body);

    // Cập nhật telegram_id trong profiles
    const { data, error } = await supabase
      .from("profiles")
      .update({
        telegram_id: validatedData.telegram_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error connecting Telegram:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Tạo thông báo về việc kết nối thành công
    await supabase.rpc("create_notification", {
      p_profile_id: userId,
      p_title: "Kết nối Telegram thành công",
      p_content:
        "Tài khoản của bạn đã được kết nối với Telegram. Bạn sẽ nhận được thông báo quan trọng qua Telegram.",
      p_type: "system",
    });

    return NextResponse.json({
      success: true,
      telegram_id: data.telegram_id,
    });
  } catch (error) {
    console.error("Telegram connect error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Không thể kết nối với Telegram" },
      { status: 500 }
    );
  }
}

// DELETE: Ngắt kết nối tài khoản với Telegram
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Xóa telegram_id trong profiles
    const { error } = await supabase
      .from("profiles")
      .update({
        telegram_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error disconnecting Telegram:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Tạo thông báo về việc ngắt kết nối
    await supabase.rpc("create_notification", {
      p_profile_id: userId,
      p_title: "Đã ngắt kết nối Telegram",
      p_content:
        "Tài khoản của bạn đã được ngắt kết nối với Telegram. Bạn sẽ không nhận được thông báo qua Telegram nữa.",
      p_type: "system",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram disconnect error:", error);
    return NextResponse.json(
      { error: "Không thể ngắt kết nối với Telegram" },
      { status: 500 }
    );
  }
}

// GET: Kiểm tra trạng thái kết nối Telegram
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Lấy thông tin telegram_id từ profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("telegram_id")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching Telegram status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      connected: data.telegram_id !== null,
      telegram_id: data.telegram_id,
    });
  } catch (error) {
    console.error("Telegram status request error:", error);
    return NextResponse.json(
      { error: "Không thể kiểm tra trạng thái Telegram" },
      { status: 500 }
    );
  }
}
