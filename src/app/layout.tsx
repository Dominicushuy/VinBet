// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ComponentsProvider } from '@/providers/ComponentsProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'VinBet - Nền tảng cá cược trực tuyến',
  description:
    'Tham gia cá cược, đặt cược theo con số và nhận thưởng dựa trên kết quả trò chơi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi'>
      <body className={inter.variable}>
        <ComponentsProvider>{children}</ComponentsProvider>
      </body>
    </html>
  )
}
