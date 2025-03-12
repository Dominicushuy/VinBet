'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { adminMenuItems, adminSupportMenuItems } from '@/config/adminMenuItems'

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState({
    payments: true,
    reports: false
  })

  const toggleGroup = group => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const renderMenuItem = item => {
    // Nếu item có subitems (là một dropdown)
    if (item.subitems) {
      const isActive = pathname.includes(item.href) || item.subitems.some(subitem => pathname === subitem.href)

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
                'w-full justify-between text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                isActive && 'bg-muted text-foreground font-medium'
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
                  'flex items-center h-9 px-3 py-2 text-sm rounded-md w-full hover:bg-muted hover:text-foreground transition-colors',
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
            'w-full justify-start hover:bg-muted transition-colors',
            pathname === item.href && 'bg-muted text-foreground font-medium'
          )}
        >
          {item.icon}
          <span className='ml-2'>{item.title}</span>
        </Button>
      </Link>
    )
  }

  return (
    <aside className='hidden md:block w-64 border-r bg-background'>
      <ScrollArea className='h-[calc(100vh-4rem)]'>
        <nav className='px-3 py-4 space-y-1'>
          {adminMenuItems.map(renderMenuItem)}

          <div className='mt-6 pt-6 border-t'>
            {adminSupportMenuItems.map(item => (
              <Link href={item.href} key={item.title}>
                <Button
                  variant='ghost'
                  className='w-full justify-start text-muted-foreground hover:text-foreground transition-colors'
                >
                  {item.icon}
                  <span className='ml-2'>{item.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      </ScrollArea>
    </aside>
  )
}
