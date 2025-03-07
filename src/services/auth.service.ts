// src/services/auth.service.ts
import { Profile, ProfileUpdate } from "@/types/database";
import { apiService } from "./api.service";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  referralCode?: string;
}

export interface AuthResponse {
  success: boolean;
}

export interface SessionResponse {
  user: AuthUser | null;
}

export interface ProfileResponse {
  profile: Profile;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiService.post<AuthResponse>("/api/auth/login", credentials),

  register: (data: RegisterData) =>
    apiService.post<AuthResponse>("/api/auth/register", data),

  logout: () => apiService.post<AuthResponse>("/api/auth/logout"),

  resetPassword: (email: string) =>
    apiService.post<AuthResponse>("/api/auth/forgot-password", { email }),

  getSession: () => apiService.get<SessionResponse>("/api/auth/session"),

  getProfile: () => apiService.get<ProfileResponse>("/api/profile"),

  updateProfile: (data: Partial<ProfileUpdate>) =>
    apiService.put<ProfileResponse>("/api/profile", data),
};
