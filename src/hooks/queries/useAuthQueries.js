// src/hooks/queries/useAuthQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Query keys
export const AUTH_QUERY_KEYS = {
  session: ['auth', 'session'],
  profile: ['auth', 'profile']
}

// Tạo Supabase client
const createSupabase = () => createClientComponentClient()

// Queries
export function useSessionQuery() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    queryFn: async () => {
      const supabase = createSupabase()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw new Error(error.message)
      }

      return data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false
  })
}

export function useProfileQuery(enabled = true) {
  const { data: sessionData } = useQuery({
    queryKey: AUTH_QUERY_KEYS.session,
    enabled
  })

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: async () => {
      const supabase = createSupabase()
      const { data: session } = await supabase.auth.getSession()

      if (!session.session) {
        throw new Error('No active session')
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.session.user.id).single()

      if (error) {
        throw new Error(error.message)
      }

      return { profile: data }
    },
    enabled: enabled && !!sessionData?.session, // Chỉ fetch khi đã đăng nhập
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

// Mutations
export function useLoginMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async credentials => {
      // Gọi API đăng nhập
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Đăng nhập thất bại')
      }

      return result
    },
    onSuccess: async () => {
      // Invalidate và refetch session sau khi đăng nhập
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.session
      })
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.profile
      })
    },
    onError: error => {
      toast.error(error.message || 'Đăng nhập thất bại')
    }
  })
}

export function useRegisterMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: async data => {
      // Gọi API đăng ký
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Đăng ký thất bại')
      }

      return result
    },
    onSuccess: () => {
      router.push('/login?registered=true')
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
    },
    onError: error => {
      toast.error(error.message || 'Đăng ký thất bại')
    }
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      // Gọi API đăng xuất
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Đăng xuất thất bại')
      }

      return result
    },
    onSuccess: () => {
      // Reset tất cả queries sau khi đăng xuất
      queryClient.clear()
      router.push('/login')
      toast.success('Đăng xuất thành công!')
    },
    onError: error => {
      toast.error(error.message || 'Đăng xuất thất bại')
    }
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async email => {
      // Gọi API đặt lại mật khẩu
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Yêu cầu đặt lại mật khẩu thất bại')
      }

      return result
    },
    onSuccess: () => {
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu')
    },
    onError: error => {
      toast.error(error.message || 'Yêu cầu đặt lại mật khẩu thất bại')
    }
  })
}

export function useNewPasswordMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async newPassword => {
      // Gọi API đặt mật khẩu mới
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể đặt lại mật khẩu')
      }

      return result
    },
    onSuccess: () => {
      // Xóa session query và chuyển về trang đăng nhập
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.session })
      router.push('/login?reset=success')
      toast.success('Đặt lại mật khẩu thành công!')
    },
    onError: error => {
      toast.error(error.message || 'Đặt lại mật khẩu thất bại')
    }
  })
}
