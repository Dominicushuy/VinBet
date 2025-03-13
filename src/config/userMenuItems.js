// src/config/userMenuItems.js
import { Bell } from 'lucide-react'
import { Clock } from 'lucide-react'
import { Trophy } from 'lucide-react'
import { Calendar } from 'lucide-react'
import { Gamepad2 } from 'lucide-react'
import { Edit2 } from 'lucide-react'
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
  BarChart2
} from 'lucide-react'

export const userMenuItems = [
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
      { href: '/games?status=all', label: 'Tất cả trò chơi', icon: <Gamepad2 size={16} /> },
      { href: '/games?status=active', label: 'Đang diễn ra', icon: <Clock size={16} /> },
      { href: '/games?status=scheduled', label: 'Sắp diễn ra', icon: <Calendar size={16} /> },
      { href: '/games?status=completed', label: 'Đã kết thúc', icon: <Trophy size={16} /> }
    ]
  },
  {
    key: 'finance',
    href: '/finance/overview',
    label: 'Tài chính',
    icon: <DollarSign size={20} />,
    subItems: [
      { href: '/finance/overview', label: 'Tổng quan', icon: <BarChart2 size={16} /> },
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
      { href: '/profile?tab=overview', label: 'Hồ sơ cá nhân', icon: <User size={16} /> },
      { href: '/profile?tab=edit', label: 'Chỉnh sửa thông tin', icon: <Edit2 size={16} /> },
      { href: '/profile?tab=passwords', label: 'Đổi mật khẩu', icon: <Settings size={16} /> },
      { href: '/profile?tab=notifications', label: 'Thông báo', icon: <Bell size={16} /> },
      { href: '/profile?tab=activity', label: 'Hoạt động', icon: <History size={16} /> }
    ]
  },
  {
    key: 'referrals',
    href: '/referrals',
    label: 'Giới thiệu',
    icon: <Award size={20} />
  }
]
