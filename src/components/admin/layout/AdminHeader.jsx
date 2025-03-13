'use client'

import { useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell, Sun, Moon, Search, User, LogOut, Settings, Menu, Shield, Activity, CreditCard, Zap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { ResponsiveAdminMenu } from './ResponsiveAdminMenu'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationsQuery } from '@/hooks/queries/useNotificationQueries'

export function AdminHeader({ userProfile }) {
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const { data: notificationData } = useNotificationsQuery({ type: 'admin', unreadOnly: true })

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }, [signOut])

  // Render theme toggle only on client-side
  const renderThemeToggle = () => {
    if (!isMounted) return null

    return (
      <Button
        variant='ghost'
        size='icon'
        onClick={toggleTheme}
        aria-label={`Chuyển sang chế độ ${theme === 'dark' ? 'sáng' : 'tối'}`}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </Button>
    )
  }

  return (
    <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center gap-4'>
            <ResponsiveAdminMenu />

            <Link href='/admin/dashboard' className='flex items-center gap-2'>
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
          </div>

          <div className='hidden md:flex items-center gap-2 md:gap-4 lg:gap-6'>
            <div className='relative w-full max-w-[300px]'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Tìm kiếm...'
                className='w-full pl-8 rounded-full bg-muted'
                aria-label='Tìm kiếm'
              />
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='icon' aria-label='Thông báo' asChild>
              <Link href='/admin/notifications'>
                <Bell size={20} />
                {notificationData?.count > 0 && (
                  <span
                    className='absolute top-0 right-0 flex h-3 w-3 rounded-full 
                  bg-red-500 text-white items-center justify-center text-[0.6rem]'
                  >
                    {notificationData.count}
                  </span>
                )}
              </Link>
            </Button>

            {renderThemeToggle()}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='rounded-full h-8 w-8 overflow-hidden'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={userProfile?.avatar} alt={userProfile?.name || 'Avatar'} />
                    <AvatarFallback>{userProfile?.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-64'>
                <DropdownMenuLabel>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage src={userProfile?.avatar} alt={userProfile?.name || 'Avatar'} />
                      <AvatarFallback>{userProfile?.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium'>{userProfile?.name}</p>
                      <p className='text-xs text-muted-foreground truncate'>{userProfile?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href='/admin/profile' className='cursor-pointer flex items-center'>
                      <User size={16} className='mr-2' />
                      Thông tin cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/admin/profile/activity' className='cursor-pointer flex items-center'>
                      <Activity size={16} className='mr-2' />
                      Nhật ký hoạt động
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/admin/settings' className='cursor-pointer flex items-center'>
                      <Settings size={16} className='mr-2' />
                      Cài đặt hệ thống
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href='/admin/payments' className='cursor-pointer flex items-center'>
                      <CreditCard size={16} className='mr-2' />
                      Quản lý thanh toán
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/admin/users' className='cursor-pointer flex items-center'>
                      <Shield size={16} className='mr-2' />
                      Quản trị người dùng
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className='cursor-pointer text-destructive focus:text-destructive'
                >
                  <LogOut size={16} className='mr-2' />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
