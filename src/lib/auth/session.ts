// src/lib/auth/session.ts
import { createServerClient } from "@/lib/supabase/server";

export async function getUserSession() {
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return { session };
}
