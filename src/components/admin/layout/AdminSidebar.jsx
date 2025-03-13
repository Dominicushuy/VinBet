'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { adminMenuItems, adminSupportMenuItems } from '@/config/adminMenuItems'

export const AdminSidebar = React.memo(function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openGroups, setOpenGroups] = useState({})

  // Check if a menu item is active based on pathname and query params
  const isPathActive = itemPath => {
    if (!itemPath) return false

    // Extract base path and query params from itemPath
    const [basePath, queryString] = itemPath.split('?')

    // If paths don't match, return false immediately
    if (!pathname.startsWith(basePath)) return false

    // If there are no query params in the item path, then it's active
    if (!queryString) return true

    // Parse query params from item path
    const itemParams = new URLSearchParams(queryString)

    // Check if all query params in the item match the current URL
    for (const [key, value] of itemParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }

    return true
  }

  // Check if an item or any of its subitems are active
  const isItemActive = item => {
    if (item.href && isPathActive(item.href)) return true
    if (item.subitems) {
      return item.subitems.some(subitem => isPathActive(subitem.href))
    }
    return false
  }

  // Initialize open groups and update them when pathname or search params change
  useEffect(() => {
    const newOpenGroups = {}

    // Open parent groups when a child is active
    adminMenuItems.forEach(item => {
      if (item.group && item.subitems) {
        const hasActiveChild = item.subitems.some(subitem => isPathActive(subitem.href))
        if (hasActiveChild) {
          newOpenGroups[item.group] = true
        }
      }
    })

    setOpenGroups(prev => ({
      ...prev,
      ...newOpenGroups
    }))
  }, [pathname, searchParams])

  // Toggle group expansion
  const toggleGroup = group => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
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
                  if (item.subitems && item.group) {
                    const isOpen = openGroups[item.group] || false
                    const isActive = isItemActive(item)

                    return (
                      <NavItemWithSub
                        key={item.title}
                        icon={item.icon}
                        label={item.title}
                        isActive={isActive}
                        subItems={item.subitems}
                        isOpen={isOpen}
                        onToggle={() => toggleGroup(item.group)}
                        isPathActive={isPathActive}
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
                      isActive={isPathActive(item.href)}
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
                    isActive={isPathActive(item.href)}
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
        isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {icon &&
        React.cloneElement(icon, {
          className: cn('h-4 w-4 flex-shrink-0', isActive ? 'text-accent-foreground' : 'text-muted-foreground')
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
  isPathActive
}) {
  return (
    <div className='space-y-1'>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-2.5 py-2 rounded-md transition-colors ${
          isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <div className='flex items-center gap-2 min-w-0'>
          {icon &&
            React.cloneElement(icon, {
              className: cn('h-4 w-4 flex-shrink-0', isActive ? 'text-accent-foreground' : 'text-muted-foreground')
            })}
          <span className='line-clamp-1'>{label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className='pl-6 space-y-1'>
          {subItems.map(item => {
            const isSubItemActive = isPathActive(item.href)
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                  isSubItemActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className='line-clamp-1'>{item.title}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
})

export default AdminSidebar
