// src/lib/supabase/client.ts
import {
  createClientComponentClient,
  SupabaseClient,
} from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export const createClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }) as SupabaseClient
}

export const supabase = createClient()
