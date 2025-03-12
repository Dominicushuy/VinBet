// src/app/(auth)/login/page.jsx
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Đăng nhập - VinBet',
  description: 'Đăng nhập vào tài khoản VinBet của bạn'
}

export default function LoginPage() {
  return (
    <div className='space-y-6'>
      <LoginForm />
    </div>
  )
}
