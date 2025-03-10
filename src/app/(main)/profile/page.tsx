// src/app/(main)/profile/page.tsx
import { Metadata } from "next";
import { ProfileDashboard } from "@/components/profile/ProfileDashboard";
import { getUserSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân - VinBet",
  description: "Quản lý thông tin tài khoản và cài đặt cá nhân của bạn",
};

export default async function ProfilePage() {
  const { session } = await getUserSession();
  const supabase = getSupabaseServer();

  // Fetch profile data server-side
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session?.user.id)
    .single();

  // console.log(profile);

  // Fetch user stats server-side
  const { data: stats } = await supabase.rpc("get_user_statistics", {
    p_user_id: session?.user.id,
  });

  return <ProfileDashboard initialProfile={profile} initialStats={stats} />;
}
