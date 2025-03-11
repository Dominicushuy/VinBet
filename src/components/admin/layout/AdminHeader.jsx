'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Bell, Sun, Moon, Search, User, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ResponsiveAdminMenu } from './ResponsiveAdminMenu' // Import ResponsiveAdminMenu
import { useAuth } from '@/hooks/useAuth'

export function AdminHeader({ userProfile }) {
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Xử lý mounted để tránh hydration error
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
      toast.success('Đăng xuất thành công')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }

  // Chỉ render khi đã mounted để tránh hydration error
  if (!mounted) {
    return (
      <header className='sticky top-0 z-40 border-b bg-background'>
        <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
          {/* Placeholder skeleton */}
        </div>
      </header>
    )
  }

  return (
    <header className='sticky top-0 z-40 border-b bg-background'>
      <div className='container flex h-16 items-center justify-between px-4 md:px-6'>
        <div className='flex items-center gap-4'>
          {/* Thay thế nút toggle bằng component ResponsiveAdminMenu */}
          <ResponsiveAdminMenu />

          <Link href='/admin/dashboard' className='flex items-center gap-2'>
            <span className='text-xl font-bold'>VinBet</span>
            <Badge variant='outline'>Admin</Badge>
          </Link>
        </div>

        <div className='hidden md:flex items-center gap-2 md:gap-4 lg:gap-6'>
          <div className='relative w-full max-w-[300px]'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input type='search' placeholder='Tìm kiếm...' className='w-full pl-8 rounded-full bg-muted' />
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon'>
            <Bell size={20} />
            <span className='sr-only'>Thông báo</span>
            <span className='absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-600'></span>
          </Button>

          <Button variant='ghost' size='icon' onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className='sr-only'>Chuyển chế độ</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='rounded-full h-8 w-8 overflow-hidden'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={userProfile?.avatar} />
                  <AvatarFallback>{userProfile?.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <div className='px-2 py-1.5'>
                <p className='text-sm font-medium'>{userProfile?.name}</p>
                <p className='text-xs text-muted-foreground truncate'>{userProfile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href='/admin/profile' className='cursor-pointer flex items-center'>
                  <User size={16} className='mr-2' />
                  Thông tin cá nhân
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/admin/settings' className='cursor-pointer flex items-center'>
                  <Settings size={16} className='mr-2' />
                  Cài đặt hệ thống
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className='cursor-pointer text-red-600 focus:text-red-600'>
                <LogOut size={16} className='mr-2' />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
