// src/hooks/useAuth.js
import { useCallback } from 'react'
import { useSessionQuery, useProfileQuery, useLogoutMutation, useUpdateProfileMutation } from './queries/useAuthQueries'

export function useAuth() {
  // Fetch session & profile
  const { data: sessionData, isFetching: isSessionLoading, refetch: refreshSession } = useSessionQuery()
  const user = sessionData?.user || null

  // Only fetch profile if we have a user
  const { data: profileData, isFetching: isProfileLoading } = useProfileQuery(!!user)
  const profile = profileData?.profile || null

  // Mutations
  const logoutMutation = useLogoutMutation()
  const updateProfileMutation = useUpdateProfileMutation()

  // Loading state
  const isLoading = isSessionLoading || (!!user && isProfileLoading)

  const signOut = useCallback(() => {
    return logoutMutation.mutateAsync()
  }, [logoutMutation])

  const updateProfile = useCallback(
    data => {
      return updateProfileMutation.mutateAsync(data)
    },
    [updateProfileMutation]
  )

  const isPasswordResetSession = useCallback(() => {
    if (typeof window === 'undefined') return false
    return !!user && new URL(window.location.href).searchParams.get('type') === 'recovery'
  }, [user])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    updateProfile,
    refreshSession,
    isPasswordResetSession
  }
}
