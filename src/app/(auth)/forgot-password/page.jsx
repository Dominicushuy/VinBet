// src/app/(auth)/forgot-password/page.jsx
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Quên mật khẩu - VinBet',
  description: 'Khôi phục mật khẩu tài khoản VinBet'
}

export default function ForgotPasswordPage() {
  return (
    <div className='space-y-6'>
      <ForgotPasswordForm />
    </div>
  )
}
