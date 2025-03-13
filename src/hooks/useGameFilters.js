// src/hooks/useGameFilters.js
import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export function useGameFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Khởi tạo state từ URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest')
  const [jackpotOnly, setJackpotOnly] = useState(searchParams.get('jackpotOnly') === 'true')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 12)

  // Xử lý date params an toàn hơn
  const [fromDate, setFromDate] = useState(() => {
    const dateStr = searchParams.get('fromDate')
    if (!dateStr) return undefined
    const parsedDate = new Date(dateStr)
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate
  })

  const [toDate, setToDate] = useState(() => {
    const dateStr = searchParams.get('toDate')
    if (!dateStr) return undefined
    const parsedDate = new Date(dateStr)
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate
  })

  // Tính toán số lượng filter đang active
  const activeFiltersCount = useMemo(() => {
    return [
      searchQuery,
      status !== 'all' ? status : null,
      sortBy !== 'newest' ? sortBy : null,
      fromDate,
      toDate,
      jackpotOnly
    ].filter(Boolean).length
  }, [searchQuery, status, sortBy, fromDate, toDate, jackpotOnly])

  // Tạo query params cho API call
  const queryParams = useMemo(() => {
    return {
      status: status !== 'all' ? status : undefined,
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString(),
      query: searchQuery || undefined,
      page,
      pageSize,
      sortBy,
      jackpotOnly: jackpotOnly ? 'true' : undefined
    }
  }, [status, fromDate, toDate, searchQuery, page, pageSize, sortBy, jackpotOnly])

  // Apply filters và cập nhật URL
  const applyFilters = useCallback(() => {
    // Validate date range
    if (fromDate && toDate && fromDate > toDate) {
      toast.error('Ngày bắt đầu không thể sau ngày kết thúc')
      return false
    }

    const params = new URLSearchParams()

    if (searchQuery) params.set('query', searchQuery)
    if (status !== 'all') params.set('status', status)
    if (sortBy !== 'newest') params.set('sortBy', sortBy)
    if (fromDate) params.set('fromDate', fromDate.toISOString())
    if (toDate) params.set('toDate', toDate.toISOString())
    if (jackpotOnly) params.set('jackpotOnly', 'true')
    if (page > 1) params.set('page', page.toString())
    if (pageSize !== 12) params.set('pageSize', pageSize.toString())

    router.push(`/games?${params.toString()}`)
    return true
  }, [router, searchQuery, status, sortBy, fromDate, toDate, jackpotOnly, page, pageSize])

  // Reset tất cả filters
  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setStatus('all')
    setSortBy('newest')
    setFromDate(undefined)
    setToDate(undefined)
    setJackpotOnly(false)
    setPage(1)

    router.push('/games')
    return true
  }, [router])

  // Handle page change
  const handlePageChange = useCallback(
    newPage => {
      setPage(newPage)
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', newPage.toString())
      router.push(`/games?${params.toString()}`)

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [router, searchParams]
  )

  // Remove single filter
  const removeFilter = useCallback(
    filterName => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(filterName)

      // Update local state
      switch (filterName) {
        case 'query':
          setSearchQuery('')
          break
        case 'status':
          setStatus('all')
          break
        case 'sortBy':
          setSortBy('newest')
          break
        case 'fromDate':
          setFromDate(undefined)
          break
        case 'toDate':
          setToDate(undefined)
          break
        case 'jackpotOnly':
          setJackpotOnly(false)
          break
      }

      router.push(`/games?${params.toString()}`)
    },
    [router, searchParams]
  )

  return {
    // State
    searchQuery,
    setSearchQuery,
    status,
    setStatus,
    sortBy,
    setSortBy,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    jackpotOnly,
    setJackpotOnly,
    page,
    setPage,
    pageSize,
    setPageSize,

    // Computed
    activeFiltersCount,
    queryParams,

    // Actions
    applyFilters,
    resetFilters,
    handlePageChange,
    removeFilter
  }
}
