// src/app/(auth)/forgot-password/page.jsx
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Quên mật khẩu - VinBet',
  description: 'Khôi phục mật khẩu tài khoản VinBet',
}

export default function ForgotPasswordPage() {
  return (
    <div className='space-y-6'>
      <ForgotPasswordForm />

      <div className='text-center text-sm'>
        <p>
          <Link
            href='/login'
            className='text-primary hover:underline font-medium'>
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
