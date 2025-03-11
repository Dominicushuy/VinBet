// src/app/(auth)/reset-password/page.jsx
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Đặt lại mật khẩu - VinBet',
  description: 'Đặt lại mật khẩu cho tài khoản VinBet',
}

export default function ResetPasswordPage() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Đặt lại mật khẩu</h1>
        <p className='text-muted-foreground'>
          Tạo mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
