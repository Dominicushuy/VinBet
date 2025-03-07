// src/app/(auth)/login/page.tsx
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng nhập - VinBet',
  description: 'Đăng nhập vào tài khoản VinBet của bạn',
}

export default function LoginPage() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Đăng nhập</h1>
        <p className='text-muted-foreground'>
          Nhập thông tin đăng nhập để truy cập tài khoản của bạn
        </p>
      </div>

      <LoginForm />

      <div className='text-center text-sm'>
        <p>
          Chưa có tài khoản?{' '}
          <Link
            href='/register'
            className='text-primary hover:underline font-medium'>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}
