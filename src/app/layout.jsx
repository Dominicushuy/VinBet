import { fontSans, fontHeading } from '@/lib/fonts'
import { Inter } from 'next/font/google'
import './globals.css'
import { ComponentsProvider } from '@/providers/ComponentsProvider'
import NextTopLoader from 'nextjs-toploader'
// import { initializeRealtimeSubscriptions } from '@/lib/supabase/realtime'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

// initializeRealtimeSubscriptions()

export const metadata = {
  title: 'VinBet - Nền tảng cá cược trực tuyến',
  description: 'Tham gia cá cược, đặt cược theo con số và nhận thưởng dựa trên kết quả trò chơi'
}

export default function RootLayout({ children }) {
  return (
    <html lang='vi' className={`${fontSans.variable} ${fontHeading.variable}`}>
      <body className={inter.variable}>
        <NextTopLoader />
        <ComponentsProvider>{children}</ComponentsProvider>
      </body>
    </html>
  )
}
