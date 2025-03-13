// src/hooks/useTransactionHelpers.js
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { formatCurrency, formatTransactionType, formatTransactionStatus } from '@/utils/formatUtils'

export function useTransactionHelpers() {
  // Lấy icon dựa vào loại giao dịch
  const getTransactionIcon = useCallback(type => {
    const icons = {
      deposit: { component: 'ArrowUpRight', color: 'text-green-500' },
      withdrawal: { component: 'ArrowDownLeft', color: 'text-red-500' },
      bet: { component: 'DollarSign', color: 'text-blue-500' },
      win: { component: 'Award', color: 'text-amber-500' },
      referral_reward: { component: 'Award', color: 'text-purple-500' }
    }

    return icons[type] || { component: 'CreditCard', color: 'text-gray-500' }
  }, [])

  // Lấy màu dựa vào loại giao dịch
  const getAmountColor = useCallback(type => {
    const positiveTypes = ['deposit', 'win', 'referral_reward']
    return positiveTypes.includes(type) ? 'text-green-600' : 'text-red-600'
  }, [])

  // Lấy prefix dựa vào loại giao dịch
  const getAmountPrefix = useCallback(type => {
    const positiveTypes = ['deposit', 'win', 'referral_reward']
    return positiveTypes.includes(type) ? '+' : '-'
  }, [])

  // Format số tiền giao dịch
  const formatAmount = useCallback(
    (amount, type) => {
      return `${getAmountPrefix(type)}${formatCurrency(amount)}`
    },
    [getAmountPrefix]
  )

  // Copy to clipboard
  const copyToClipboard = useCallback((text, successMessage = 'Đã sao chép') => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(successMessage))
      .catch(() => toast.error('Không thể sao chép dữ liệu'))
  }, [])

  return {
    getTransactionIcon,
    getAmountColor,
    getAmountPrefix,
    formatAmount,
    copyToClipboard,
    formatTransactionType,
    formatTransactionStatus
  }
}
