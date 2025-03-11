import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const Footer = React.memo(function Footer() {
  return (
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
  )
})

export default Footer
