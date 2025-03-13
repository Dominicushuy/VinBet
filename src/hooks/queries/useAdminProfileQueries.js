// src/hooks/queries/useAdminProfileQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchData, postData, putData, deleteData, buildQueryString } from '@/utils/fetchUtils'
import { toast } from 'react-hot-toast'

// Query keys
const ADMIN_PROFILE_KEYS = {
  profile: ['admin', 'profile'],
  preferences: ['admin', 'preferences'],
  sessions: ['admin', 'sessions'],
  activity: params => ['admin', 'activity', params]
}

// Fetch profile data
export function useAdminProfileQuery() {
  return useQuery({
    queryKey: ADMIN_PROFILE_KEYS.profile,
    queryFn: () => fetchData('/api/admin/profile'),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Update profile
export function useUpdateAdminProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => putData('/api/admin/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROFILE_KEYS.profile })
    }
  })
}

// Change password
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: data => postData('/api/admin/profile/password', data)
  })
}

// Fetch admin sessions
export function useAdminSessionsQuery() {
  return useQuery({
    queryKey: ADMIN_PROFILE_KEYS.sessions,
    queryFn: () => fetchData('/api/admin/profile/sessions'),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// Logout session
export function useLogoutSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionId => deleteData('/api/admin/profile/sessions', { body: JSON.stringify({ sessionId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROFILE_KEYS.sessions })
    }
  })
}

// Fetch admin preferences
export function useAdminPreferencesQuery() {
  return useQuery({
    queryKey: ADMIN_PROFILE_KEYS.preferences,
    queryFn: () => fetchData('/api/admin/profile/preferences'),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Update preferences
export function useUpdateAdminPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: data => putData('/api/admin/profile/preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROFILE_KEYS.preferences })
    }
  })
}

// Fetch activity logs
export function useAdminActivityQuery(params = {}) {
  return useQuery({
    queryKey: ADMIN_PROFILE_KEYS.activity(params),
    queryFn: () => fetchData(`/api/admin/profile/activity${buildQueryString(params)}`),
    staleTime: 2 * 60 * 1000 // 2 minutes
  })
}

// Export logs
export function useExportActivityLogsMutation() {
  return useMutation({
    mutationFn: params => {
      const queryString = buildQueryString(params)
      return fetch(`/api/admin/profile/activity/export${queryString}`)
        .then(response => {
          if (!response.ok) throw new Error('Export failed')
          return response.blob()
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          return true
        })
    },
    onSuccess: () => {
      toast.success('Đã xuất dữ liệu thành công')
    },
    onError: () => {
      toast.error('Không thể xuất dữ liệu')
    }
  })
}
