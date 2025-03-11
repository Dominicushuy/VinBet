'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Home,
  DollarSign,
  User,
  Award,
  Gamepad as GameController,
  Menu as MenuIcon,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  CreditCard,
  History,
  Wallet,
  Users,
  BarChart2
} from 'lucide-react'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useAuth } from '@/hooks/useAuth'
// import { useNotificationListener } from '@/hooks/useNotificationListener'

function NavItem({ href, icon, label, isActive, onClick, badge }) {
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
}

function NavItemWithSub({ icon, label, isActive, subItems, isOpen, onToggle }) {
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
}

export function MainLayout({ children }) {
  // *** HOOKS ***
  // useNotificationListener()

  // *** STATE ***
  const [isOpen, setIsOpen] = useState(false)
  const [openSubMenus, setOpenSubMenus] = useState({})
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const closeSheet = () => setIsOpen(false)

  const toggleSubMenu = key => {
    setOpenSubMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const checkIsActive = href => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const mainNavItems = [
    { key: 'home', href: '/', label: 'Trang chủ', icon: <Home size={20} /> },
    {
      key: 'games',
      href: '/games',
      label: 'Trò chơi',
      icon: <GameController size={20} />,
      subItems: [
        { href: '/games', label: 'Tất cả trò chơi' },
        { href: '/games/active', label: 'Đang diễn ra' },
        { href: '/games/results', label: 'Kết quả' }
      ]
    },
    {
      key: 'finance',
      href: '/finance',
      label: 'Tài chính',
      icon: <DollarSign size={20} />,
      subItems: [
        { href: '/finance', label: 'Tổng quan', icon: <BarChart2 size={16} /> },
        { href: '/finance/deposit', label: 'Nạp tiền', icon: <Wallet size={16} /> },
        { href: '/finance/withdrawal', label: 'Rút tiền', icon: <CreditCard size={16} /> },
        { href: '/finance/transactions', label: 'Lịch sử giao dịch', icon: <History size={16} /> }
      ]
    },
    {
      key: 'account',
      href: '/profile',
      label: 'Tài khoản',
      icon: <User size={20} />,
      subItems: [
        { href: '/profile', label: 'Hồ sơ cá nhân', icon: <User size={16} /> },
        { href: '/profile?tab=password', label: 'Đổi mật khẩu', icon: <Settings size={16} /> },
        { href: '/profile?tab=stats', label: 'Thống kê', icon: <BarChart2 size={16} /> }
      ]
    },
    {
      key: 'referrals',
      href: '/referrals',
      label: 'Giới thiệu',
      icon: <Award size={20} />
    }
  ]

  const getUserInitial = () => {
    if (profile?.display_name) return profile.display_name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return 'U'
  }

  const formatCurrency = amount => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            {/* Left side - logo and mobile menu */}
            <div className='flex items-center gap-4'>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='md:hidden'>
                    <MenuIcon size={20} />
                    <span className='sr-only'>Menu</span>
                  </Button>
                </SheetTrigger>
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
                          <AvatarFallback className='bg-primary text-primary-foreground'>
                            {getUserInitial()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {profile?.display_name || profile?.username || 'Người dùng'}
                          </span>
                          <span className='text-xs text-muted-foreground'>{profile?.email || 'user@example.com'}</span>
                        </div>
                      </div>
                      <div className='flex items-center justify-between rounded-lg bg-muted p-3'>
                        <span className='text-sm'>Số dư:</span>
                        <span className='font-bold text-primary'>{formatCurrency(profile?.balance || 0)}</span>
                      </div>
                      <div className='flex gap-2'>
                        <Button asChild size='sm' className='flex-1'>
                          <Link href='/finance/deposit'>Nạp tiền</Link>
                        </Button>
                        <Button asChild size='sm' variant='outline' className='flex-1'>
                          <Link href='/finance/withdrawal'>Rút tiền</Link>
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
                            />
                          )
                        }
                        return (
                          <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            isActive={pathname === item.href}
                            onClick={closeSheet}
                          />
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

              {/* Logo */}
              <Link href='/' className='flex items-center gap-2'>
                <div className='h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-sm'>
                  <span className='text-primary-foreground font-bold text-lg'>VB</span>
                </div>
                <span className='hidden font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent sm:inline-block'>
                  VinBet
                </span>
              </Link>

              {/* Desktop horizontal nav */}
              <nav className='hidden md:flex ml-6 gap-1'>
                {mainNavItems.slice(0, 4).map(item => (
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

            {/* Right side - balance, notifications, avatar */}
            <div className='flex items-center gap-3'>
              {/* Notification */}
              <NotificationDropdown />

              {/* Balance */}
              <Button variant='outline' size='sm' asChild className='hidden sm:flex'>
                <Link href='/finance/deposit'>
                  <DollarSign size={16} className='mr-2 text-primary' />
                  <span className='font-semibold'>{formatCurrency(profile?.balance || 0)}</span>
                </Link>
              </Button>

              {/* User Menu */}
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
                    <Link href='/help' className='cursor-pointer'>
                      <HelpCircle className='mr-2 h-4 w-4' />
                      <span>Trợ giúp</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive focus:text-destructive cursor-pointer'
                    onClick={signOut}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1'>
        <div className='max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]'>
            {/* Sidebar - Hidden on mobile */}
            <aside className='hidden md:block'>
              <div className='flex flex-col gap-6 sticky top-24'>
                {/* User Info Card */}
                <div className='rounded-xl border bg-card p-4 space-y-4 shadow-sm'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-12 w-12 border-2 border-primary'>
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
                      <AvatarFallback className='bg-primary text-primary-foreground'>{getUserInitial()}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>
                        {profile?.display_name || profile?.username || 'Người dùng'}
                      </span>
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
                </div>

                {/* Navigation */}
                <div className='rounded-xl border bg-card shadow-sm'>
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
                          isActive={pathname === item.href}
                        />
                      )
                    })}
                  </nav>
                </div>

                {/* Referral card */}
                <div className='rounded-xl border bg-card p-4 space-y-3 shadow-sm'>
                  <h3 className='font-semibold flex items-center gap-2'>
                    <Award size={16} className='text-primary' />
                    Giới thiệu bạn bè
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Nhận ngay 50.000đ khi giới thiệu bạn bè đăng ký và nạp tiền
                  </p>
                  <Button asChild size='sm' variant='outline' className='w-full'>
                    <Link href='/referrals'>Giới thiệu ngay</Link>
                  </Button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className='min-w-0 overflow-hidden'>
              <div className='bg-background rounded-xl p-4 sm:p-6 shadow-sm border'>{children}</div>
            </main>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='border-t bg-card mt-10'>
        <div className='max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
            {/* Logo and about */}
            <div className='flex flex-col gap-4 md:col-span-4'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-full bg-primary flex items-center justify-center'>
                  <span className='text-primary-foreground font-bold text-xl'>VB</span>
                </div>
                <span className='text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
                  VinBet
                </span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Nền tảng cá cược trực tuyến hàng đầu Việt Nam, cung cấp trải nghiệm đặt cược an toàn và công bằng.
              </p>
              <div className='flex gap-4'>
                <div className='h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer'>
                  <span className='text-primary'>FB</span>
                </div>
                <div className='h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer'>
                  <span className='text-primary'>TW</span>
                </div>
                <div className='h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors cursor-pointer'>
                  <span className='text-primary'>TG</span>
                </div>
              </div>
            </div>

            {/* Links - Sản phẩm */}
            <div className='space-y-4 md:col-span-2'>
              <h4 className='font-medium text-foreground'>Sản phẩm</h4>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <Link href='/games' className='hover:text-primary transition-colors'>
                    Trò chơi
                  </Link>
                </li>
                <li>
                  <Link href='/games/active' className='hover:text-primary transition-colors'>
                    Lượt chơi đang diễn ra
                  </Link>
                </li>
                <li>
                  <Link href='/games/results' className='hover:text-primary transition-colors'>
                    Kết quả trò chơi
                  </Link>
                </li>
                <li>
                  <Link href='/referrals' className='hover:text-primary transition-colors'>
                    Chương trình giới thiệu
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links - Về chúng tôi */}
            <div className='space-y-4 md:col-span-2'>
              <h4 className='font-medium text-foreground'>Về chúng tôi</h4>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <Link href='/about' className='hover:text-primary transition-colors'>
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link href='/terms' className='hover:text-primary transition-colors'>
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li>
                  <Link href='/privacy' className='hover:text-primary transition-colors'>
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href='/responsibility' className='hover:text-primary transition-colors'>
                    Chơi có trách nhiệm
                  </Link>
                </li>
              </ul>
            </div>

            {/* Liên hệ */}
            <div className='space-y-4 md:col-span-4'>
              <h4 className='font-medium text-foreground'>Liên hệ</h4>
              <ul className='space-y-3 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>Email:</span>
                  <span>support@vinbet.com</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>Hotline:</span>
                  <span>1900 9999</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>Giờ làm việc:</span>
                  <span>24/7</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary'>Telegram:</span>
                  <span>@vinbet_support</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className='my-6' />

          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <Badge variant='outline' className='text-xs p-1'>
                Đã xác minh
              </Badge>
              <Badge variant='outline' className='text-xs p-1'>
                Bảo mật SSL
              </Badge>
              <Badge variant='outline' className='text-xs p-1'>
                Chơi có trách nhiệm
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>© 2024 VinBet. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
