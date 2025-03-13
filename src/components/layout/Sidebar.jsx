'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatUtils'
import { ChevronDown } from 'lucide-react'
import { userMenuItems } from '@/config/userMenuItems'

export const Sidebar = React.memo(function Sidebar({ profile }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openSubMenus, setOpenSubMenus] = useState({})

  // Check if a path is active with possible query params
  const checkIsActive = itemPath => {
    if (!itemPath) return false

    // Extract base path and query params from itemPath
    const [basePath, queryString] = itemPath.split('?')

    // Check base path match
    const basePathMatch = pathname === basePath || pathname.startsWith(`${basePath}/`)
    if (!basePathMatch) return false

    // If there are no query params in the item path, it's active based on path alone
    if (!queryString) return basePathMatch

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
    if (item.href && checkIsActive(item.href)) return true
    if (item.subItems) {
      return item.subItems.some(subitem => checkIsActive(subitem.href))
    }
    return false
  }

  // Toggle submenu open/close
  const toggleSubMenu = key => {
    setOpenSubMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Initialize open menus based on active paths
  useEffect(() => {
    const newOpenSubMenus = {}

    userMenuItems.forEach(item => {
      if (item.key && item.subItems) {
        // Open submenu if it or any of its items are active
        const hasActiveChild = isItemActive(item)
        if (hasActiveChild) {
          newOpenSubMenus[item.key] = true
        }
      }
    })

    setOpenSubMenus(prev => ({
      ...prev,
      ...newOpenSubMenus
    }))
  }, [pathname, searchParams])

  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return 'U'
  }

  return (
    <aside className='hidden md:block w-60'>
      <div className='flex flex-col gap-6 sticky top-24'>
        {/* User Info Card */}
        <Card className='rounded-xl border bg-card p-4 space-y-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-12 w-12 border-2 border-primary'>
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
              <AvatarFallback className='bg-primary text-primary-foreground'>{getUserInitial()}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='font-semibold'>{profile?.display_name || profile?.username || 'Người dùng'}</span>
              <span className='text-xs text-muted-foreground truncate max-w-[140px]'>
                {profile?.email || 'user@example.com'}
              </span>
            </div>
          </div>

          <Separator />

          <div className='flex flex-col gap-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Số dư:</span>
              <span className='font-bold text-primary'>{formatCurrency(profile?.balance || 0)}</span>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <Button asChild size='sm' className='w-full'>
                <Link href='/finance/deposit'>Nạp tiền</Link>
              </Button>
              <Button asChild size='sm' variant='outline' className='w-full'>
                <Link href='/finance/withdrawal'>Rút tiền</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <Card className='rounded-xl border bg-card shadow-sm'>
          <nav className='p-3 space-y-2'>
            {userMenuItems.map(item => {
              if (item.subItems) {
                return (
                  <NavItemWithSub
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    isActive={isItemActive(item)}
                    subItems={item.subItems}
                    isOpen={openSubMenus[item.key] || false}
                    onToggle={() => toggleSubMenu(item.key)}
                    checkIsActive={checkIsActive}
                  />
                )
              }
              return (
                <NavItem
                  key={item.key || item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={checkIsActive(item.href)}
                  badge={item.badge}
                />
              )
            })}
          </nav>
        </Card>

        {/* Referral card */}
        <Card className='rounded-xl border bg-card p-4 space-y-3 shadow-sm'>
          <h3 className='font-semibold flex items-center gap-2'>
            <Award size={16} className='text-primary' />
            Giới thiệu bạn bè
          </h3>
          <p className='text-sm text-muted-foreground'>Nhận ngay 50.000đ khi giới thiệu bạn bè đăng ký và nạp tiền</p>
          <Button asChild size='sm' variant='outline' className='w-full'>
            <Link href='/referrals'>Giới thiệu ngay</Link>
          </Button>
        </Card>
      </div>
    </aside>
  )
})

const NavItem = React.memo(function NavItem({ href, icon, label, isActive, onClick, badge }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
        isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <div className='flex items-center gap-3'>
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <Badge variant='secondary' className='ml-auto'>
          {badge}
        </Badge>
      )}
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
  checkIsActive
}) {
  return (
    <div className='space-y-1'>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-3 py-2 rounded-md transition-colors ${
          isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <div className='flex items-center gap-3'>
          {icon}
          <span>{label}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className='pl-9 space-y-1'>
          {subItems.map(item => {
            const isSubItemActive = checkIsActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  isSubItemActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
})

export default Sidebar
