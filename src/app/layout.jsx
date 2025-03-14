import { fontSans, fontHeading } from '@/lib/fonts'
import { Inter } from 'next/font/google'
import './globals.css'
import { ComponentsProvider } from '@/providers/ComponentsProvider'
import NextTopLoader from 'nextjs-toploader'
import { ThemeProvider } from 'next-themes'
// import { initializeRealtimeSubscriptions } from '@/lib/supabase/realtime'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

// initializeRealtimeSubscriptions()

export const metadata = {
  title: 'VinBet - Nền tảng cá cược trực tuyến',
  description:
    'Nền tảng cá cược bao gồm Authentication, Game & Cược, Tài chính, Thông báo, Referral, và Quản trị toàn diện.',
  openGraph: {
    title: 'VinBet - Cá cược hiện đại',
    description:
      'Khám phá hệ thống nhiều module: Quản lý người dùng, Game & Cược, Tài chính, Thông báo, Referral, và Admin Dashboard cho quản trị toàn diện.',
    url: 'https://vinbet.netlify.app',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VinBet Online Betting'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@VinBet',
    title: 'VinBet - Nền tảng cá cược tích hợp đa tính năng',
    description:
      'Cung cấp các chức năng gồm đăng nhập, đăng ký, quản lý tài khoản, nạp/rút tiền, đặt cược, thông báo, giới thiệu bạn bè, và hệ thống admin mạnh mẽ.',
    images: ['/images/og-image.jpg']
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang='vi' className={`${fontSans.variable} ${fontHeading.variable}`}>
      <body className={inter.variable}>
        <NextTopLoader />
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
          <ComponentsProvider>{children}</ComponentsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
