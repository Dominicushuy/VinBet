// src/components/admin/payment-request/list/PaymentFilterTabs.jsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PaymentFilterTabs({ selectedType, selectedStatus, onFilterChange }) {
  return (
    <div className='mb-4 flex flex-col sm:flex-row gap-4'>
      <Tabs
        value={selectedType === undefined ? 'all' : selectedType}
        className='w-full'
        onValueChange={value => {
          onFilterChange(value === 'all' ? undefined : value, undefined)
        }}
      >
        <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
          <TabsList>
            <TabsTrigger value='deposit'>Nạp tiền</TabsTrigger>
            <TabsTrigger value='withdrawal'>Rút tiền</TabsTrigger>
            <TabsTrigger value='all'>Tất cả</TabsTrigger>
          </TabsList>

          <TabsList>
            <TabsTrigger
              value='pending'
              onClick={() => onFilterChange(undefined, 'pending')}
              data-state={selectedStatus === 'pending' ? 'active' : undefined}
            >
              Đang xử lý
            </TabsTrigger>
            <TabsTrigger
              value='approved'
              onClick={() => onFilterChange(undefined, 'approved')}
              data-state={selectedStatus === 'approved' ? 'active' : undefined}
            >
              Đã duyệt
            </TabsTrigger>
            <TabsTrigger
              value='rejected'
              onClick={() => onFilterChange(undefined, 'rejected')}
              data-state={selectedStatus === 'rejected' ? 'active' : undefined}
            >
              Từ chối
            </TabsTrigger>
            <TabsTrigger
              value='all_status'
              onClick={() => onFilterChange(undefined, undefined)}
              data-state={selectedStatus === undefined ? 'active' : undefined}
            >
              Tất cả
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  )
}
