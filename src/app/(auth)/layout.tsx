// src/app/(auth)/layout.tsx
import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Banner side */}
      <div className='hidden md:flex md:w-1/2 bg-primary p-6 flex-col justify-between'>
        <div className='flex items-center gap-2'>
          <div className='h-10 w-10 rounded-full bg-white flex items-center justify-center'>
            <span className='text-primary font-bold text-xl'>VB</span>
          </div>
          <h1 className='text-white font-bold text-2xl'>VinBet</h1>
        </div>

        <div className='space-y-6 max-w-md'>
          <h2 className='text-white text-3xl font-bold'>
            Chào mừng đến với nền tảng cá cược trực tuyến hàng đầu
          </h2>
          <p className='text-white/80'>
            Đặt cược, trải nghiệm những ván chơi hấp dẫn và nhận thưởng tức thì
          </p>
        </div>

        <div className='text-white/60 text-sm'>
          © 2024 VinBet. All rights reserved.
        </div>
      </div>

      {/* Content side */}
      <div className='flex-1 flex flex-col p-6 md:p-10 md:justify-center'>
        <div className='md:hidden flex items-center gap-2 mb-8'>
          <div className='h-10 w-10 rounded-full bg-primary flex items-center justify-center'>
            <span className='text-white font-bold text-xl'>VB</span>
          </div>
          <h1 className='text-primary font-bold text-2xl'>VinBet</h1>
        </div>

        <div className='w-full max-w-md mx-auto'>{children}</div>
      </div>
    </div>
  )
}
