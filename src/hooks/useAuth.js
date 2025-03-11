// src/hooks/useAuth.js
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLogoutMutation, useProfileQuery, useSessionQuery } from '@/hooks/queries/useAuthQueries'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useAuth({ required = false, redirectTo = '/login', adminRequired = false } = {}) {
  const router = useRouter()
  const { data: session, isFetching: isSessionFetching } = useSessionQuery()
  const user = session?.user
  const isAdmin = user?.app_metadata?.is_admin === true || user?.user_metadata?.is_admin === true

  const { data: profileData, isFetching: isProfileFetching } = useProfileQuery(!!user)
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

  useEffect(() => {
    // Nếu đã load xong và không đang loading
    if (!isLoading) {
      // Nếu cần đăng nhập nhưng không có session -> redirect
      if (required && !user) {
        router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      }

      // Nếu cần quyền admin nhưng không phải admin -> redirect về home
      if (adminRequired && !isAdmin) {
        router.push('/')
      }
    }
  }, [isLoading, user, required, adminRequired, redirectTo, router, isAdmin])

  return { user, isAdmin, isLoading, signOut, profile }
}
