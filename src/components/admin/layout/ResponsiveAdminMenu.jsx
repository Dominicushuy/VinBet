'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminMobileMenuItems } from '@/config/adminMenuItems'

export function ResponsiveAdminMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Đóng menu khi route thay đổi
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className='block md:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' aria-label='Menu điều hướng'>
            <Menu className='h-5 w-5' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='p-0'>
          <div className='border-b py-4 px-6'>
            <div className='flex items-center justify-between'>
              <Link href='/admin/dashboard' className='flex items-center' onClick={() => setOpen(false)}>
                <span className='text-xl font-bold'>VinBet Admin</span>
              </Link>
            </div>
          </div>
          <ScrollArea className='h-[calc(100vh-5rem)]'>
            <div className='px-2 py-4'>
              <nav className='space-y-1'>
                {adminMobileMenuItems.map(item => (
                  <Link key={item.title} href={item.href} onClick={() => setOpen(false)}>
                    <Button
                      variant='ghost'
                      className={cn(
                        'w-full justify-start transition-colors',
                        pathname === item.href && 'bg-muted font-medium'
                      )}
                    >
                      {item.icon}
                      <span className='ml-2'>{item.title}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
