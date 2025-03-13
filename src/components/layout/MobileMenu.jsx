'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { LogOut, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/utils/formatUtils'
import { Badge } from '../ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

function NavItemWithSub({ icon, label, isActive, subItems, isOpen, onToggle, pathname, closeSheet }) {
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
            className='pl-9 space-y-1'
          >
            {subItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                  pathname === item.href ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={closeSheet}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const MobileMenu = React.memo(function MobileMenu({
  isOpen,
  setIsOpen,
  profile,
  signOut,
  mainNavItems,
  openSubMenus,
  toggleSubMenu,
  checkIsActive,
  closeSheet
}) {
  const pathname = usePathname()

  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return 'U'
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side='left' className='w-[280px] sm:w-[320px]'>
        <div className='flex flex-col gap-8 py-4'>
          <div className='flex items-center gap-2'>
            <div className='h-10 w-10 rounded-full bg-primary flex items-center justify-center'>
              <span className='text-primary-foreground font-bold text-xl'>VB</span>
            </div>
            <span className='text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
              VinBet
            </span>
          </div>

          {/* User info in mobile menu */}
          <div className='flex flex-col gap-3 px-2'>
            <div className='flex items-center gap-3'>
              <Avatar className='h-10 w-10 border-2 border-primary'>
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
                <AvatarFallback className='bg-primary text-primary-foreground'>{getUserInitial()}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='font-medium'>{profile?.display_name || profile?.username || 'Người dùng'}</span>
                <span className='text-xs text-muted-foreground'>{profile?.email || 'user@example.com'}</span>
              </div>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-muted p-3'>
              <span className='text-sm'>Số dư:</span>
              <span className='font-bold text-primary'>{formatCurrency(profile?.balance || 0)}</span>
            </div>
            <div className='flex gap-2'>
              <Button asChild size='sm' className='flex-1'>
                <Link onClick={closeSheet} href='/finance/deposit'>
                  Nạp tiền
                </Link>
              </Button>
              <Button asChild size='sm' variant='outline' className='flex-1'>
                <Link onClick={closeSheet} href='/finance/withdrawal'>
                  Rút tiền
                </Link>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Mobile Menu */}
          <nav className='flex flex-col gap-2'>
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
                    pathname={pathname}
                    closeSheet={closeSheet}
                  />
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    checkIsActive(item.href)
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={closeSheet}
                >
                  <div className='flex items-center gap-3'>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          <Separator />

          <Button
            variant='destructive'
            className='flex items-center justify-center gap-2'
            onClick={() => {
              closeSheet()
              signOut()
            }}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
})
