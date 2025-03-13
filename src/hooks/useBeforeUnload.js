// src/hooks/useBeforeUnload.js
import { useEffect } from 'react'

/**
 * Hook để cảnh báo khi người dùng rời khỏi trang mà chưa lưu thay đổi
 *
 * @param {Function} handler - Hàm xử lý sự kiện beforeunload
 * @returns {void}
 *
 * @example
 * useBeforeUnload(
 *   useCallback((e) => {
 *     if (hasUnsavedChanges) {
 *       e.preventDefault()
 *       return 'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi không?'
 *     }
 *   }, [hasUnsavedChanges])
 * )
 */
export function useBeforeUnload(handler) {
  useEffect(() => {
    window.addEventListener('beforeunload', handler)
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [handler])
}
