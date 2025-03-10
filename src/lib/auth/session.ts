// src/lib/auth/session.ts
import { getSupabaseServer } from '@/lib/supabase/server'

export async function getUserSession() {
  const supabase = getSupabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { session }
}
