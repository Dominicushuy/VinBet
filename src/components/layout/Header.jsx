import React from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Menu, LogOut, User, DollarSign, Users, Settings, HelpCircle, Moon, Sun } from 'lucide-react'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { formatCurrency } from '@/utils/formatUtils'
import { MessageSquare } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ShieldCheck } from 'lucide-react'

export const Header = React.memo(function Header({ openSheet, profile, signOut, navItems, checkIsActive }) {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Left side content */}
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' className='md:hidden' onClick={openSheet}>
              <Menu size={20} />
              <span className='sr-only'>Menu</span>
            </Button>

            {/* Logo */}
            <Link href='/' className='flex items-center gap-2'>
              <div className='h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-sm'>
                <span className='text-primary-foreground font-bold text-lg'>VB</span>
              </div>
              <span className='hidden font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent sm:inline-block'>
                VinBet
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className='hidden md:flex ml-6 gap-1'>
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    checkIsActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side content */}
          <div className='flex items-center gap-3'>
            {/* Theme Toggle */}
            {isMounted && (
              <Button
                variant='ghost'
                size='icon'
                onClick={toggleTheme}
                className='hidden md:flex'
                aria-label={`Chuyển sang chế độ ${theme === 'dark' ? 'sáng' : 'tối'}`}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            )}

            <NotificationDropdown />

            <Button variant='outline' size='sm' asChild className='hidden sm:flex'>
              <Link href='/finance/deposit'>
                <DollarSign size={16} className='mr-2 text-primary' />
                <span className='font-semibold'>{formatCurrency(profile?.balance || 0)}</span>
              </Link>
            </Button>

            <UserMenu profile={profile} signOut={signOut} />
          </div>
        </div>
      </div>
    </header>
  )
})

export const UserMenu = React.memo(function UserMenu({ profile, signOut }) {
  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return 'U'
  }

  // Check if user is an admin
  const isAdmin = profile?.is_admin || profile?.user_metadata?.is_admin || profile?.app_metadata?.is_admin

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full h-9 w-9 p-0'>
          <Avatar className='h-9 w-9 border border-input'>
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
            <AvatarFallback className='bg-primary text-primary-foreground'>{getUserInitial()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1'>
            <p className='font-medium'>{profile?.display_name || profile?.username || 'Người dùng'}</p>
            <p className='text-xs text-muted-foreground'>{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Admin Dashboard Link - Conditionally Rendered */}
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href='/admin/dashboard' className='cursor-pointer'>
                <ShieldCheck className='mr-2 h-4 w-4 text-primary' />
                <span>Quản trị hệ thống</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href='/profile' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            <span>Tài khoản</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/finance' className='cursor-pointer'>
            <DollarSign className='mr-2 h-4 w-4' />
            <span>Tài chính</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/referrals' className='cursor-pointer'>
            <Users className='mr-2 h-4 w-4' />
            <span>Giới thiệu bạn bè</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href='/notifications/settings' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            <span>Cài đặt</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/notifications/telegram' className='cursor-pointer'>
            <MessageSquare className='mr-2 h-4 w-4' />
            <span>Kết nối Telegram</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='/help' className='cursor-pointer'>
            <HelpCircle className='mr-2 h-4 w-4' />
            <span>Trợ giúp</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-destructive focus:text-destructive cursor-pointer' onClick={signOut}>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
