'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import Footer from './Footer'
import { MobileMenu } from './MobileMenu'
import {
  Home,
  DollarSign,
  User,
  Award,
  Gamepad as GameController,
  Settings,
  CreditCard,
  History,
  Wallet,
  BarChart2,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function MainLayout({ children }) {
  const mainNavItems = useMemo(
    () => [
      {
        key: 'home',
        href: '/',
        label: 'Trang chủ',
        icon: <Home size={20} />
      },
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
    ],
    []
  )

  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [openSubMenus, setOpenSubMenus] = useState(() => {
    // Initialize based on current pathname
    const initialState = {}
    mainNavItems.forEach(item => {
      if (item.subItems) {
        initialState[item.key] = item.subItems.some(subitem => pathname && pathname === subitem.href)
      }
    })
    return initialState
  })

  const { profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side mounting for theme toggle
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const closeSheet = useCallback(() => setIsOpen(false), [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const toggleSubMenu = useCallback(key => {
    setOpenSubMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }, [])

  const checkIsActive = useCallback(
    href => {
      if (href === '/') return pathname === '/'
      return pathname.startsWith(href)
    },
    [pathname]
  )

  // Theme toggle render function for client-side
  const renderThemeToggle = () => {
    if (!isMounted) return null

    return (
      <Button
        variant='ghost'
        size='icon'
        onClick={toggleTheme}
        aria-label={`Chuyển sang chế độ ${theme === 'dark' ? 'sáng' : 'tối'}`}
        className='hidden md:flex'
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </Button>
    )
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <Header
        openSheet={() => setIsOpen(true)}
        profile={profile}
        signOut={signOut}
        navItems={mainNavItems.slice(0, 4)}
        checkIsActive={checkIsActive}
        renderThemeToggle={renderThemeToggle}
      />

      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        profile={profile}
        signOut={signOut}
        mainNavItems={mainNavItems}
        openSubMenus={openSubMenus}
        toggleSubMenu={toggleSubMenu}
        checkIsActive={checkIsActive}
        closeSheet={closeSheet}
      />

      <div className='flex-1'>
        <div className='max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]'>
            <Sidebar
              profile={profile}
              mainNavItems={mainNavItems}
              openSubMenus={openSubMenus}
              toggleSubMenu={toggleSubMenu}
              checkIsActive={checkIsActive}
            />

            <main className='min-w-0 overflow-hidden'>
              <ErrorBoundary
                fallback={
                  <div className='p-8 text-center'>
                    <h3 className='text-xl font-semibold mb-3'>Đã xảy ra lỗi</h3>
                    <p className='mb-4 text-muted-foreground'>Có lỗi khi hiển thị nội dung, vui lòng thử lại sau.</p>
                    <button
                      className='px-4 py-2 bg-primary text-primary-foreground rounded-md'
                      onClick={() => window.location.reload()}
                    >
                      Tải lại trang
                    </button>
                  </div>
                }
              >
                <div className='bg-background rounded-xl p-4 sm:p-6 shadow-sm border overflow-hidden'>{children}</div>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
