import { useState, useCallback } from 'react'

export function useTransactionFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    type: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...initialFilters
  })

  const [currentPage, setCurrentPage] = useState(1)

  const handleFilterChange = useCallback(newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page on filter change
  }, [])

  const handlePageChange = useCallback(page => {
    setCurrentPage(page)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      type: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
    setCurrentPage(1)
  }, [])

  // Tạo query params để sử dụng cho API
  const queryParams = useCallback(() => {
    return {
      type: filters.type,
      status: filters.status,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
      page: currentPage,
      pageSize: 15,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    }
  }, [filters, currentPage])

  // Đếm số filter đang active
  const activeFiltersCount = useCallback(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy' && value === 'created_at') return false
      if (key === 'sortOrder' && value === 'desc') return false
      return value !== undefined && value !== ''
    }).length
  }, [filters])

  return {
    filters,
    currentPage,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    queryParams,
    activeFiltersCount: activeFiltersCount()
  }
}
