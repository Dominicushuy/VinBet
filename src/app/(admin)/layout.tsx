// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kiểm tra session
  const { session } = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  // Kiểm tra quyền admin
  const supabase = getSupabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <nav className="grid items-start gap-2 pt-4">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Quản trị hệ thống
            </h2>
            <Link
              href="/admin/dashboard"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Người dùng
            </Link>
            <Link
              href="/admin/games"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Trò chơi
            </Link>

            <Link
              href="/admin/payments"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Thanh toán
            </Link>

            <Link
              href="/admin/notifications"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Thông báo
            </Link>
          </nav>
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
