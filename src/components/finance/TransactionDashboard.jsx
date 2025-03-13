'use client'

import { useState, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialSummary } from '@/components/finance/FinancialSummary'
import { TransactionHistoryTable } from '@/components/finance/TransactionHistoryTable'
import { TransactionChartView } from '@/components/finance/TransactionChartView'
import { TransactionAdvancedFilters } from '@/components/finance/TransactionAdvancedFilters'
import { ExportTransactions } from '@/components/finance/ExportTransactions'
import { useTransactionFilters } from '@/hooks/useTransactionFilters'

export function TransactionDashboard({ initialData }) {
  // Use custom hooks for filters
  const { filters, currentPage, handleFilterChange, handlePageChange, resetFilters, activeFiltersCount } =
    useTransactionFilters()

  // View mode state
  const [viewMode, setViewMode] = useState('list')

  // Memoize view mode content
  const viewModeContent = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return (
          <TransactionHistoryTable
            initialData={initialData.transactions}
            filters={filters}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )
      case 'chart':
        return <TransactionChartView filters={filters} />
      case 'analytics':
      default:
        return (
          <div className='p-6 text-center'>
            <p className='text-muted-foreground'>Tính năng phân tích giao dịch chi tiết sẽ sớm được cập nhật.</p>
          </div>
        )
    }
  }, [viewMode, initialData.transactions, filters, currentPage, handlePageChange])

  // Memoize title based on active view
  const viewModeTitle = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'Lịch sử giao dịch'
      case 'chart':
        return 'Biểu đồ giao dịch'
      case 'analytics':
        return 'Phân tích giao dịch'
      default:
        return 'Lịch sử giao dịch'
    }
  }, [viewMode])

  return (
    <div className='space-y-6'>
      {/* Top Summary Cards */}
      <FinancialSummary summaryData={initialData.summary} balance={initialData.profile?.balance || 0} />

      {/* View Selector and Export */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <Tabs value={viewMode} onValueChange={setViewMode} className='w-full sm:w-auto'>
          <TabsList className='grid grid-cols-3 w-full sm:w-auto'>
            <TabsTrigger value='list'>Danh sách</TabsTrigger>
            <TabsTrigger value='chart'>Biểu đồ</TabsTrigger>
            <TabsTrigger value='analytics'>Phân tích</TabsTrigger>
          </TabsList>
        </Tabs>

        <ExportTransactions filters={filters} />
      </div>

      {/* Advanced Filters */}
      <TransactionAdvancedFilters
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        initialFilters={filters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Content */}
      <Card className='overflow-hidden'>
        <CardHeader className='pb-2'>
          <CardTitle>{viewModeTitle}</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>{viewModeContent}</CardContent>
      </Card>
    </div>
  )
}
