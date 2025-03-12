import { useCallback } from 'react'
import toast from 'react-hot-toast'

// src/hooks/useErrorHandling.js
export function useErrorHandling() {
  const handleError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error)

    // Sanitize message trước khi hiển thị cho người dùng
    const safeErrorMessage = getSafeErrorMessage(error)
    toast.error(safeErrorMessage)

    // Có thể log đến service như Sentry
  }, [])

  return { handleError }
}

function getSafeErrorMessage(error) {
  if (!error) return 'Đã xảy ra lỗi không xác định'

  if (typeof error === 'string') {
    // Không hiển thị chi tiết lỗi SQL
    return error.includes('SQL') || error.includes('syntax') ? 'Lỗi hệ thống, vui lòng thử lại sau' : error
  }

  if (error.message) {
    return error.message.includes('SQL') || error.message.includes('syntax')
      ? 'Lỗi hệ thống, vui lòng thử lại sau'
      : error.message
  }

  return 'Đã xảy ra lỗi không xác định'
}
