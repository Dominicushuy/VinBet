'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function AdminBreadcrumb() {
  const pathname = usePathname()

  // Bỏ qua các route đặc biệt và chỉ lấy phần path sau /admin/
  const paths = pathname.split('/').filter(path => path && path !== 'admin')

  // Tạo breadcrumb items với titles phù hợp
  const breadcrumbItems = paths.map((path, index) => {
    // Path đầy đủ tới level hiện tại
    const href = `/admin/${paths.slice(0, index + 1).join('/')}`

    // Format title
    let title = path.charAt(0).toUpperCase() + path.slice(1)

    // Xử lý các trường hợp đặc biệt
    if (path === 'dashboard') title = 'Dashboard'
    if (path === 'users') title = 'Người dùng'
    if (path === 'games') title = 'Trò chơi'
    if (path === 'payments') title = 'Thanh toán'
    if (path === 'notifications') title = 'Thông báo'
    if (path === 'settings') title = 'Cài đặt'

    return { path, href, title }
  })

  return (
    <nav className='flex items-center mb-6'>
      <ol className='flex items-center space-x-1 text-sm text-muted-foreground'>
        <li>
          <Link href='/admin/dashboard' className='flex items-center hover:text-foreground'>
            <Home className='h-4 w-4' />
            <span className='sr-only'>Dashboard</span>
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className='flex items-center'>
            <ChevronRight className='h-4 w-4 mx-1' />
            {index === breadcrumbItems.length - 1 ? (
              <span className='font-medium text-foreground'>{item.title}</span>
            ) : (
              <Link href={item.href} className='hover:text-foreground'>
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
