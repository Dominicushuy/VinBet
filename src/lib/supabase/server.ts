// src/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { cache } from 'react'

// Lazy initialize để chỉ tạo client khi cần thiết và trong context request
export const createServerClient = cache(() => {
  // Trì hoãn việc gọi cookies() cho đến khi hàm được thực thi
  return () => {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  }
})

// Tạo và export một hàm để lấy client, không phải client trực tiếp
export const getSupabaseServer = () => {
  const clientFactory = createServerClient()
  return clientFactory()
}
