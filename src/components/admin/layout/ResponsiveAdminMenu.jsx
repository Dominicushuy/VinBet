'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminMenuItems, adminSupportMenuItems } from '@/config/adminMenuItems'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

export function ResponsiveAdminMenu() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    // Safely initialize expanded groups based on current pathname
    const initialExpandedGroups = {}
    adminMenuItems.forEach(item => {
      if (item.subitems) {
        initialExpandedGroups[item.title] = item.subitems.some(subitem => pathname && pathname === subitem.href)
      }
    })
    return initialExpandedGroups
  })

  // Close menu when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Toggle group expansion
  const toggleGroup = title => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const renderMenuItem = (item, depth = 0) => {
    // Render subitems for dropdown-like navigation
    if (item.subitems) {
      const isActive = item.subitems.some(subitem => pathname === subitem.href)
      const isExpanded = expandedGroups[item.title]

      return (
        <div key={item.title} className='space-y-1'>
          <div
            className={cn(
              'flex items-center justify-between px-4 py-2 rounded-md cursor-pointer transition-colors',
              isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary/50 text-muted-foreground'
            )}
            onClick={() => toggleGroup(item.title)}
          >
            <div className='flex items-center gap-3'>
              {item.icon &&
                React.cloneElement(item.icon, {
                  className: cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')
                })}
              <span>{item.title}</span>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-180' : '')} />
          </div>

          <AnimatePresence>
            {isExpanded && (
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
                className='overflow-hidden pl-8 space-y-1 mb-2'
              >
                {item.subitems.map(subitem => (
                  <Link
                    key={subitem.title}
                    href={subitem.href}
                    className={cn(
                      'block px-4 py-2 rounded-md text-sm transition-colors',
                      pathname === subitem.href
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    )}
                    onClick={() => setOpen(false)}
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
          'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
          pathname === item.href
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-secondary/50'
        )}
        onClick={() => setOpen(false)}
      >
        {item.icon &&
          React.cloneElement(item.icon, {
            className: cn('h-5 w-5', pathname === item.href ? 'text-primary' : 'text-muted-foreground')
          })}
        <span>{item.title}</span>
      </Link>
    )
  }

  return (
    <div className='block md:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' aria-label='Menu điều hướng'>
            <Menu className='h-5 w-5' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='p-0 w-[280px] sm:w-[320px]'>
          <div className='p-4 border-b flex items-center justify-between'>
            <Link href='/admin/dashboard' className='flex items-center gap-2' onClick={() => setOpen(false)}>
              <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                <span className='text-primary-foreground font-bold text-sm'>VB</span>
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
                VinBet
              </span>
              <Badge variant='outline' className='ml-2'>
                Admin
              </Badge>
            </Link>
            {/* <Button variant='ghost' size='icon' onClick={() => setOpen(false)} aria-label='Đóng menu'>
              <X className='h-5 w-5' />
            </Button> */}
          </div>

          <ScrollArea className='h-[calc(100vh-6rem)]'>
            <nav className='p-2 space-y-1'>
              <div className='px-2 text-xs text-muted-foreground mb-2'>Quản trị</div>
              {adminMenuItems.map(renderMenuItem)}

              <Separator className='my-4' />

              <div className='px-2 text-xs text-muted-foreground mb-2'>Hỗ trợ</div>
              {adminSupportMenuItems.map(renderMenuItem)}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
