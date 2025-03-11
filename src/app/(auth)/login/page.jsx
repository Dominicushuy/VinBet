// src/app/(auth)/login/page.jsx
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Đăng nhập - VinBet',
  description: 'Đăng nhập vào tài khoản VinBet của bạn'
}

export default function LoginPage() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Đăng nhập</h1>
        <p className='text-muted-foreground'>Nhập thông tin đăng nhập để truy cập tài khoản của bạn</p>
      </div>

      <LoginForm />
    </div>
  )
}
