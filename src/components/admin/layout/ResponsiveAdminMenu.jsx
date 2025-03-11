'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Dices, CreditCard, Bell, Gift, Settings, HelpCircle } from 'lucide-react'

export function ResponsiveAdminMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when path changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className='w-5 h-5' />,
      href: '/admin/dashboard'
    },
    {
      title: 'Người dùng',
      icon: <Users className='w-5 h-5' />,
      href: '/admin/users'
    },
    {
      title: 'Trò chơi',
      icon: <Dices className='w-5 h-5' />,
      href: '/admin/games'
    },
    {
      title: 'Thanh toán',
      icon: <CreditCard className='w-5 h-5' />,
      href: '/admin/payments'
    },
    {
      title: 'Thông báo',
      icon: <Bell className='w-5 h-5' />,
      href: '/admin/notifications'
    },
    {
      title: 'Giới thiệu',
      icon: <Gift className='w-5 h-5' />,
      href: '/admin/referrals'
    },
    {
      title: 'Cài đặt',
      icon: <Settings className='w-5 h-5' />,
      href: '/admin/settings'
    },
    {
      title: 'Trợ giúp',
      icon: <HelpCircle className='w-5 h-5' />,
      href: '/admin/support'
    }
  ]

  return (
    <div className='block md:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='p-0'>
          <div className='border-b py-4 px-6'>
            <div className='flex items-center justify-between'>
              <Link href='/admin/dashboard' className='flex items-center' onClick={() => setOpen(false)}>
                <span className='text-xl font-bold'>VinBet Admin</span>
              </Link>
              <Button variant='ghost' size='icon' onClick={() => setOpen(false)}>
                <X className='h-5 w-5' />
                <span className='sr-only'>Close menu</span>
              </Button>
            </div>
          </div>
          <ScrollArea className='h-[calc(100vh-5rem)]'>
            <div className='px-2 py-4'>
              <nav className='space-y-1'>
                {menuItems.map(item => (
                  <Link key={item.title} href={item.href} onClick={() => setOpen(false)}>
                    <Button
                      variant='ghost'
                      className={cn('w-full justify-start', pathname === item.href && 'bg-muted font-medium')}
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
