// src/app/(auth)/forgot-password/page.tsx
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu - VinBet",
  description: "Khôi phục mật khẩu tài khoản VinBet",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      {/* <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Quên mật khẩu</h1>
        <p className='text-muted-foreground'>
          Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
        </p>
      </div> */}

      <ForgotPasswordForm />

      <div className="text-center text-sm">
        <p>
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
