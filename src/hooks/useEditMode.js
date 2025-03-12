// Tạo file mới: src/hooks/useEditMode.js
import { useState, useCallback } from 'react'

export function useEditMode(initialMode = false) {
  const [isEditMode, setIsEditMode] = useState(initialMode)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState(null)

  const enterEditMode = useCallback(() => {
    setIsEditMode(true)
  }, [])

  const cancelEditMode = useCallback(() => {
    setIsEditMode(false)
  }, [])

  const confirmEditWithDialog = useCallback(values => {
    setPendingValues(values)
    setIsConfirmDialogOpen(true)
  }, [])

  const handleConfirm = useCallback(
    onSubmit => {
      if (pendingValues && onSubmit) {
        onSubmit(pendingValues)
      }
      setIsConfirmDialogOpen(false)
      setPendingValues(null)
      setIsEditMode(false)
    },
    [pendingValues]
  )

  const handleCancel = useCallback(() => {
    setIsConfirmDialogOpen(false)
    setPendingValues(null)
  }, [])

  return {
    isEditMode,
    isConfirmDialogOpen,
    pendingValues,
    enterEditMode,
    cancelEditMode,
    confirmEditWithDialog,
    handleConfirm,
    handleCancel
  }
}
