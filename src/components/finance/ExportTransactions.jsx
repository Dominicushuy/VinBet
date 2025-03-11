// src/components/finance/ExportTransactions.jsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ArrowDownToLine, Loader2, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ExportTransactions({ filters }) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')

  // Handle export
  const handleExport = async formatOption => {
    setExportFormat(formatOption)
    setIsExporting(true)

    try {
      // Prepare query parameters from filters
      const queryParams = new URLSearchParams()

      if (filters.type) queryParams.append('type', filters.type)
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      if (filters.minAmount) queryParams.append('minAmount', filters.minAmount.toString())
      if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount.toString())

      queryParams.append('format', formatOption)
      queryParams.append('timestamp', Date.now().toString()) // Cache busting

      // Request export
      const response = await fetch(`/api/transactions/export?${queryParams}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to export transactions')
      }

      // For CSV and Excel, download as file
      if (formatOption !== 'pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `vinbet-giao-dich-${formatOption}-${format(new Date(), 'dd-MM-yyyy', {
          locale: vi
        })}.${formatOption}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // For PDF, open in a new tab for printing
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      }

      toast.success(`Xuất dữ liệu dạng ${formatOption.toUpperCase()} thành công`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Không thể xuất dữ liệu. Vui lòng thử lại sau.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>
          {isExporting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
              Đang xuất dữ liệu...
            </>
          ) : (
            <>
              <ArrowDownToLine className='h-4 w-4 mr-2' />
              Xuất dữ liệu
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('csv')} className='cursor-pointer'>
          <FileText className='h-4 w-4 mr-2' />
          <span>CSV</span>
          {exportFormat === 'csv' && isExporting && <Loader2 className='h-4 w-4 animate-spin ml-auto' />}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('excel')} className='cursor-pointer'>
          <FileText className='h-4 w-4 mr-2' />
          <span>Excel (XLSX)</span>
          {exportFormat === 'excel' && isExporting && <Loader2 className='h-4 w-4 animate-spin ml-auto' />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isExporting} onClick={() => handleExport('pdf')} className='cursor-pointer'>
          <FileText className='h-4 w-4 mr-2' />
          <span>PDF</span>
          {exportFormat === 'pdf' && isExporting && <Loader2 className='h-4 w-4 animate-spin ml-auto' />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
