import {
  useSessionQuery,
  useProfileQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation
} from './queries/useAuthQueries'

export function useAuth() {
  // Fetch session & profile
  const { data: sessionData, isLoading: isSessionLoading, refetch: refreshSession } = useSessionQuery()
  const user = sessionData?.user || null

  // Only fetch profile if we have a user
  const { data: profileData, isLoading: isProfileLoading } = useProfileQuery(!!user)
  const profile = profileData?.profile || null

  // Mutations
  const loginMutation = useLoginMutation()
  const registerMutation = useRegisterMutation()
  const logoutMutation = useLogoutMutation()
  const resetPasswordMutation = useResetPasswordMutation()
  const updateProfileMutation = useUpdateProfileMutation()

  // Loading state
  const isLoading = isSessionLoading || (!!user && isProfileLoading)

  // Auth methods
  const signIn = credentials => {
    return loginMutation.mutateAsync(credentials)
  }

  const signUp = data => {
    return registerMutation.mutateAsync(data)
  }

  const signOut = () => {
    return logoutMutation.mutateAsync()
  }

  const resetPassword = email => {
    return resetPasswordMutation.mutateAsync(email)
  }

  const updateProfile = data => {
    return updateProfileMutation.mutateAsync(data)
  }

  const isPasswordResetSession = () => {
    return !!user && new URL(window.location.href).searchParams.get('type') === 'recovery'
  }

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
    isPasswordResetSession
  }
}
