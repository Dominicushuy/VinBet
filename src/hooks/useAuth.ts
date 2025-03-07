// src/hooks/useAuth.ts
import { useRouter } from "next/navigation";
import {
  useSessionQuery,
  useProfileQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} from "./queries/useAuthQueries";
import { LoginCredentials, RegisterData } from "@/services/auth.service";
import { ProfileUpdate } from "@/types/database";

export function useAuth() {
  const router = useRouter();

  // Fetch session & profile
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    refetch: refreshSession,
  } = useSessionQuery();

  const user = sessionData?.user || null;

  // Only fetch profile if we have a user
  const { data: profileData, isLoading: isProfileLoading } = useProfileQuery(
    !!user
  );

  const profile = profileData?.profile || null;

  // Mutations
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  // Loading state
  const isLoading = isSessionLoading || (!!user && isProfileLoading);

  // Auth methods
  const signIn = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const signUp = (data: RegisterData) => {
    return registerMutation.mutateAsync(data);
  };

  const signOut = () => {
    return logoutMutation.mutateAsync();
  };

  const resetPassword = (email: string) => {
    return resetPasswordMutation.mutateAsync(email);
  };

  const updateProfile = (data: Partial<ProfileUpdate>) => {
    return updateProfileMutation.mutateAsync(data);
  };

  const isPasswordResetSession = (): boolean => {
    return (
      !!user &&
      new URL(window.location.href).searchParams.get("type") === "recovery"
    );
  };

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
    isPasswordResetSession,
  };
}
