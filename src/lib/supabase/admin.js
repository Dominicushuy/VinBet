import { createClient as createSBClient } from '@supabase/supabase-js'

// Lưu ý: Các biến môi trường này phải được thiết lập trên server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const createAdminClient = () => {
  return createSBClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const supabaseAdmin = createAdminClient()
