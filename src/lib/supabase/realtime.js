// src/lib/supabase/realtime.js
import { supabaseClient } from './client'

export function initializeRealtimeSubscriptions() {
  // Cấu hình global cho Realtime
  supabaseClient.realtime.setConfig({
    broadcast: {
      self: true // Nếu muốn nhận thông báo do chính người dùng tạo ra
    }
  })

  console.log('Supabase Realtime initialized')
  return true
}
