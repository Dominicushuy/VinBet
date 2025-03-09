// src/app/api/admin/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

const sendNotificationSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  content: z.string().min(1, "Nội dung không được để trống"),
  type: z.enum(["system", "game", "transaction", "admin"]),
  recipients: z.enum(["all", "specific"]),
  user_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    // Parse và validate body
    const body = await request.json();
    const validatedData = sendNotificationSchema.parse(body);

    let count = 0;

    if (validatedData.recipients === "all") {
      // Gửi thông báo tới tất cả người dùng
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id");

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return NextResponse.json(
          { error: usersError.message },
          { status: 500 }
        );
      }

      // Gửi thông báo cho từng người dùng
      for (const user of users) {
        await supabase.rpc("create_notification", {
          p_profile_id: user.id,
          p_title: validatedData.title,
          p_content: validatedData.content,
          p_type: validatedData.type,
        });
        count++;
      }
    } else if (
      validatedData.recipients === "specific" &&
      validatedData.user_id
    ) {
      // Kiểm tra xem người dùng có tồn tại không
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", validatedData.user_id)
        .single();

      if (userError) {
        console.error("Error fetching user:", userError);
        return NextResponse.json(
          { error: "Người dùng không tồn tại" },
          { status: 404 }
        );
      }

      // Gửi thông báo cho người dùng cụ thể
      await supabase.rpc("create_notification", {
        p_profile_id: user.id,
        p_title: validatedData.title,
        p_content: validatedData.content,
        p_type: validatedData.type,
      });
      count = 1;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Send notification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Không thể gửi thông báo" },
      { status: 500 }
    );
  }
}
