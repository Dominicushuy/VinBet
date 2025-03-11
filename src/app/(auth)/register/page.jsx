// src/app/(auth)/register/page.jsx
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Đăng ký - VinBet',
  description: 'Tạo tài khoản VinBet mới',
}

export default function RegisterPage() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Đăng ký tài khoản</h1>
        <p className='text-muted-foreground'>
          Nhập thông tin để tạo tài khoản mới
        </p>
      </div>

      <RegisterForm />

      <div className='text-center text-sm'>
        <p>
          Đã có tài khoản?{' '}
          <Link
            href='/login'
            className='text-primary hover:underline font-medium'>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
