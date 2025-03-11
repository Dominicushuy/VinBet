import { cache } from 'react'
import { getSupabaseServer } from '@/lib/supabase/server'

// Dùng cache để tránh duplicate requests trong cùng một render cycle
export const getUserSession = cache(async () => {
  const supabase = getSupabaseServer()

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error.message)
      return { session: null, error }
    }

    // Nếu có session, lấy thêm thông tin profile
    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Error getting profile:', profileError.message)
      }

      return {
        session,
        profile: profileError ? null : profile,
        error: null
      }
    }

    return { session: null, profile: null, error: null }
  } catch (error) {
    console.error('Unexpected error in getUserSession:', error)
    return { session: null, profile: null, error }
  }
})
