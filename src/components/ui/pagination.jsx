// src/components/ui/pagination.jsx
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize, className }) {
  const showingFrom = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = Math.min(currentPage * pageSize, totalItems)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Generate page numbers efficiently
  const getPageNumbers = () => {
    const pageNumbers = []

    // For small screen or few pages, show minimal pagination
    if (windowWidth < 480 || totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // For larger screens with many pages
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
      // Always add first page
      pageNumbers.push(1)

      // Add ellipsis after first if current page is far enough
      if (currentPage > 3) {
        pageNumbers.push('ellipsis-start')
      }

      // Add pages around current page
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis before last if current page is far enough from end
      if (currentPage < totalPages - 2) {
        pageNumbers.push('ellipsis-end')
      }

      // Always add last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 ${className || ''}`}>
      {/* Info text - hide on very small screens */}
      <div className='text-sm text-muted-foreground hidden xs:block'>
        Hiển thị{' '}
        <span className='font-medium'>
          {showingFrom}-{showingTo}
        </span>{' '}
        trong số <span className='font-medium'>{totalItems}</span> {totalItems > 1 ? 'mục' : 'mục'}
      </div>

      {/* Pagination controls */}
      <div className='flex items-center justify-center sm:justify-end gap-1 w-full sm:w-auto'>
        {/* First page button - hide on small screens */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className='hidden sm:flex h-8 w-8'
          aria-label='Trang đầu tiên'
        >
          <ChevronsLeft className='h-4 w-4' />
        </Button>

        {/* Previous page button */}
        <Button
          variant='outline'
          size='icon'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='h-8 w-8'
          aria-label='Trang trước'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {/* Page numbers */}
        <div className='flex items-center'>
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
              return (
                <span key={pageNum} className='px-2 text-muted-foreground'>
                  &hellip;
                </span>
              )
            }

            return (
              <Button
                key={index}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size='sm'
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 p-0 font-medium ${
                  pageNum === currentPage ? 'pointer-events-none' : 'hover:bg-accent'
                }`}
                aria-label={`Trang ${pageNum}`}
                aria-current={pageNum === currentPage ? 'page' : undefined}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        {/* Next page button */}
        <Button
          variant='outline'
          size='icon'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className='h-8 w-8'
          aria-label='Trang sau'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>

        {/* Last page button - hide on small screens */}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className='hidden sm:flex h-8 w-8'
          aria-label='Trang cuối cùng'
        >
          <ChevronsRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
