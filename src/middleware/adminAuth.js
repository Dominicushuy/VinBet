// src/middleware/adminAuth.js

import { getUserSession } from '@/lib/auth/session'
import { getSupabaseServer } from '@/lib/supabase/server'

/**
 * Middleware để kiểm tra quyền admin, sử dụng trong layout
 * @returns {Object} Thông tin người dùng nếu là admin, hoặc thông tin redirect nếu không phải
 */
export async function checkAdminAuth() {
  try {
    // Kiểm tra session
    const { session, error: sessionError } = await getUserSession()

    if (sessionError) {
      console.error('Lỗi khi lấy session:', sessionError)
      return {
        redirect: { destination: '/login', permanent: false },
        userProfile: null
      }
    }

    if (!session) {
      return {
        redirect: { destination: '/login', permanent: false },
        userProfile: null
      }
    }

    // Kiểm tra quyền admin
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin, username, display_name, avatar_url')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Lỗi khi lấy thông tin profile:', error)
      return {
        redirect: { destination: '/', permanent: false },
        userProfile: null
      }
    }

    if (!data?.is_admin) {
      console.warn(`Người dùng không có quyền admin: ${session.user.id}`)
      return {
        redirect: { destination: '/', permanent: false },
        userProfile: null
      }
    }

    // Tạo userProfile object để truyền xuống components
    const userProfile = {
      id: session.user.id,
      email: session.user.email,
      name: data.display_name || data.username || 'Admin',
      avatar: data.avatar_url,
      isAdmin: data.is_admin
    }

    return { redirect: null, userProfile }
  } catch (error) {
    console.error('Lỗi không xác định trong adminAuth middleware:', error)
    return {
      redirect: { destination: '/login', permanent: false },
      userProfile: null
    }
  }
}
