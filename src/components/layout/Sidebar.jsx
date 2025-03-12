import React from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatUtils'
import { ChevronDown } from 'lucide-react'

export const Sidebar = React.memo(function Sidebar({
  profile,
  mainNavItems,
  openSubMenus,
  toggleSubMenu,
  checkIsActive
}) {
  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return 'U'
  }

  return (
    <aside className='hidden md:block'>
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
            {mainNavItems.map(item => {
              if (item.subItems) {
                return (
                  <NavItemWithSub
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    isActive={checkIsActive(item.href)}
                    subItems={item.subItems}
                    isOpen={openSubMenus[item.key] || false}
                    onToggle={() => toggleSubMenu(item.key)}
                  />
                )
              }
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={checkIsActive(item.href)}
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
        isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
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

const NavItemWithSub = React.memo(function NavItemWithSub({ icon, label, isActive, subItems, isOpen, onToggle }) {
  return (
    <div className='space-y-1'>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-3 py-2 rounded-md transition-colors ${
          isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'
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
          {subItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className='flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground'
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
})
