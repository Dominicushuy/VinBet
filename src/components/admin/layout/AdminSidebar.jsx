'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Dices,
  CreditCard,
  Bell,
  Gift,
  Settings,
  ChevronDown,
  FileText,
  BarChart2,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [openGroups, setOpenGroups] = useState({
    payments: true,
    reports: false
  })

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  const toggleGroup = group => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

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
      group: 'payments',
      subitems: [
        {
          title: 'Yêu cầu nạp tiền',
          href: '/admin/payments?type=deposit'
        },
        {
          title: 'Yêu cầu rút tiền',
          href: '/admin/payments?type=withdrawal'
        },
        {
          title: 'Lịch sử giao dịch',
          href: '/admin/transactions'
        }
      ]
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
      title: 'Báo cáo & Thống kê',
      icon: <BarChart2 className='w-5 h-5' />,
      group: 'reports',
      subitems: [
        {
          title: 'Báo cáo doanh thu',
          href: '/admin/reports/revenue'
        },
        {
          title: 'Thống kê người dùng',
          href: '/admin/reports/users'
        },
        {
          title: 'Thống kê cá cược',
          href: '/admin/reports/bets'
        }
      ]
    },
    {
      title: 'Cài đặt',
      icon: <Settings className='w-5 h-5' />,
      href: '/admin/settings'
    }
  ]

  const renderMenuItem = item => {
    // Nếu item có subitems (là một dropdown)
    if (item.subitems) {
      return (
        <Collapsible
          key={item.title}
          open={openGroups[item.group]}
          onOpenChange={() => toggleGroup(item.group)}
          className='w-full'
        >
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              className={cn(
                'w-full justify-between text-muted-foreground hover:text-foreground hover:bg-muted',
                pathname.includes(item.href) && 'bg-muted text-foreground font-medium'
              )}
            >
              <div className='flex items-center'>
                {item.icon}
                <span className='ml-2'>{item.title}</span>
              </div>
              <ChevronDown className={cn('h-4 w-4 transition-all', openGroups[item.group] && 'rotate-180')} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='pl-6 space-y-1 mt-1'>
            {item.subitems.map(subitem => (
              <Link
                key={subitem.title}
                href={subitem.href}
                className={cn(
                  'flex items-center h-9 px-3 py-2 text-sm rounded-md w-full hover:bg-muted hover:text-foreground',
                  pathname === subitem.href && 'bg-muted font-medium text-foreground'
                )}
              >
                {subitem.title}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    // Nếu item là một liên kết đơn
    return (
      <Link href={item.href} key={item.title}>
        <Button
          variant='ghost'
          className={cn(
            'w-full justify-start hover:bg-muted',
            pathname === item.href && 'bg-muted text-foreground font-medium'
          )}
        >
          {item.icon}
          <span className='ml-2'>{item.title}</span>
        </Button>
      </Link>
    )
  }

  if (isMobile) {
    return null
  }

  return (
    <div className='hidden md:block w-64 border-r bg-background'>
      <ScrollArea className='h-[calc(100vh-4rem)]'>
        <div className='px-3 py-4 space-y-1'>
          {menuItems.map(renderMenuItem)}

          <div className='mt-6 pt-6 border-t'>
            <Link href='/admin/support'>
              <Button variant='ghost' className='w-full justify-start text-muted-foreground hover:text-foreground'>
                <HelpCircle className='w-5 h-5' />
                <span className='ml-2'>Trợ giúp & Hỗ trợ</span>
              </Button>
            </Link>

            <Link href='/admin/guides'>
              <Button variant='ghost' className='w-full justify-start text-muted-foreground hover:text-foreground'>
                <FileText className='w-5 h-5' />
                <span className='ml-2'>Hướng dẫn sử dụng</span>
              </Button>
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
