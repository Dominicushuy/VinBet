// src/components/admin/payment-request/list/PaymentFilterTabs.jsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PaymentFilterTabs({ selectedType, selectedStatus, onFilterChange }) {
  return (
    <div className='mb-4 flex flex-col sm:flex-row gap-4'>
      {/* First Tabs component for Type selection */}
      <Tabs
        value={selectedType === undefined ? 'all' : selectedType}
        className='w-full'
        onValueChange={value => {
          onFilterChange(value === 'all' ? undefined : value, selectedStatus)
        }}
      >
        <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
          <TabsList>
            <TabsTrigger value='deposit'>Nạp tiền</TabsTrigger>
            <TabsTrigger value='withdrawal'>Rút tiền</TabsTrigger>
            <TabsTrigger value='all'>Tất cả</TabsTrigger>
          </TabsList>

          {/* Second Tabs component for Status selection */}
          <Tabs
            value={selectedStatus === undefined ? 'all' : selectedStatus}
            onValueChange={value => {
              onFilterChange(selectedType, value === 'all' ? undefined : value)
            }}
          >
            <TabsList>
              <TabsTrigger value='pending'>Đang xử lý</TabsTrigger>
              <TabsTrigger value='approved'>Đã duyệt</TabsTrigger>
              <TabsTrigger value='rejected'>Từ chối</TabsTrigger>
              <TabsTrigger value='all'>Tất cả</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Tabs>
    </div>
  )
}
