'use client'

import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from 'react'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Profile, ProfileUpdate } from '@/types/database'
import { createClient } from '@/lib/supabase'

type AuthState = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
}

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    data?: { referralCode?: string }
  ) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<ProfileUpdate>) => Promise<void>
  refreshSession: () => Promise<void>
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error || !profileData) {
            console.error('Error fetching profile:', error)
            setState({
              session,
              user: session.user,
              profile: null,
              isLoading: false,
            })
            return
          }

          setState({
            session,
            user: session.user,
            profile: profileData as unknown as Profile,
            isLoading: false,
          })
        } else {
          setState({
            ...initialState,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error('Error loading session:', error)
        setState({
          ...initialState,
          isLoading: false,
        })
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error || !profileData) {
          console.error('Error fetching profile on auth change:', error)
          setState({
            session,
            user: session.user,
            profile: null,
            isLoading: false,
          })
          return
        }

        setState({
          session,
          user: session.user,
          profile: profileData as unknown as Profile,
          isLoading: false,
        })
      } else {
        setState({
          ...initialState,
          isLoading: false,
        })
      }
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
      throw error
    }
  }

  const signUp = async (
    email: string,
    password: string,
    data?: { referralCode?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            referral_code: data?.referralCode,
          },
        },
      })

      if (error) throw error

      toast.success('Vui lòng kiểm tra email để xác thực tài khoản')
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại')
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'Đăng xuất thất bại')
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu')
    } catch (error: any) {
      toast.error(error.message || 'Yêu cầu đặt lại mật khẩu thất bại')
      throw error
    }
  }

  const updateProfile = async (data: Partial<ProfileUpdate>) => {
    try {
      if (!state.user) throw new Error('Chưa đăng nhập')

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id)

      if (error) throw error

      // Refresh profile data
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .single()

      if (fetchError || !profileData) {
        throw new Error('Không thể lấy thông tin profile sau khi cập nhật')
      }

      setState({
        ...state,
        profile: profileData as unknown as Profile,
      })

      toast.success('Cập nhật thông tin thành công')
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thông tin thất bại')
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error || !profileData) {
          console.error('Error refreshing profile:', error)
          return
        }

        setState({
          session,
          user: session.user,
          profile: profileData as unknown as Profile,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
