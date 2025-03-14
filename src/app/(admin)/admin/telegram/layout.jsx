// src/app/(admin)/admin/telegram/layout.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function TelegramAdminLayout({ children }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Tổng quan', href: '/admin/telegram/oveview', exact: true },
    { name: 'Trạng thái Bot', href: '/admin/telegram/status' },
    { name: 'Kết nối', href: '/admin/telegram/connections' },
    { name: 'Thông báo', href: '/admin/telegram/notifications' },
    { name: 'Thống kê', href: '/admin/telegram/stats' }
  ]

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold tracking-tight'>Quản lý Telegram</h1>
      </div>

      <div className='flex items-center space-x-1 border-b'>
        {tabs.map(tab => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </div>

      <div className='space-y-4'>{children}</div>
    </div>
  )
}
