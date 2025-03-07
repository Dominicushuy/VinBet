import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Kiểm tra xem route có được bảo vệ không
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/games") ||
    req.nextUrl.pathname.startsWith("/finance") ||
    req.nextUrl.pathname.startsWith("/referrals") ||
    req.nextUrl.pathname.startsWith("/admin");

  // Chuyển hướng đến trang đăng nhập nếu truy cập vào route được bảo vệ
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Chuyển hướng về dashboard nếu đã đăng nhập mà cố truy cập vào trang auth
  const isAuthRoute = req.nextUrl.pathname.startsWith("/(auth)");
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Routes cần bảo vệ
    "/profile/:path*",
    "/games/:path*",
    "/finance/:path*",
    "/referrals/:path*",
    "/admin/:path*",
    // Auth routes sẽ redirect đến dashboard nếu đã đăng nhập
    "/(auth)/:path*",
  ],
};
