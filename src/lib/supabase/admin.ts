// src/lib/supabase/admin.ts
import { createClient as createSBClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Lưu ý: Các biến môi trường này phải được thiết lập trên server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const createAdminClient = () => {
  return createSBClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const supabaseAdmin = createAdminClient()
