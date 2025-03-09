// src/app/(main)/layout.tsx
import { MainLayout } from "@/components/layout/MainLayout";
import { getUserSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kiểm tra session người dùng
  const { session } = await getUserSession();

  // Nếu không có session, chuyển hướng về trang đăng nhập
  if (!session) {
    redirect("/login");
  }

  return <MainLayout>{children}</MainLayout>;
}
