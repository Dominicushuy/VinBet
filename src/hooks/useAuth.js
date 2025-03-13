// src/hooks/useAuth.js
import { useCallback, useEffect } from 'react'
import { useLogoutMutation, useProfileQuery, useSessionQuery } from '@/hooks/queries/useAuthQueries'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useAuth() {
  const { data: session, isFetching: isSessionFetching } = useSessionQuery()
  const user = session?.user

  const { data: profileData, isFetching: isProfileFetching } = useProfileQuery(
    !!session?.user // Chỉ fetch khi đã đăng nhập
  )

  const profile = profileData?.profile || null

  const isLoading = isSessionFetching || isProfileFetching

  // Mutations
  const logoutMutation = useLogoutMutation()
  const signOut = useCallback(() => {
    return logoutMutation.mutateAsync()
  }, [logoutMutation])

  useEffect(() => {
    // Xử lý refresh token khi component mount
    const refreshSession = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.auth.getSession()

      // Nếu có session nhưng sắp hết hạn (ví dụ: còn dưới 5 phút)
      if (data?.session) {
        const expiresAt = new Date(data.session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()

        // Nếu session sắp hết hạn, refresh token
        if (timeUntilExpiry < 5 * 60 * 1000) {
          // 5 phút
          await supabase.auth.refreshSession()
        }
      }
    }

    refreshSession()
  }, [])

  return { user, isLoading, signOut, profile }
}
