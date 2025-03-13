// src/components/finance/CopyReferralButton.jsx
'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export function CopyReferralButton({ referralCode }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode || 'VINBET123')
    toast.success('Đã sao chép mã giới thiệu')
  }

  return (
    <Button variant='ghost' size='sm' className='ml-2' onClick={handleCopy}>
      <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M5 2V1H10V2H5ZM4.5 0C4.22386 0 4 0.223858 4 0.5V2.5C4 2.77614 4.22386 3 4.5 3H10.5C10.7761 3 11 2.77614 11 2.5V0.5C11 0.223858 10.7761 0 10.5 0H4.5ZM2 4.5C2 4.22386 2.22386 4 2.5 4H12.5C12.7761 4 13 4.22386 13 4.5V12.5C13 12.7761 12.7761 13 12.5 13H2.5C2.22386 13 2 12.7761 2 12.5V4.5ZM2.5 3C1.67157 3 1 3.67157 1 4.5V12.5C1 13.3284 1.67157 14 2.5 14H12.5C13.3284 14 14 13.3284 14 12.5V4.5C14 3.67157 13.3284 3 12.5 3H2.5Z'
          fill='currentColor'
          fillRule='evenodd'
          clipRule='evenodd'
        ></path>
      </svg>
    </Button>
  )
}
