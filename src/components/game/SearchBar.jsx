// src/app/(main)/games/components/SearchBar.jsx
import { memo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

const SearchBar = memo(function SearchBar({ value, onChange, onClear, onSearch, hasValue }) {
  return (
    <div className='relative flex-1'>
      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
      <Input
        placeholder='Tìm kiếm lượt chơi...'
        value={value}
        onChange={e => onChange(e.target.value)}
        className='pl-9 pr-12'
        onKeyDown={e => e.key === 'Enter' && onSearch()}
      />
      {hasValue && (
        <Button
          variant='ghost'
          size='icon'
          className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7'
          onClick={onClear}
        >
          <X className='h-3 w-3' />
        </Button>
      )}
    </div>
  )
})

export default SearchBar
