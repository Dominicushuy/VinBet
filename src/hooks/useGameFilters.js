import { useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function useGameFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Lấy các params từ URL
  const status = searchParams.get('status') || undefined
  const fromDate = searchParams.get('fromDate') || undefined
  const toDate = searchParams.get('toDate') || undefined
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 10)
  const search = searchParams.get('search') || undefined

  // Tạo đối tượng filters để sử dụng trong component
  const filters = useMemo(
    () => ({
      status,
      fromDate,
      toDate,
      page,
      pageSize,
      search
    }),
    [status, fromDate, toDate, page, pageSize, search]
  )

  // Hàm cập nhật filters và URL
  const updateFilters = useCallback(
    newFilters => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value))
        } else {
          params.delete(key)
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  // Các hàm tiện ích
  const handlePageChange = useCallback(
    newPage => {
      updateFilters({ page: newPage })
    },
    [updateFilters]
  )

  const handleStatusFilter = useCallback(
    newStatus => {
      updateFilters({ status: newStatus, page: 1 })
    },
    [updateFilters]
  )

  const handleDateFilter = useCallback(
    (fromDate, toDate) => {
      updateFilters({ fromDate, toDate, page: 1 })
    },
    [updateFilters]
  )

  const handleSearch = useCallback(
    searchTerm => {
      updateFilters({ search: searchTerm, page: 1 })
    },
    [updateFilters]
  )

  const handlePageSizeChange = useCallback(
    newPageSize => {
      updateFilters({ pageSize: newPageSize, page: 1 })
    },
    [updateFilters]
  )

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return {
    filters,
    updateFilters,
    handlePageChange,
    handleStatusFilter,
    handleDateFilter,
    handleSearch,
    handlePageSizeChange,
    resetFilters
  }
}
