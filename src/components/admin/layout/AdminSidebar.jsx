'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { adminMenuItems, adminSupportMenuItems } from '@/config/adminMenuItems'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminSidebar() {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState(() => {
    // Initially open groups that contain the current active route
    const initialOpenGroups = {}
    adminMenuItems.forEach(item => {
      if (item.subitems) {
        initialOpenGroups[item.title] = item.subitems.some(subitem => pathname === subitem.href)
      }
    })
    return initialOpenGroups
  })

  // Toggle group expansion
  const toggleGroup = title => {
    setOpenGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderMenuItem = item => {
    // Items with subitems (expandable groups)
    if (item.subitems) {
      const isOpen = openGroups[item.title]
      const isActive = item.subitems.some(subitem => pathname === subitem.href)

      return (
        <div key={item.title} className='w-full'>
          <Button
            variant='ghost'
            className={cn(
              'w-full justify-between text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors group',
              isActive && 'bg-secondary/70 text-foreground font-medium'
            )}
            onClick={() => toggleGroup(item.title)}
          >
            <div className='flex items-center gap-3'>
              {item.icon &&
                React.cloneElement(item.icon, {
                  className: cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )
                })}
              <span>{item.title}</span>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')} />
          </Button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  transition: {
                    duration: 0.3,
                    ease: 'easeInOut'
                  }
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    duration: 0.2,
                    ease: 'easeInOut'
                  }
                }}
                className='overflow-hidden pl-4 border-l border-border'
              >
                {item.subitems.map(subitem => (
                  <Link
                    key={subitem.title}
                    href={subitem.href}
                    className={cn(
                      'flex items-center pl-4 py-2 text-sm rounded-md transition-colors',
                      pathname === subitem.href
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    )}
                  >
                    {subitem.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    // Regular menu item
    return (
      <Link
        href={item.href}
        key={item.title}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-md transition-colors group',
          pathname === item.href
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
        )}
      >
        {item.icon &&
          React.cloneElement(item.icon, {
            className: cn(
              'h-5 w-5 transition-colors',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )
          })}
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <aside className='hidden md:block w-64 border-r bg-background'>
      <ScrollArea className='h-[calc(100vh-4rem)]'>
        <nav className='px-3 py-4 space-y-2'>
          {adminMenuItems.map(renderMenuItem)}

          <Separator className='my-4' />

          <div className='px-3 text-xs text-muted-foreground mb-2'>Hỗ trợ</div>
          {adminSupportMenuItems.map(renderMenuItem)}
        </nav>
      </ScrollArea>
    </aside>
  )
}
