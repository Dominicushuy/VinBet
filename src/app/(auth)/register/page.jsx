// src/app/(auth)/register/page.jsx
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Đăng ký - VinBet',
  description: 'Tạo tài khoản VinBet mới'
}

export default function RegisterPage() {
  return (
    <div className='space-y-6'>
      <RegisterForm />
    </div>
  )
}
