// src/components/admin/payment-request/list/PaymentSearchBar.jsx
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

export function PaymentSearchBar({ onSearch, pageSize, onPageSizeChange }) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center py-4 gap-4'>
      <div className='relative w-full max-w-sm'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input placeholder='Tìm theo tên, email...' className='pl-8' onChange={e => onSearch(e.target.value)} />
      </div>
      <div className='sm:ml-auto flex items-center space-x-2'>
        <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='Số dòng' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='5'>5 dòng</SelectItem>
            <SelectItem value='10'>10 dòng</SelectItem>
            <SelectItem value='20'>20 dòng</SelectItem>
            <SelectItem value='50'>50 dòng</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
