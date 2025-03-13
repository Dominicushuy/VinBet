'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { adminMenuItems, adminSupportMenuItems } from '@/config/adminMenuItems'

export const AdminSidebar = React.memo(function AdminSidebar() {
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

  // Check if an item or any of its subitems are active
  const isItemActive = item => {
    if (item.href && pathname === item.href) return true
    if (item.subitems) {
      return item.subitems.some(subitem => pathname === subitem.href)
    }
    return false
  }

  return (
    <aside className='hidden md:block w-72'>
      <div className='sticky top-24'>
        <ScrollArea className='h-[calc(100vh-6rem)]'>
          <div className='px-3 py-4 space-y-6'>
            {/* Main Navigation */}
            <Card className='rounded-xl border bg-card shadow-sm'>
              <nav className='p-2 space-y-1.5'>
                {adminMenuItems.map(item => {
                  // Items with subitems (expandable groups)
                  if (item.subitems) {
                    const isOpen = openGroups[item.title]
                    const isActive = isItemActive(item)

                    return (
                      <NavItemWithSub
                        key={item.title}
                        icon={item.icon}
                        label={item.title}
                        isActive={isActive}
                        subItems={item.subitems}
                        isOpen={isOpen}
                        onToggle={() => toggleGroup(item.title)}
                        pathname={pathname}
                      />
                    )
                  }

                  // Regular menu item
                  return (
                    <NavItem
                      key={item.title}
                      href={item.href}
                      icon={item.icon}
                      label={item.title}
                      isActive={pathname === item.href}
                    />
                  )
                })}
              </nav>
            </Card>

            {/* Support Section */}
            <Card className='rounded-xl border bg-card shadow-sm'>
              <div className='p-2 space-y-1.5'>
                <h3 className='px-3 text-xs font-medium text-muted-foreground'>Hỗ trợ</h3>
                <Separator className='my-2' />
                {adminSupportMenuItems.map(item => (
                  <NavItem
                    key={item.title}
                    href={item.href}
                    icon={item.icon}
                    label={item.title}
                    isActive={pathname === item.href}
                  />
                ))}
              </div>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
})

const NavItem = React.memo(function NavItem({ href, icon, label, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors ${
        isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {icon &&
        React.cloneElement(icon, {
          className: cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')
        })}
      <span className='line-clamp-1'>{label}</span>
    </Link>
  )
})

const NavItemWithSub = React.memo(function NavItemWithSub({
  icon,
  label,
  isActive,
  subItems,
  isOpen,
  onToggle,
  pathname
}) {
  return (
    <div className='space-y-1'>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-2.5 py-2 rounded-md transition-colors ${
          isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <div className='flex items-center gap-2 min-w-0'>
          {icon &&
            React.cloneElement(icon, {
              className: cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')
            })}
          <span className='line-clamp-1'>{label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className='pl-6 space-y-1'>
          {subItems.map(item => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                item.href === pathname
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <span className='line-clamp-1'>{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
})

export default AdminSidebar
