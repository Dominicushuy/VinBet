// src/app/(auth)/layout.jsx
import Link from 'next/link'

export default function AuthLayout({ children }) {
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      {/* Banner side */}
      <div className='hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-8 flex-col justify-between relative overflow-hidden'>
        {/* Background pattern */}
        <div className='absolute inset-0 bg-grid-white/5 bg-[size:16px_16px] opacity-30'></div>
        <div className='absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent'></div>

        <div className='relative z-10'>
          <div className='flex items-center gap-2'>
            <div className='h-10 w-10 rounded-full bg-white flex items-center justify-center'>
              <span className='text-primary font-bold text-xl'>VB</span>
            </div>
            <h1 className='text-white font-bold text-2xl'>VinBet</h1>
          </div>
        </div>

        <div className='relative z-10 space-y-6 max-w-lg'>
          <h2 className='text-white text-4xl font-bold leading-tight'>
            Nền tảng cá cược trực tuyến hàng đầu Việt Nam
          </h2>
          <p className='text-white/80 text-lg'>
            Đặt cược dễ dàng, rút tiền nhanh chóng và trải nghiệm những ván chơi
            hấp dẫn
          </p>

          {/* Features */}
          <div className='space-y-3 mt-4'>
            <div className='flex items-center gap-2'>
              <div className='h-6 w-6 rounded-full bg-white/20 flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-3 w-3 text-white'
                  viewBox='0 0 20 20'
                  fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <span className='text-white/90 text-sm'>
                Giao dịch an toàn và bảo mật
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-6 w-6 rounded-full bg-white/20 flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-3 w-3 text-white'
                  viewBox='0 0 20 20'
                  fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <span className='text-white/90 text-sm'>
                Rút tiền trong vòng 24 giờ
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-6 w-6 rounded-full bg-white/20 flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-3 w-3 text-white'
                  viewBox='0 0 20 20'
                  fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <span className='text-white/90 text-sm'>
                Tỷ lệ thắng cao và minh bạch
              </span>
            </div>
          </div>
        </div>

        <div className='relative z-10 text-white/60 text-sm'>
          © 2024 VinBet. All rights reserved.
        </div>
      </div>

      {/* Content side */}
      <div className='flex-1 flex flex-col bg-background'>
        <div className='flex items-center justify-between p-4 md:p-6 border-b md:hidden'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
              <span className='text-white font-bold text-base'>VB</span>
            </div>
            <h1 className='text-primary font-bold text-xl'>VinBet</h1>
          </div>
          <div>
            <Link
              href='/'
              className='text-sm text-muted-foreground hover:text-primary hover:underline'>
              Trang chủ
            </Link>
          </div>
        </div>

        <div className='flex-1 flex flex-col justify-center p-6 md:p-10 max-w-md mx-auto w-full'>
          {children}
        </div>

        <div className='p-4 border-t text-center text-xs text-muted-foreground md:hidden'>
          © 2024 VinBet. All rights reserved.
        </div>
      </div>
    </div>
  )
}
