// src/hooks/queries/useProfileQueries.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, putData, postData } from '@/utils/fetchUtils'
import { AUTH_QUERY_KEYS } from './useAuthQueries'

// Query keys
export const PROFILE_QUERY_KEYS = {
  profile: ['profile'],
  stats: ['profile', 'stats'],
  avatar: ['profile', 'avatar'],
  security: ['profile', 'security'],
  activity: ['profile', 'activity']
}

// API functions
const profileApi = {
  // Get user statistics
  getUserStats: async () => {
    return fetchData('/api/profile/stats')
  },

  // Update user profile
  updateProfile: async data => {
    return putData('/api/profile', data)
  },

  // Update avatar (special case - uses FormData)
  updateAvatar: async formData => {
    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Không thể cập nhật ảnh đại diện')
    }

    return response.json()
  },

  // Change password
  changePassword: async data => {
    return postData('/api/profile/change-password', data)
  },

  // Get security settings
  getSecuritySettings: async () => {
    return fetchData('/api/profile/security')
  },

  // Update security settings
  updateSecuritySettings: async data => {
    return putData('/api/profile/security', data)
  },

  // Get login activity
  getLoginActivity: async () => {
    return fetchData('/api/profile/activity')
  },

  // Sign out device
  signOutDevice: async deviceId => {
    return fetchData(`/api/profile/activity/${deviceId}`, {
      method: 'DELETE'
    })
  }
}

// Queries
export function useUserStatsQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.stats,
    queryFn: profileApi.getUserStats
  })
}

export function useSecuritySettingsQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.security,
    queryFn: profileApi.getSecuritySettings
  })
}

export function useLoginActivityQuery() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEYS.activity,
    queryFn: profileApi.getLoginActivity
  })
}

// Mutations
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile })
      toast.success('Hồ sơ đã được cập nhật')
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật hồ sơ')
    }
  })
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileApi.updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile })
      toast.success('Ảnh đại diện đã được cập nhật')
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật ảnh đại diện')
    }
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      toast.success('Mật khẩu đã được cập nhật')
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật mật khẩu')
    }
  })
}

export function useUpdateSecuritySettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileApi.updateSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.security })
      toast.success('Cài đặt bảo mật đã được cập nhật')
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật cài đặt bảo mật')
    }
  })
}

export function useSignOutDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileApi.signOutDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEYS.activity })
      toast.success('Đã đăng xuất khỏi thiết bị')
    },
    onError: error => {
      toast.error(error.message || 'Không thể đăng xuất thiết bị')
    }
  })
}
