import { useState, useCallback } from 'react'

export function useDialogState(initialState = {}) {
  const [dialogs, setDialogs] = useState({
    create: false,
    update: false,
    result: false,
    delete: false,
    ...initialState
  })

  const openDialog = useCallback(name => {
    setDialogs(prev => ({ ...prev, [name]: true }))
  }, [])

  const closeDialog = useCallback(name => {
    setDialogs(prev => ({ ...prev, [name]: false }))
  }, [])

  const toggleDialog = useCallback(name => {
    setDialogs(prev => ({ ...prev, [name]: !prev[name] }))
  }, [])

  return {
    dialogs,
    openDialog,
    closeDialog,
    toggleDialog
  }
}
