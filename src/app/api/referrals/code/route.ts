// src/app/api/referrals/code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Kiểm tra session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.session.user.id;

    // Lấy referral code hiện tại của user
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching referral code:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let referralCode = profile.referral_code;

    // Nếu chưa có referral code, tạo mới
    if (!referralCode) {
      referralCode = nanoid(8); // Tạo mã 8 ký tự

      // Kiểm tra tính duy nhất của mã
      const { data: existingCode } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .single();

      // Nếu mã đã tồn tại, tạo mã mới
      if (existingCode) {
        referralCode = nanoid(8);
      }

      // Cập nhật mã referral cho user
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referral_code: referralCode })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating referral code:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      referralCode,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/register?ref=${referralCode}`,
    });
  } catch (error) {
    console.error("Referral code request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
