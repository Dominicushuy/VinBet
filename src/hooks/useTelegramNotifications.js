// src/hooks/useTelegramNotifications.js
import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { fetchData, postData } from '@/utils/fetchUtils'

export function useTelegramNotifications() {
  const queryClient = useQueryClient()

  const generateCodeMutation = useMutation({
    mutationFn: () => postData('/api/telegram/generate-code', {}),
    onSuccess: data => {
      toast.success('Mã xác thực đã được tạo')
      return data.code
    },
    onError: error => {
      toast.error(error.message || 'Không thể tạo mã xác thực')
    }
  })

  const connectTelegramMutation = useMutation({
    mutationFn: telegramId => postData('/api/notifications/telegram', { telegram_id: telegramId }),
    onSuccess: () => {
      toast.success('Kết nối Telegram thành công')
      queryClient.invalidateQueries({ queryKey: ['notifications', 'telegram'] })
    },
    onError: error => {
      toast.error(error.message || 'Không thể kết nối Telegram')
    }
  })

  const disconnectTelegramMutation = useMutation({
    mutationFn: () => fetchData('/api/notifications/telegram', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Đã ngắt kết nối Telegram')
      queryClient.invalidateQueries({ queryKey: ['notifications', 'telegram'] })
    },
    onError: error => {
      toast.error(error.message || 'Không thể ngắt kết nối Telegram')
    }
  })

  const updateTelegramSettingsMutation = useMutation({
    mutationFn: settings => postData('/api/notifications/telegram/settings', settings),
    onSuccess: () => {
      toast.success('Đã cập nhật thiết lập Telegram')
      queryClient.invalidateQueries({ queryKey: ['notifications', 'telegram', 'settings'] })
    },
    onError: error => {
      toast.error(error.message || 'Không thể cập nhật thiết lập Telegram')
    }
  })

  const getTelegramStatus = useCallback(async () => {
    try {
      return await fetchData('/api/notifications/telegram')
    } catch (error) {
      console.error('Error fetching Telegram status:', error)
      return { connected: false }
    }
  }, [])

  const sendTestNotification = useCallback(async () => {
    try {
      await postData('/api/telegram/send/test', {})
      toast.success('Đã gửi thông báo thử nghiệm')
      return true
    } catch (error) {
      toast.error('Không thể gửi thông báo thử nghiệm')
      return false
    }
  }, [])

  return {
    generateCode: generateCodeMutation.mutateAsync,
    connectTelegram: connectTelegramMutation.mutateAsync,
    disconnectTelegram: disconnectTelegramMutation.mutateAsync,
    updateTelegramSettings: updateTelegramSettingsMutation.mutateAsync,
    getTelegramStatus,
    sendTestNotification,
    isGeneratingCode: generateCodeMutation.isPending,
    isConnecting: connectTelegramMutation.isPending,
    isDisconnecting: disconnectTelegramMutation.isPending,
    isUpdatingSettings: updateTelegramSettingsMutation.isPending
  }
}
